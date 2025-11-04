// src/services/chatApi.ts
import { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import { Channel, Message } from '../types/chatTypes';

export const chatApi = {
  async getChannels(): Promise<AxiosResponse<Channel[]>> {
    const res: AxiosResponse<AxiosResponse<Channel[]>> = await apiClient.get('/chat/channels');
    return res.data;
  },

  async getMessages(channelId: string): Promise<AxiosResponse<Message[]>> {
    const res: AxiosResponse<AxiosResponse<Message[]>> = await apiClient.get(`/chat/channels/${channelId}/messages`);
    return res.data;
  },

  async sendMessage(channelId: string, content: string): Promise<AxiosResponse<Message>> {
    const res: AxiosResponse<AxiosResponse<Message>> = await apiClient.post(`/chat/channels/${channelId}/messages`, {
      content,
    });
    return res.data;
  },

  async createChannel(data: { name: string; description?: string; isPrivate?: boolean }): Promise<AxiosResponse<Channel>> {
    const res: AxiosResponse<AxiosResponse<Channel>> = await apiClient.post(`/chat/channels`, data);
    return res.data;
  },

  async startDirectMessage(targetUserId: string): Promise<AxiosResponse<Channel>> {
    const res: AxiosResponse<AxiosResponse<Channel>> = await apiClient.post(`/chat/dm/start`, { targetUserId });
    return res.data;
  },
};
