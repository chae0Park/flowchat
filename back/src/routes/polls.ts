import express, { Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireWorkspaceAccess } from '../middleware/auth';
import { AuthenticatedRequest, CreatePollRequest, VotePollRequest } from '../types';

const router = express.Router();

// Validation schemas
const createPollSchema = z.object({
  workspaceId: z.string(),
  channelId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  options: z.array(z.string().min(1).max(100)).min(2).max(10),
  expiresAt: z.string().datetime().optional(),
  allowMultiple: z.boolean().default(false)
});

const votePollSchema = z.object({
  optionIds: z.array(z.string()).min(1)
});

// Create poll
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, channelId, title, description, options, expiresAt, allowMultiple } = createPollSchema.parse(req.body);

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  // If channelId provided, check channel access
  if (channelId) {
    const channelMember = await db.channelMember.findFirst({
      where: { channelId, userId: req.user!.id }
    });

    if (!channelMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to channel'
      });
    }
  }

  // Create poll with options
  const poll = await db.poll.create({
    data: {
      workspaceId,
      channelId,
      title,
      description,
      createdBy: req.user!.id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      allowMultiple,
      options: {
        create: options.map(text => ({ text }))
      }
    },
    include: {
      options: {
        include: {
          votes: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        }
      },
      creator: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: poll,
    message: 'Poll created successfully'
  });
}));

// Get workspace polls
router.get('/workspace/:workspaceId', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.params;
  const { page = 1, limit = 20, active } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    active: z.string().optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const where: any = { workspaceId };
  
  if (active === 'true') {
    where.isActive = true;
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ];
  } else if (active === 'false') {
    where.OR = [
      { isActive: false },
      { expiresAt: { lte: new Date() } }
    ];
  }

  const [polls, total] = await Promise.all([
    db.poll.findMany({
      where,
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            }
          }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        channel: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.poll.count({ where })
  ]);

  // Add vote counts and user vote status
  const pollsWithStats = polls.map(poll => ({
    ...poll,
    totalVotes: poll.options.reduce((sum, option) => sum + option.votes.length, 0),
    userVotes: poll.options.flatMap(option => 
      option.votes.filter(vote => vote.user.id === req.user!.id).map(vote => option.id)
    ),
    hasExpired: poll.expiresAt ? new Date() > poll.expiresAt : false
  }));

  res.json({
    success: true,
    data: pollsWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get poll by ID
router.get('/:pollId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { pollId } = req.params;

  const poll = await db.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          votes: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        }
      },
      creator: {
        select: { id: true, name: true, avatar: true }
      },
      workspace: {
        select: { id: true, name: true }
      },
      channel: {
        select: { id: true, name: true }
      }
    }
  });

  if (!poll) {
    return res.status(404).json({
      success: false,
      error: 'Poll not found'
    });
  }

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: poll.workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  // Add vote statistics
  const pollWithStats = {
    ...poll,
    totalVotes: poll.options.reduce((sum, option) => sum + option.votes.length, 0),
    userVotes: poll.options.flatMap(option => 
      option.votes.filter(vote => vote.user.id === req.user!.id).map(vote => option.id)
    ),
    hasExpired: poll.expiresAt ? new Date() > poll.expiresAt : false
  };

  res.json({
    success: true,
    data: pollWithStats
  });
}));

// Vote on poll
router.post('/:pollId/vote', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { pollId } = req.params;
  const { optionIds } = votePollSchema.parse(req.body);

  const poll = await db.poll.findUnique({
    where: { id: pollId },
    include: {
      options: true
    }
  });

  if (!poll) {
    return res.status(404).json({
      success: false,
      error: 'Poll not found'
    });
  }

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: poll.workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  // Check if poll is active and not expired
  if (!poll.isActive || (poll.expiresAt && new Date() > poll.expiresAt)) {
    return res.status(400).json({
      success: false,
      error: 'Poll is not active or has expired'
    });
  }

  // Validate option IDs
  const validOptionIds = poll.options.map(option => option.id);
  const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id));
  
  if (invalidOptions.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid option IDs provided'
    });
  }

  // Check multiple vote restriction
  if (!poll.allowMultiple && optionIds.length > 1) {
    return res.status(400).json({
      success: false,
      error: 'Multiple votes not allowed for this poll'
    });
  }

  // Remove existing votes if not allowing multiple
  if (!poll.allowMultiple) {
    await db.pollVote.deleteMany({
      where: {
        option: {
          pollId
        },
        userId: req.user!.id
      }
    });
  }

  // Add new votes
  const votes = await Promise.all(
    optionIds.map(optionId =>
      db.pollVote.upsert({
        where: {
          optionId_userId: {
            optionId,
            userId: req.user!.id
          }
        },
        update: {},
        create: {
          optionId,
          userId: req.user!.id
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          option: {
            select: { id: true, text: true }
          }
        }
      })
    )
  );

  res.json({
    success: true,
    data: votes,
    message: 'Vote recorded successfully'
  });
}));

// Remove vote
router.delete('/:pollId/vote/:optionId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { pollId, optionId } = req.params;

  const poll = await db.poll.findUnique({
    where: { id: pollId }
  });

  if (!poll) {
    return res.status(404).json({
      success: false,
      error: 'Poll not found'
    });
  }

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: poll.workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  // Remove vote
  await db.pollVote.deleteMany({
    where: {
      optionId,
      userId: req.user!.id
    }
  });

  res.json({
    success: true,
    message: 'Vote removed successfully'
  });
}));

// Update poll
router.put('/:pollId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { pollId } = req.params;
  const { title, description, isActive } = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional()
  }).parse(req.body);

  const poll = await db.poll.findUnique({
    where: { id: pollId }
  });

  if (!poll) {
    return res.status(404).json({
      success: false,
      error: 'Poll not found'
    });
  }

  // Check if user can edit poll (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: poll.workspaceId, userId: req.user!.id }
  });

  const canEdit = poll.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canEdit) {
    return res.status(403).json({
      success: false,
      error: 'You can only edit polls you created or if you are an admin'
    });
  }

  const updatedPoll = await db.poll.update({
    where: { id: pollId },
    data: { title, description, isActive },
    include: {
      options: {
        include: {
          votes: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        }
      },
      creator: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });

  res.json({
    success: true,
    data: updatedPoll,
    message: 'Poll updated successfully'
  });
}));

// Delete poll
router.delete('/:pollId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { pollId } = req.params;

  const poll = await db.poll.findUnique({
    where: { id: pollId }
  });

  if (!poll) {
    return res.status(404).json({
      success: false,
      error: 'Poll not found'
    });
  }

  // Check if user can delete poll (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: poll.workspaceId, userId: req.user!.id }
  });

  const canDelete = poll.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete polls you created or if you are an admin'
    });
  }

  await db.poll.delete({
    where: { id: pollId }
  });

  res.json({
    success: true,
    message: 'Poll deleted successfully'
  });
}));

export default router;