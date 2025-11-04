import express, { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireWorkspaceAccess, requireChannelAccess } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Validation schemas
const createChannelSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(50).regex(/^[a-z0-9-_]+$/),
  description: z.string().max(500).optional(),
  type: z.enum(['CHANNEL']),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  members: z.array(z.string()).optional()
});

const updateChannelSchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-z0-9-_]+$/).optional(),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional()
});

// Create channel
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, name, description, type, visibility, members } = createChannelSchema.parse(req.body);

  //워크스페이스 안의 멤버들 찾음 
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId, userId: req.user!.id }
  });

  //없으면 403 Forbidden 띄움
  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  // 워크스페이스 찾음
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true }
  });

  //todo: settings 타입 찾기
  const settings = workspace?.settings as any; 
  const allowChannelCreation = settings?.allowChannelCreation || 'admin';

  if (allowChannelCreation === 'owner' && workspaceMember.role !== 'OWNER') {
    return res.status(403).json({
      success: false,
      error: 'Only workspace owners can create channels'
    });
  }

  if (allowChannelCreation === 'admin' && !['OWNER', 'ADMIN'].includes(workspaceMember.role)) {
    return res.status(403).json({
      success: false,
      error: 'Only admins and owners can create channels'
    });
  }

  // Check if channel name already exists in workspace
  const existingChannel = await db.channel.findFirst({
    where: { workspaceId, name }
  });

  if (existingChannel) {
    return res.status(409).json({
      success: false,
      error: 'Channel name already exists'
    });
  }

  // Create channel
  const channel = await db.channel.create({
    data: {
      workspaceId,
      name,
      description,
      type,
      visibility,
      createdBy: req.user!.id,
      members: {
        create: [
          { userId: req.user!.id }, // Creator is always a member
          ...(members || []).map(userId => ({ userId }))
        ]
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        }
      },
      creator: {
        select: { id: true, name: true, avatar: true }
      },
      _count: {
        select: { messages: true, members: true }
      }
    }
  });

  return res.status(201).json({
    success: true,
    data: channel,
    message: 'Channel created successfully'
  });
}));

// Get workspace channels
router.get('/workspace/:workspaceId', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.params;

  const channels = await db.channel.findMany({
    where: {
      workspaceId,
      OR: [
        { visibility: 'PUBLIC' },
        { members: { some: { userId: req.user!.id } } }
      ]
    },
    include: {
      _count: {
        select: { messages: true, members: true }
      },
      members: {
        where: { userId: req.user!.id },
        select: { userId: true }
      }
    },
    orderBy: [
      { type: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  // Add unread count (simplified - in production, track last read message)
  const channelsWithUnread = channels.map(channel => ({
    ...channel,
    unreadCount: Math.floor(Math.random() * 5), // Mock unread count
    isMember: channel.members.length > 0
  }));

  res.json({
    success: true,
    data: channelsWithUnread
  });
}));

// Get channel by ID
router.get('/:channelId', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { channelId } = req.params;

  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, status: true }
          }
        }
      },
      creator: {
        select: { id: true, name: true, avatar: true }
      },
      workspace: {
        select: { id: true, name: true }
      },
      _count: {
        select: { messages: true }
      }
    }
  });

  if (!channel) {
    return res.status(404).json({
      success: false,
      error: 'Channel not found'
    });
  }

  return res.json({
    success: true,
    data: channel
  });
}));

// Update channel
router.put('/:channelId', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { channelId } = req.params;
  const updateData = updateChannelSchema.parse(req.body);

  // Check if user can edit channel (creator, admin, or owner)
  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: {
      workspace: {
        include: {
          members: {
            where: { userId: req.user!.id },
            select: { role: true }
          }
        }
      }
    }
  });

  const userRole = channel?.workspace.members[0]?.role;
  const canEdit = channel?.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(userRole || '');

  if (!canEdit) {
    return res.status(403).json({
      success: false,
      error: 'You can only edit channels you created or if you are an admin'
    });
  }

  const updatedChannel = await db.channel.update({
    where: { id: channelId },
    data: updateData,
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        }
      },
      _count: {
        select: { messages: true, members: true }
      }
    }
  });

  return res.json({
    success: true,
    data: updatedChannel,
    message: 'Channel updated successfully'
  });
}));

