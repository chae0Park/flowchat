// src/hooks/useDM.ts
import { useMutation } from '@tanstack/react-query';
import { dmApi } from '../services/dmApi';
import { useDMStore } from '../stores/dmStore';
import { AxiosResponse } from 'axios';
import { Channel } from '../types/chatTypes';

export const useStartDM = () => {
  const { addDM } = useDMStore();

  const mutation = useMutation({
    mutationFn: async (params: { workspaceId: string; targetUserId: string }) => {
      const res: AxiosResponse<Channel> = await dmApi.startDM(params.workspaceId, params.targetUserId);
      return res.data;
    },
    onSuccess: (dm) => {
      addDM(dm);
    },
  });

  return mutation;
};
