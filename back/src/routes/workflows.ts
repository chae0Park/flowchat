import express, { Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireWorkspaceAccess } from '../middleware/auth';
import { AuthenticatedRequest, CreateWorkflowRequest } from '../types';

const router = express.Router();

// Validation schemas
const createWorkflowSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  trigger: z.object({
    type: z.enum(['message', 'file', 'schedule', 'user_join']),
    condition: z.string(),
    parameters: z.record(z.any())
  }),
  actions: z.array(z.object({
    type: z.enum(['send_message', 'create_channel', 'notify_user', 'archive_file']),
    target: z.string(),
    parameters: z.record(z.any())
  }))
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  trigger: z.object({
    type: z.enum(['message', 'file', 'schedule', 'user_join']),
    condition: z.string(),
    parameters: z.record(z.any())
  }).optional(),
  actions: z.array(z.object({
    type: z.enum(['send_message', 'create_channel', 'notify_user', 'archive_file']),
    target: z.string(),
    parameters: z.record(z.any())
  })).optional()
});

// Create workflow
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId, name, description, trigger, actions } = createWorkflowSchema.parse(req.body);

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

  // Only admins and owners can create workflows
  if (!['OWNER', 'ADMIN'].includes(workspaceMember.role)) {
    return res.status(403).json({
      success: false,
      error: 'Only admins and owners can create workflows'
    });
  }

  // Create workflow
  const workflow = await db.workflow.create({
    data: {
      workspaceId,
      name,
      description,
      createdBy: req.user!.id,
      trigger,
      actions
    },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true }
      },
      workspace: {
        select: { id: true, name: true }
      }
    }
  });

  return res.status(201).json({
    success: true,
    data: workflow,
    message: 'Workflow created successfully'
  });
}));

// Get workspace workflows
router.get('/workspace/:workspaceId', requireWorkspaceAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId } = req.params;
  const { 
    page = 1, 
    limit = 20, 
    active 
  } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    active: z.string().optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const where: any = { workspaceId };
  
  if (active === 'true') {
    where.isActive = true;
  } else if (active === 'false') {
    where.isActive = false;
  }

  const [workflows, total] = await Promise.all([
    db.workflow.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.workflow.count({ where })
  ]);

  res.json({
    success: true,
    data: workflows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get workflow by ID
router.get('/:workflowId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workflowId } = req.params;

  const workflow = await db.workflow.findUnique({
    where: { id: workflowId },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true }
      },
      workspace: {
        select: { id: true, name: true }
      }
    }
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: workflow.workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  return res.json({
    success: true,
    data: workflow
  });
}));

// Update workflow
router.put('/:workflowId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workflowId } = req.params;
  const updateData = updateWorkflowSchema.parse(req.body);

  const workflow = await db.workflow.findUnique({
    where: { id: workflowId }
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  // Check if user can edit workflow (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: workflow.workspaceId, userId: req.user!.id }
  });

  const canEdit = workflow.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canEdit) {
    return res.status(403).json({
      success: false,
      error: 'You can only edit workflows you created or if you are an admin'
    });
  }

  const updatedWorkflow = await db.workflow.update({
    where: { id: workflowId },
    data: updateData,
    include: {
      creator: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });

  return res.json({
    success: true,
    data: updatedWorkflow,
    message: 'Workflow updated successfully'
  });
}));

// Delete workflow
router.delete('/:workflowId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workflowId } = req.params;

  const workflow = await db.workflow.findUnique({
    where: { id: workflowId }
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  // Check if user can delete workflow (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: workflow.workspaceId, userId: req.user!.id }
  });

  const canDelete = workflow.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete workflows you created or if you are an admin'
    });
  }

  await db.workflow.delete({
    where: { id: workflowId }
  });

  return res.json({
    success: true,
    message: 'Workflow deleted successfully'
  });
}));

// Toggle workflow active status
router.patch('/:workflowId/toggle', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workflowId } = req.params;

  const workflow = await db.workflow.findUnique({
    where: { id: workflowId }
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  // Check if user can manage workflow (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: workflow.workspaceId, userId: req.user!.id }
  });

  const canManage = workflow.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canManage) {
    return res.status(403).json({
      success: false,
      error: 'You can only manage workflows you created or if you are an admin'
    });
  }

  const updatedWorkflow = await db.workflow.update({
    where: { id: workflowId },
    data: { isActive: !workflow.isActive },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });

  return res.json({
    success: true,
    data: updatedWorkflow,
    message: `Workflow ${updatedWorkflow.isActive ? 'activated' : 'deactivated'} successfully`
  });
}));

// Execute workflow manually (for testing)
router.post('/:workflowId/execute', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workflowId } = req.params;
  const { testData } = z.object({
    testData: z.record(z.any()).optional()
  }).parse(req.body);

  const workflow = await db.workflow.findUnique({
    where: { id: workflowId }
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  // Check if user can execute workflow (creator or admin)
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: workflow.workspaceId, userId: req.user!.id }
  });

  const canExecute = workflow.createdBy === req.user!.id || ['OWNER', 'ADMIN'].includes(workspaceMember?.role || '');

  if (!canExecute) {
    return res.status(403).json({
      success: false,
      error: 'You can only execute workflows you created or if you are an admin'
    });
  }

  if (!workflow.isActive) {
    return res.status(400).json({
      success: false,
      error: 'Cannot execute inactive workflow'
    });
  }

  // Update run count and last run time
  await db.workflow.update({
    where: { id: workflowId },
    data: {
      runCount: { increment: 1 },
      lastRun: new Date()
    }
  });

  // TODO: Implement actual workflow execution logic
  // For now, just simulate execution
  const executionResult = {
    workflowId,
    trigger: workflow.trigger,
    actions: workflow.actions,
    testData,
    executedAt: new Date(),
    status: 'success',
    message: 'Workflow executed successfully (simulated)'
  };

  return res.json({
    success: true,
    data: executionResult,
    message: 'Workflow executed successfully'
  });
}));

// Get workflow execution history (mock)
router.get('/:workflowId/executions', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workflowId } = req.params;
  const { 
    page = 1, 
    limit = 20 
  } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional()
  }).parse(req.query);

  const workflow = await db.workflow.findUnique({
    where: { id: workflowId }
  });

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found'
    });
  }

  // Check workspace access
  const workspaceMember = await db.workspaceMember.findFirst({
    where: { workspaceId: workflow.workspaceId, userId: req.user!.id }
  });

  if (!workspaceMember) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to workspace'
    });
  }

  // Mock execution history
  const mockExecutions = Array.from({ length: Math.min(workflow.runCount, limit) }, (_, i) => ({
    id: `exec_${workflowId}_${i + 1}`,
    workflowId,
    executedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Last N days
    status: Math.random() > 0.1 ? 'success' : 'failed',
    duration: Math.floor(Math.random() * 5000) + 100, // 100-5000ms
    trigger: workflow.trigger,
    actionsExecuted: Array.isArray(workflow.actions) ? workflow.actions.length : null
  }));

  return res.json({
    success: true,
    data: mockExecutions,
    pagination: {
      page,
      limit,
      total: workflow.runCount,
      totalPages: Math.ceil(workflow.runCount / limit)
    }
  });
}));

export default router;