// Delete channel
router.delete('/:channelId', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { channelId } = req.params;

  // Check if user can delete channel (creator, admin, or owner)
  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: {
      workspace: {
        include: {
          members: {
            where: { userId: req.user!.id },
            select: { role: true }
          }
        }
      }
    }
  });

  const userRole = channel?.workspace.members[0]?.role;
  const canDelete = channel?.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(userRole || '');

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete channels you created or if you are an admin'
    });
  }

  // Prevent deletion of general channel
  if (channel?.name === 'general') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete the general channel'
    });
  }

  await db.channel.delete({
    where: { id: channelId }
  });

  return res.json({
    success: true,
    message: 'Channel deleted successfully'
  });
}));

// Join channel
router.post('/:channelId/join', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { channelId } = req.params;

  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: {
      workspace: {
        include: {
          members: {
            where: { userId: req.user!.id },
            select: { role: true }
          }
        }
      }
    }
  });

  if (!channel) {
    return res.status(404).json({
      success: false,
      error: 'Channel not found'
    });
  }

  // Check workspace membership
  if (channel.workspace.members.length === 0) {
    return res.status(403).json({
      success: false,
      error: 'You must be a workspace member to join channels'
    });
  }

  // Check if channel is public or user has access
  if (channel.visibility === 'PRIVATE') {
    return res.status(403).json({
      success: false,
      error: 'Cannot join private channel without invitation'
    });
  }

  // Check if already a member
  const existingMember = await db.channelMember.findFirst({
    where: { channelId, userId: req.user!.id }
  });

  if (existingMember) {
    return res.status(409).json({
      success: false,
      error: 'Already a member of this channel'
    });
  }

  // Add user to channel
  await db.channelMember.create({
    data: {
      channelId,
      userId: req.user!.id
    }
  });

  return res.json({
    success: true,
    message: 'Joined channel successfully'
  });
}));

// Leave channel
router.post('/:channelId/leave', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { channelId } = req.params;

  // Remove user from channel
  await db.channelMember.deleteMany({
    where: {
      channelId,
      userId: req.user!.id
    }
  });

  res.json({
    success: true,
    message: 'Left channel successfully'
  });
}));

// Add member to channel
router.post('/:channelId/members', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { channelId } = req.params;
  const { userId } = z.object({
    userId: z.string()
  }).parse(req.body);

  // Check if target user is in the workspace
  const channel = await db.channel.findUnique({
    where: { id: channelId },
    select: { workspaceId: true }
  });

  const workspaceMember = await db.workspaceMember.findFirst({
    where: {
      workspaceId: channel!.workspaceId,
      userId
    }
  });

  if (!workspaceMember) {
    return res.status(400).json({
      success: false,
      error: 'User is not a member of this workspace'
    });
  }

  // Check if already a member
  const existingMember = await db.channelMember.findFirst({
    where: { channelId, userId }
  });

  if (existingMember) {
    return res.status(409).json({
      success: false,
      error: 'User is already a member of this channel'
    });
  }

  // Add user to channel
  const newMember = await db.channelMember.create({
    data: { channelId, userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      }
    }
  });

  return res.json({
    success: true,
    data: newMember,
    message: 'Member added successfully'
  });
}));

// Remove member from channel
router.delete('/:channelId/members/:userId', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { channelId, userId } = req.params;

  await db.channelMember.deleteMany({
    where: { channelId, userId }
  });

  res.json({
    success: true,
    message: 'Member removed successfully'
  });
}));

export default router;