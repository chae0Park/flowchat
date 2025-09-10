import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../services/database';
import { redis } from '../services/redis';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest, TokenPayload } from '../types';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../services/jwt';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6).max(100)
});

// Helper
const generateTokens = (user: any) => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
};

// Register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  console.log('📢Register request:', req.body);
  const { name, email, password } = registerSchema.parse(req.body);

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ success: false, error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      preferences: {
        theme: 'light',
        language: 'ko',
        notifications: {
          desktop: true,
          email: false,
          sounds: true,
          mentions: true
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      status: true,
      role: true,
      createdAt: true,
      preferences: true
    }
  });

  const { accessToken, refreshToken } = generateTokens(user);

  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  res.status(201).json({
    success: true,
    data: { user, accessToken, refreshToken },
    message: 'User registered successfully'
  });
}));

// Login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      avatar: true,
      status: true,
      role: true,
      createdAt: true,
      preferences: true
    }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  await db.user.update({
    where: { id: user.id },
    data: { lastActive: new Date(), status: 'online' }
  });

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: { user: userWithoutPassword, accessToken, refreshToken },
    message: 'Login successful'
  });
}));

// Refresh Token
//! 9/11 오전 8시 기준 로그인 할 때 여기서 에러 발생하고 있음 
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Missing refresh token' });
  }

  const stored = await db.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  const { accessToken, refreshToken: newRefresh } = generateTokens(stored.user);

  await db.refreshToken.delete({ where: { id: stored.id } });
  await db.refreshToken.create({
    data: {
      token: newRefresh,
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefresh }
  });
}));

// Logout
router.post('/logout', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await db.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  await db.user.update({
    where: { id: req.user!.id },
    data: { status: 'offline' }
  });

  res.json({ success: true, message: 'Logged out' });
}));

// Forgot Password
router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    const resetToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    await redis.set(`password_reset:${user.id}`, resetToken, 3600);

    // TODO: emailService.send(user.email, resetToken)
  }

  res.json({
    success: true,
    message: 'If account exists, reset link has been sent'
  });
}));

// Reset Password
router.post('/reset-password', asyncHandler(async (req:Request, res: Response) => {
  const { token, password } = resetPasswordSchema.parse(req.body);

  try {
    const decoded = verifyRefreshToken(token); // reuse same verify method
    const stored = await redis.get(`password_reset:${decoded.userId}`);
    if (!stored || stored !== token) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.user.update({
      where: { id: decoded.userId },
      data: { password: hashed }
    });

    await redis.del(`password_reset:${decoded.userId}`);
    await db.refreshToken.deleteMany({ where: { userId: decoded.userId } });

    res.json({ success: true, message: 'Password reset complete' });
  } catch {
    res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }
}));

// Current user info
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: req.user });
}));

export default router;
