import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { db } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { requireChannelAccess } from '../middleware/auth';
import { AuthenticatedRequest, FileUploadResponse } from '../types';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,txt,zip').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  }
});

// Upload file
router.post('/upload', upload.single('file'), asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const { messageId } = z.object({
    messageId: z.string().optional()
  }).parse(req.body);

  // Create file record
  const fileRecord = await db.fileAttachment.create({
    data: {
      messageId,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user!.id
    },
    include: {
      uploader: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });

  const response: FileUploadResponse = {
    id: fileRecord.id,
    name: fileRecord.name,
    size: fileRecord.size,
    type: fileRecord.type,
    url: fileRecord.url
  };

  res.status(201).json({
    success: true,
    data: response,
    message: 'File uploaded successfully'
  });
}));

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  const { messageId } = z.object({
    messageId: z.string().optional()
  }).parse(req.body);

  // Create file records
  const fileRecords = await Promise.all(
    files.map(file =>
      db.fileAttachment.create({
        data: {
          messageId,
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
          url: `/uploads/${file.filename}`,
          uploadedBy: req.user!.id
        },
        include: {
          uploader: {
            select: { id: true, name: true, avatar: true }
          }
        }
      })
    )
  );

  const response: FileUploadResponse[] = fileRecords.map(record => ({
    id: record.id,
    name: record.name,
    size: record.size,
    type: record.type,
    url: record.url
  }));

  res.status(201).json({
    success: true,
    data: response,
    message: `${files.length} files uploaded successfully`
  });
}));

// Get file by ID
router.get('/:fileId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { fileId } = req.params;

  const file = await db.fileAttachment.findUnique({
    where: { id: fileId },
    include: {
      uploader: {
        select: { id: true, name: true, avatar: true }
      },
      message: {
        include: {
          channel: {
            select: { id: true, workspaceId: true }
          }
        }
      }
    }
  });

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check access if file is attached to a message
  if (file.message) {
    const channelMember = await db.channelMember.findFirst({
      where: {
        channelId: file.message.channel.id,
        userId: req.user!.id
      }
    });

    if (!channelMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to file'
      });
    }
  }

  res.json({
    success: true,
    data: file
  });
}));

// Get files by channel
router.get('/channel/:channelId', requireChannelAccess, asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { channelId } = req.params;
  const { 
    page = 1, 
    limit = 20, 
    type 
  } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    type: z.string().optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const where: any = {
    message: {
      channelId
    }
  };

  if (type) {
    where.type = { contains: type };
  }

  const [files, total] = await Promise.all([
    db.fileAttachment.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true }
        },
        message: {
          select: { id: true, content: true, createdAt: true }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      skip,
      take: limit
    }),
    db.fileAttachment.count({ where })
  ]);

  res.json({
    success: true,
    data: files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get files by workspace
router.get('/workspace/:workspaceId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { workspaceId } = req.params;
  const { 
    page = 1, 
    limit = 20, 
    type 
  } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    type: z.string().optional()
  }).parse(req.query);

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

  const skip = (page - 1) * limit;

  const where: any = {
    message: {
      channel: {
        workspaceId,
        OR: [
          { visibility: 'PUBLIC' },
          { members: { some: { userId: req.user!.id } } }
        ]
      }
    }
  };

  if (type) {
    where.type = { contains: type };
  }

  const [files, total] = await Promise.all([
    db.fileAttachment.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true }
        },
        message: {
          select: { 
            id: true, 
            content: true, 
            createdAt: true,
            channel: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      skip,
      take: limit
    }),
    db.fileAttachment.count({ where })
  ]);

  res.json({
    success: true,
    data: files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get user's uploaded files
router.get('/user/my-files', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { 
    page = 1, 
    limit = 20, 
    type 
  } = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    type: z.string().optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const where: any = { uploadedBy: req.user!.id };

  if (type) {
    where.type = { contains: type };
  }

  const [files, total] = await Promise.all([
    db.fileAttachment.findMany({
      where,
      include: {
        message: {
          select: { 
            id: true, 
            content: true, 
            createdAt: true,
            channel: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      skip,
      take: limit
    }),
    db.fileAttachment.count({ where })
  ]);

  res.json({
    success: true,
    data: files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Delete file
router.delete('/:fileId', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { fileId } = req.params;

  const file = await db.fileAttachment.findUnique({
    where: { id: fileId },
    include: {
      message: {
        include: {
          channel: {
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
          }
        }
      }
    }
  });

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Check if user can delete file (uploader, message author, or admin)
  const userRole = file.message?.channel.workspace.members[0]?.role;
  const canDelete = 
    file.uploadedBy === req.user!.id || 
    file.message?.userId === req.user!.id ||
    ['OWNER', 'ADMIN'].includes(userRole || '');

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete files you uploaded or if you are an admin'
    });
  }

  // Delete file record
  await db.fileAttachment.delete({
    where: { id: fileId }
  });

  // TODO: Delete actual file from filesystem
  // fs.unlinkSync(path.join(process.env.UPLOAD_PATH || './uploads', file.url.split('/').pop()));

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
}));

// Search files
router.get('/search', asyncHandler(async (req: AuthenticatedRequest, res:Response) => {
  const { 
    q: query, 
    page = 1, 
    limit = 20, 
    type,
    workspaceId 
  } = z.object({
    q: z.string().min(1),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    type: z.string().optional(),
    workspaceId: z.string().optional()
  }).parse(req.query);

  const skip = (page - 1) * limit;

  const where: any = {
    name: {
      contains: query,
      mode: 'insensitive'
    }
  };

  if (type) {
    where.type = { contains: type };
  }

  if (workspaceId) {
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

    where.message = {
      channel: {
        workspaceId,
        OR: [
          { visibility: 'PUBLIC' },
          { members: { some: { userId: req.user!.id } } }
        ]
      }
    };
  } else {
    // Search only in accessible channels
    where.message = {
      channel: {
        OR: [
          { visibility: 'PUBLIC' },
          { members: { some: { userId: req.user!.id } } }
        ]
      }
    };
  }

  const [files, total] = await Promise.all([
    db.fileAttachment.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true }
        },
        message: {
          select: { 
            id: true, 
            content: true, 
            createdAt: true,
            channel: {
              select: { id: true, name: true, workspaceId: true }
            }
          }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      skip,
      take: limit
    }),
    db.fileAttachment.count({ where })
  ]);

  res.json({
    success: true,
    data: files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

export default router;