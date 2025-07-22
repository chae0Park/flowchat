import express, { Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireWorkspaceAccess } from '../middleware/auth';
import { AuthenticatedRequest, CreateEventRequest } from '../types';

const router = express.Router();

// Validation schemas
const createEventSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
  time: z.string().optional(),
  duration: z.string().optional(),
  location: z.string().max(200).optional(),
  type: z.enum(['MEETING', 'DEADLINE', 'EVENT']),
  attendees: z.array(z.string())
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  date: z.string().datetime().optional(),
  time: z.string().optional(),
  duration: z.string().optional(),
  location: z.string().max(200).optional(),
  type: z.enum(['MEETING', 'DEADLINE', 'EVENT']).optional()
});

// Create event
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, title, description, date, time, duration, location, type, attendees } = createEventSchema.parse(req.body);

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

  // Validate attendees are workspace members
  const workspaceMembers = await db.workspaceMember.findMany({
    where: {
      workspaceId,
      userId: { in: attendees }
    },
    select: { userId: true }
  });

  const validAttendees = workspaceMembers.map(member => member.userId);
  const invalidAttendees = attendees.filter(id => !validAttendees.includes(id));

  if (invalidAttendees.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Some attendees are not workspace members'
    });
  }

  // Create event
  const event = await db.event.create({
    data: {
      workspaceId,
      title,
      description,
      date: new Date(date),
      time,
      duration,
      location,
      type,
      createdBy: req.user!.id,
      attendees: {
        create: validAttendees.map(userId => ({ userId }))
      }
    },
    include: {
      attendees: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
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
    data: event,
    message: 'Event created successfully'
  });
}));

// Get workspace events
router.get('/workspace/:workspaceId', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    startDate, 
    endDate, 
    type 
  } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    type: z.enum(['MEETING', 'DEADLINE', 'EVENT']).optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const where: any = { workspaceId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  if (type) {
    where.type = type;
  }

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      include: {
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { date: 'asc' },
      skip,
      take: limit
    }),
    db.event.count({ where })
  ]);

  // Add user attendance status
  const eventsWithAttendance = events.map(event => ({
    ...event,
    isAttending: event.attendees.some(attendee => attendee.user.id === req.user!.id),
    attendeeCount: event.attendees.length
  }));

  res.json({
    success: true,
    data: eventsWithAttendance,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get user's events
router.get('/my-events', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 50, 
    startDate, 
    endDate 
  } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const where: any = {
    attendees: {
      some: { userId: req.user!.id }
    }
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      include: {
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        workspace: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'asc' },
      skip,
      take: limit
    }),
    db.event.count({ where })
  ]);

  res.json({
    success: true,
    data: events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get event by ID
router.get('/:eventId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params;

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      attendees: {
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
      }
    }
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: event.workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  const eventWithAttendance = {
    ...event,
    isAttending: event.attendees.some(attendee => attendee.user.id === req.user!.id)
  };

  res.json({
    success: true,
    data: eventWithAttendance
  });
}));

// Update event
router.put('/:eventId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params;
  const updateData = updateEventSchema.parse(req.body);

  const event = await db.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  // Check if user can edit event (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: event.workspaceId, userId: req.user!.id }
  });

  const canEdit = event.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canEdit) {
    return res.status(403).json({
      success: false,
      error: 'You can only edit events you created or if you are an admin'
    });
  }

  const updatedEvent = await db.event.update({
    where: { id: eventId },
    data: {
      ...updateData,
      date: updateData.date ? new Date(updateData.date) : undefined
    },
    include: {
      attendees: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
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
    data: updatedEvent,
    message: 'Event updated successfully'
  });
}));

// Delete event
router.delete('/:eventId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { eventId } = req.params;

  const event = await db.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  // Check if user can delete event (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: event.workspaceId, userId: req.user!.id }
  });

  const canDelete = event.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete events you created or if you are an admin'
    });
  }

  await db.event.delete({
    where: { id: eventId }
  });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
}));

// Join event (add as attendee)
router.post('/:eventId/join', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { eventId } = req.params;

  const event = await db.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: event.workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  // Check if already attending
  const existingAttendee = await db.eventAttendee.findFirst({
    where: { eventId, userId: req.user!.id }
  });

  if (existingAttendee) {
    return res.status(409).json({
      success: false,
      error: 'Already attending this event'
    });
  }

  // Add as attendee
  await db.eventAttendee.create({
    data: { eventId, userId: req.user!.id }
  });

  res.json({
    success: true,
    message: 'Joined event successfully'
  });
}));

// Leave event (remove as attendee)
router.post('/:eventId/leave', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { eventId } = req.params;

  await db.eventAttendee.deleteMany({
    where: { eventId, userId: req.user!.id }
  });

  res.json({
    success: true,
    message: 'Left event successfully'
  });
}));

// Add attendee to event
router.post('/:eventId/attendees', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { eventId } = req.params;
  const { userId } = z.object({
    userId: z.string()
  }).parse(req.body);

  const event = await db.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  // Check if user can manage event (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: event.workspaceId, userId: req.user!.id }
  });

  const canManage = event.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canManage) {
    return res.status(403).json({
      success: false,
      error: 'You can only manage events you created or if you are an admin'
    });
  }

  // Check if target user is workspace member
  const targetMember = await db.workspaceMember.findFirst({
    where: { workspaceId: event.workspaceId, userId }
  });

  if (!targetMember) {
    return res.status(400).json({
      success: false,
      error: 'User is not a member of this workspace'
    });
  }

  // Add attendee
  const attendee = await db.eventAttendee.upsert({
    where: {
      eventId_userId: { eventId, userId }
    },
    update: {},
    create: { eventId, userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      }
    }
  });

  res.json({
    success: true,
    data: attendee,
    message: 'Attendee added successfully'
  });
}));

// Remove attendee from event
router.delete('/:eventId/attendees/:userId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { eventId, userId } = req.params;

  const event = await db.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }

  // Check if user can manage event (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: event.workspaceId, userId: req.user!.id }
  });

  const canManage = event.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canManage) {
    return res.status(403).json({
      success: false,
      error: 'You can only manage events you created or if you are an admin'
    });
  }

  await db.eventAttendee.deleteMany({
    where: { eventId, userId }
  });

  res.json({
    success: true,
    message: 'Attendee removed successfully'
  });
}));

export default router;