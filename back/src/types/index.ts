import { Request } from 'express';
import { User } from '@prisma/client';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_joined' | 'user_left' | 'reaction' | 'file_upload';
  data: any;
  timestamp: string;
  userId: string;
  channelId: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  channelId: string;
  isTyping: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Workspace types
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  domain: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

export interface InviteMemberRequest {
  emails: string[];
  message?: string;
}

// Channel types
export interface CreateChannelRequest {
  name: string;
  description?: string;
  type: 'CHANNEL' | 'DM';
  visibility: 'PUBLIC' | 'PRIVATE';
  members?: string[];
}

// Message types
export interface CreateMessageRequest {
  content: string;
  type?: 'MESSAGE' | 'SYSTEM';
  replyTo?: string;
  files?: string[];
}

// Poll types
export interface CreatePollRequest {
  title: string;
  description?: string;
  channelId?: string;
  options: string[];
  expiresAt?: string;
  allowMultiple: boolean;
}

export interface VotePollRequest {
  optionIds: string[];
}

// Event types
export interface CreateEventRequest {
  title: string;
  description?: string;
  date: string;
  time?: string;
  duration?: string;
  location?: string;
  type: 'MEETING' | 'DEADLINE' | 'EVENT';
  attendees: string[];
}

// Workflow types
export interface CreateWorkflowRequest {
  name: string;
  description: string;
  trigger: {
    type: 'message' | 'file' | 'schedule' | 'user_join';
    condition: string;
    parameters: Record<string, any>;
  };
  actions: {
    type: 'send_message' | 'create_channel' | 'notify_user' | 'archive_file';
    target: string;
    parameters: Record<string, any>;
  }[];
}

// File types
export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

// Search types
export interface SearchRequest {
  query: string;
  type?: 'messages' | 'files' | 'users' | 'channels';
  channelId?: string;
  limit?: number;
  offset?: number;
}

// Analytics types
export interface AnalyticsData {
  totalMessages: number;
  activeUsers: number;
  filesShared: number;
  channelsActive: number;
  avgResponseTime: string;
  peakHour: string;
  messageData: { day: string; messages: number }[];
  channelActivity: {
    name: string;
    messages: number;
    members: number;
    growth: string;
  }[];
  topEmojis: {
    emoji: string;
    count: number;
    name: string;
  }[];
  activeUsersList: {
    name: string;
    messages: number;
    avatar: string;
    status: string;
  }[];
}

// Error types
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}