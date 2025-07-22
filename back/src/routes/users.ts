import express, { Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, PaginatedResponse } from '../types';

const router = express.Router();

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().optional(),
  status: z.string().max(100).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    language: z.string().optional(),
    notifications: z.object({
      desktop: z.boolean().optional(),
      email: z.boolean().optional(),
      sounds: z.boolean().optional(),
      mentions: z.boolean().optional()
    }).optional()
  }).optional()
});

const searchUsersSchema = z.object({
  q: z.string().min(1),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional()
});

// Get current user profile
router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: req.user
  });
}));

// Update current user profile
router.put('/me', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const updateData = updateUserSchema.parse(req.body);

  const updatedUser = await db.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      status: true,
      role: true,
      createdAt: true,
      lastActive: true,
      preferences: true
    }
  });

  res.json({
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully'
  });
}));

// Get user by ID
router.get('/:userId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { userId } = req.params;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      status: true,
      role: true,
      createdAt: true,
      lastActive: true
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

// Search users
router.get('/search', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { q: query, page = 1, limit = 20 } = searchUsersSchema.parse(req.query);

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        lastActive: true
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    }),
    db.user.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      }
    })
  ]);

  const response: PaginatedResponse<any> = {
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };

  res.json(response);
}));

// Update user status
router.patch('/me/status', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { status } = z.object({
    status: z.string().max(100)
  }).parse(req.body);

  await db.user.update({
    where: { id: req.user!.id },
    data: { status, lastActive: new Date() }
  });

  res.json({
    success: true,
    message: 'Status updated successfully'
  });
}));

// Get user's workspaces
router.get('/me/workspaces', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const workspaces = await db.workspaceMember.findMany({
    where: { userId: req.user!.id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          description: true,
          domain: true,
          visibility: true,
          createdAt: true
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });

  res.json({
    success: true,
    data: workspaces.map(wm => ({
      ...wm.workspace,
      role: wm.role,
      joinedAt: wm.joinedAt
    }))
  });
}));

export default router;