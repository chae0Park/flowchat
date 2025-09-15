import express, { Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireChannelAccess } from '../middleware/auth';
import { AuthenticatedRequest, CreateMessageRequest, PaginatedResponse } from '../types';

const router = express.Router();

// Validation schemas
const createMessageSchema = z.object({
  channelId: z.string(),
  content: z.string().min(1).max(4000),
  type: z.enum(['MESSAGE', 'SYSTEM']).optional(),
  replyTo: z.string().optional(),
  files: z.array(z.string()).optional()
});

const getMessagesSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  before: z.string().optional(),
  after: z.string().optional()
});

// Get messages for a channel
router.get('/channel/:channelId', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { channelId } = req.params;
  const { page = 1, limit = 50, before, after } = getMessagesSchema.parse(req.query);

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { channelId };
  if (before) {
    where.createdAt = { lt: new Date(before) };
  }
  if (after) {
    where.createdAt = { gt: new Date(after) };
  }

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        files: true,
        reactions: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.message.count({ where })
  ]);

  const response: PaginatedResponse<any> = {
    success: true,
    data: messages.reverse(), // Reverse to show oldest first
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };

  res.json(response);
}));

// Create a new message
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { channelId, content, type = 'MESSAGE', replyTo, files } = createMessageSchema.parse(req.body);

  // Check channel access
  const channelMember = await db.channelMember.findFirst({
    where: { channelId, userId: req.user!.id }
  });

  if (!channelMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to channel'
    });
  }

  // Create message
  const message = await db.message.create({
    data: {
      channelId,
      userId: req.user!.id,
      content,
      type,
      replyTo,
      files: files ? {
        connect: files.map(fileId => ({ id: fileId }))
      } : undefined
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      },
      files: true,
      reactions: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });

  return res.status(201).json({
    success: true,
    data: message,
    message: 'Message created successfully'
  });
}));

// Get a specific message
router.get('/:messageId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { messageId } = req.params;

  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      },
      files: true,
      reactions: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      },
      channel: {
        select: { id: true, name: true }
      }
    }
  });

  if (!message) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }

  // Check if user has access to the channel
  const channelMember = await db.channelMember.findFirst({
    where: { channelId: message.channelId, userId: req.user!.id }
  });

  if (!channelMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to message'
    });
  }

  return res.json({
    success: true,
    data: message
  });
}));

// Update a message
router.put('/:messageId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { messageId } = req.params;
  const { content } = z.object({
    content: z.string().min(1).max(4000)
  }).parse(req.body);

  const message = await db.message.findUnique({
    where: { id: messageId }
  });

  if (!message) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }

  // Check if user owns the message
  if (message.userId !== req.user!.id) {
    return res.status(403).json({
      success: false,
      error: 'You can only edit your own messages'
    });
  }

  // Update message
  const updatedMessage = await db.message.update({
    where: { id: messageId },
    data: {
      content,
      editedAt: new Date()
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      },
      files: true,
      reactions: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });

  return res.json({
    success: true,
    data: updatedMessage,
    message: 'Message updated successfully'
  });
}));

// Delete a message
router.delete('/:messageId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { messageId } = req.params;

  const message = await db.message.findUnique({
    where: { id: messageId }
  });

  if (!message) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }

  // Check if user owns the message or is admin
  if (message.userId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
    return res.status(403).json({
      success: false,
      error: 'You can only delete your own messages'
    });
  }

  // Delete message
  await db.message.delete({
    where: { id: messageId }
  });

  return res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// Add reaction to message
router.post('/:messageId/reactions', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { messageId } = req.params;
  const { emoji } = z.object({
    emoji: z.string().min(1).max(10)
  }).parse(req.body);

  const message = await db.message.findUnique({
    where: { id: messageId }
  });

  if (!message) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }

  // Check channel access
  const channelMember = await db.channelMember.findFirst({
    where: { channelId: message.channelId, userId: req.user!.id }
  });

  if (!channelMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to channel'
    });
  }

  // Check if reaction already exists
  const existingReaction = await db.reaction.findFirst({
    where: { messageId, userId: req.user!.id, emoji }
  });

  if (existingReaction) {
    // Remove reaction
    await db.reaction.delete({
      where: { id: existingReaction.id }
    });

    return res.json({
      success: true,
      message: 'Reaction removed'
    });
  } else {
    // Add reaction
    const reaction = await db.reaction.create({
      data: {
        messageId,
        userId: req.user!.id,
        emoji
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: reaction,
      message: 'Reaction added'
    });
  }
}));

// Search messages
router.get('/search/:channelId', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { channelId } = req.params;
  const { q: query, page = 1, limit = 20 } = z.object({
    q: z.string().min(1),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where: {
        channelId,
        content: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        files: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.message.count({
      where: {
        channelId,
        content: {
          contains: query,
          mode: 'insensitive'
        }
      }
    })
  ]);

  const response: PaginatedResponse<any> = {
    success: true,
    data: messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };

  res.json(response);
}));

export default router;