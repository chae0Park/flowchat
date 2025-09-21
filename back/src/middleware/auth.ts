import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/database';
import { AuthenticatedRequest, TokenPayload } from '../types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) : Promise<void|any> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    
    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        status: true,
        role: true,
        createdAt: true,
        lastActive: true,
        preferences: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Update last active
    await db.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    req.user = user as any;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

export const requireWorkspaceAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Workspace ID required' 
      });
    }

    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied to workspace' 
      });
    }

    req.body.workspaceMembership = membership;
    return next();
  } catch (error) {
    console.error('Workspace access middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

export const requireChannelAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const channelId = req.params.channelId || req.body.channelId;
    
    if (!channelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Channel ID required' 
      });
    }

    const membership = await db.channelMember.findFirst({
      where: {
        channelId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied to channel' 
      });
    }

    return next();
  } catch (error) {
    console.error('Channel access middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};