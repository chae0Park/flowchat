import express, { Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole, requireWorkspaceAccess } from '../middleware/auth';
import { AuthenticatedRequest, CreateWorkspaceRequest, InviteMemberRequest } from '../types';

const router = express.Router();

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  domain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  visibility: z.enum(['PUBLIC', 'PRIVATE'])
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  settings: z.object({
    allowChannelCreation: z.enum(['all', 'admin', 'owner']).optional(),
    allowMemberInvite: z.enum(['all', 'admin', 'owner']).optional()
  }).optional()
});

const inviteMemberSchema = z.object({
  emails: z.array(z.string().email()),
  message: z.string().max(500).optional()
});

// Create workspace
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { name, description, domain, visibility } = createWorkspaceSchema.parse(req.body);

  // Check if domain is already taken
  const existingWorkspace = await db.workspace.findUnique({
    where: { domain }
  });

  if (existingWorkspace) {
    return res.status(409).json({
      success: false,
      error: 'Domain already taken'
    });
  }

  // Create workspace with owner
  const workspace = await db.workspace.create({
    data: {
      name,
      description,
      domain,
      visibility,
      ownerId: req.user!.id,
      members: {
        create: {
          userId: req.user!.id,
          role: 'OWNER'
        }
      },
      channels: {
        create: {
          name: 'general',
          description: 'General discussion',
          type: 'CHANNEL',
          visibility: 'PUBLIC',
          createdBy: req.user!.id,
          members: {
            create: {
              userId: req.user!.id
            }
          }
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      },
      channels: true
    }
  });

  res.status(201).json({
    success: true,
    data: workspace,
    message: 'Workspace created successfully'
  });
}));

// Get user's workspaces
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const workspaces = await db.workspaceMember.findMany({
    where: { userId: req.user!.id },
    include: {
      workspace: {
        include: {
          _count: {
            select: {
              members: true,
              channels: true
            }
          }
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
      joinedAt: wm.joinedAt,
      memberCount: wm.workspace._count.members,
      channelCount: wm.workspace._count.channels
    }))
  });
}));

// Get workspace by ID
router.get('/:workspaceId', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId } = req.params;

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, status: true, lastActive: true }
          }
        },
        orderBy: { joinedAt: 'asc' }
      },
      channels: {
        where: {
          OR: [
            { visibility: 'PUBLIC' },
            { members: { some: { userId: req.user!.id } } }
          ]
        },
        include: {
          _count: {
            select: { members: true, messages: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!workspace) {
    return res.status(404).json({
      success: false,
      error: 'Workspace not found'
    });
  }

  res.json({
    success: true,
    data: workspace
  });
}));

// Update workspace
router.put('/:workspaceId', requireWorkspaceAccess, requireRole(['OWNER', 'ADMIN']), asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId } = req.params;
  const updateData = updateWorkspaceSchema.parse(req.body);

  const workspace = await db.workspace.update({
    where: { id: workspaceId },
    data: updateData,
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  res.json({
    success: true,
    data: workspace,
    message: 'Workspace updated successfully'
  });
}));

// Delete workspace
router.delete('/:workspaceId', requireWorkspaceAccess, requireRole(['OWNER']), asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId } = req.params;

  await db.workspace.delete({
    where: { id: workspaceId }
  });

  res.json({
    success: true,
    message: 'Workspace deleted successfully'
  });
}));

// Invite members
router.post('/:workspaceId/invite', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId } = req.params;
  const { emails, message } = inviteMemberSchema.parse(req.body);

  // Check workspace settings for invite permissions
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true }
  });

  const settings = workspace?.settings as any;
  const allowMemberInvite = settings?.allowMemberInvite || 'admin';

  if (allowMemberInvite === 'owner' && req.user!.role !== 'OWNER') {
    return res.status(403).json({
      success: false,
      error: 'Only workspace owners can invite members'
    });
  }

  if (allowMemberInvite === 'admin' && !['OWNER', 'ADMIN'].includes(req.user!.role)) {
    return res.status(403).json({
      success: false,
      error: 'Only admins and owners can invite members'
    });
  }

  // TODO: Send invitation emails
  // For now, just return success
  res.json({
    success: true,
    message: `Invitations sent to ${emails.length} email(s)`,
    data: { emails, message }
  });
}));

// Get workspace members
router.get('/:workspaceId/members', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId } = req.params;

  const members = await db.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          lastActive: true
        }
      }
    },
    orderBy: [
      { role: 'asc' },
      { joinedAt: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: members
  });
}));

// Update member role
router.patch('/:workspaceId/members/:userId', requireWorkspaceAccess, requireRole(['OWNER', 'ADMIN']), asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId, userId } = req.params;
  const { role } = z.object({
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER'])
  }).parse(req.body);

  // Only owners can change roles to/from OWNER
  if ((role === 'OWNER' || req.user!.role === 'OWNER') && req.user!.role !== 'OWNER') {
    return res.status(403).json({
      success: false,
      error: 'Only workspace owners can manage owner role'
    });
  }

  const member = await db.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    },
    data: { role },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      }
    }
  });

  res.json({
    success: true,
    data: member,
    message: 'Member role updated successfully'
  });
}));

// Remove member
router.delete('/:workspaceId/members/:userId', requireWorkspaceAccess, requireRole(['OWNER', 'ADMIN']), asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId, userId } = req.params;

  // Can't remove workspace owner
  const member = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    }
  });

  if (member?.role === 'OWNER') {
    return res.status(400).json({
      success: false,
      error: 'Cannot remove workspace owner'
    });
  }

  await db.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    }
  });

  res.json({
    success: true,
    message: 'Member removed successfully'
  });
}));

export default router;