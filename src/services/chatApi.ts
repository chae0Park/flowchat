// src/services/chatApi.ts
import { AxiosResponse  } from 'axios';
import { apiClient } from './apiClient';
import { Channel, Message } from '../types/chatTypes';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const chatApi = {
  async getChannels(): Promise<ApiResponse<Channel[]>> {
    const res: AxiosResponse<ApiResponse<Channel[]>> = await apiClient.get('/chat/channels');
    return res.data;
  },

  async getMessages(channelId: string): Promise<ApiResponse<Message[]>> {
    const res: AxiosResponse <ApiResponse<Message[]>> = await apiClient.get(`/chat/channels/${channelId}/messages`);
    return res.data;
  },

  async sendMessage(channelId: string, content: string): Promise<ApiResponse<Message>> {
    const res: AxiosResponse <ApiResponse<Message>> = await apiClient.post(`/chat/channels/${channelId}/messages`, {
      content,
    });
    return res.data;
  },

  async createChannel(data: { name: string; description?: string; isPrivate?: boolean }): Promise<ApiResponse<Channel>> {
    const res: AxiosResponse <ApiResponse<Channel>> = await apiClient.post(`/chat/channels`, data);
    return res.data;
  },

  async startDirectMessage(targetUserId: string): Promise<ApiResponse<Channel>> {
    const res: AxiosResponse <ApiResponse<Channel>> = await apiClient.post(`/chat/dm/start`, { targetUserId });
    return res.data;
  },
};
