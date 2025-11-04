// src/routes/dm.ts
import express, { Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireWorkspaceAccess } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// ✅ DM 생성 스키마
const createDmSchema = z.object({
  workspaceId: z.string(),
  targetUserId: z.string(),
});

router.post('/', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId, targetUserId } = createDmSchema.parse(req.body);
  const userId = req.user!.id;

  if (userId === targetUserId) {
    return res.status(400).json({
      success: false,
      error: 'You cannot start a DM with yourself.',
    });
  }

  // ✅ 두 사용자가 이미 DM을 갖고 있는지 확인
  const existingDM = await db.channel.findFirst({
    where: {
      workspaceId,
      type: 'DM',
      members: {
        every: {
          userId: { in: [userId, targetUserId] },
        },
      },
    },
    include: {
      members: { include: { user: true } },
    },
  });

  if (existingDM) {
    return res.status(200).json({
      success: true,
      data: existingDM,
      message: 'DM already exists',
    });
  }

  // ✅ DM 채널 생성
  const dmChannel = await db.channel.create({
    data: {
      workspaceId,
      name: `dm_${userId}_${targetUserId}`,
      description: 'Direct message',
      type: 'DM',
      visibility: 'PRIVATE',
      createdBy: userId,
      members: {
        create: [
          { userId },
          { userId: targetUserId },
        ],
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
  });

  res.status(201).json({
    success: true,
    data: dmChannel,
    message: 'DM channel created successfully',
  });
}));

export default router;
