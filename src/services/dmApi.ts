// src/services/dmApi.ts
import { apiClient } from './apiClient';
import { AxiosResponse } from 'axios';
import { Channel } from '../types/chatTypes';

export const dmApi = {
  async startDM(workspaceId: string, targetUserId: string): Promise<AxiosResponse<Channel>> {
    return apiClient.post('/dm', { workspaceId, targetUserId });
  },
};
