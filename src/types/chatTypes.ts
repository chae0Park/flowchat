// src/types/chatTypes.ts
export interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  channelId: string;
  reactions?: { emoji: string; count: number; active: boolean }[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unread: number;
  active: boolean;
  members?: string[];
}
