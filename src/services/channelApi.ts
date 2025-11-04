// src/services/channelApi.ts
import { apiClient } from './apiClient';
import { Channel } from '../types/chatTypes';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const channelApi = {
  // 특정 워크스페이스의 채널 목록 조회
  async getWorkspaceChannels(workspaceId: string): Promise<ApiResponse<Channel[]>> {
    const res = await apiClient.get(`/channels/workspace/${workspaceId}`);
    return res.data;
  },

  // 채널 상세 조회
  async getChannelById(channelId: string): Promise<ApiResponse<Channel>> {
    const res = await apiClient.get(`/channels/${channelId}`);
    return res.data;
  },

  // 채널 생성
  async createChannel(data: {
    workspaceId: string;
    name: string;
    description?: string;
    type: 'TEXT' | 'VOICE' | 'PRIVATE';
    visibility?: 'PUBLIC' | 'PRIVATE';
    members?: string[];
  }): Promise<ApiResponse<Channel>> {
    const res = await apiClient.post<ApiResponse<Channel>>('/channels', data);
    return res.data;
  },

  // 채널 수정
  async updateChannel(channelId: string, data: Partial<Channel>): Promise<ApiResponse<Channel>> {
    const res = await apiClient.put(`/channels/${channelId}`, data);
    return res.data;
  },

  // 채널 삭제
  async deleteChannel(channelId: string): Promise<ApiResponse<void>> {
    const res = await apiClient.delete(`/channels/${channelId}`);
    return res.data;
  },

  // 채널 참여
  async joinChannel(channelId: string): Promise<ApiResponse<void>> {
    const res = await apiClient.post(`/channels/${channelId}/join`);
    return res.data;
  },

  // 채널 나가기
  async leaveChannel(channelId: string): Promise<ApiResponse<void>> {
    const res = await apiClient.post(`/channels/${channelId}/leave`);
    return res.data;
  },
};
