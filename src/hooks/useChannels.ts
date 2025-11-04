// src/hooks/useChannels.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelApi } from '../services/channelApi';
import { useChannelStore } from '../stores/channelStore';
import { Channel } from '../types/chatTypes';
import { useEffect } from 'react';

// ✅ 채널 목록 가져오기
export const useChannels = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { setChannels } = useChannelStore();

  const channelsQuery = useQuery<Channel[]>({
    queryKey: ['channels', workspaceId],
    queryFn: async () => {
      const res = await channelApi.getWorkspaceChannels(workspaceId);
      if (!res.success || !res.data) throw new Error(res.error || '채널 목록 불러오기 실패');
      return res.data;
    },
  });

  // ✅ v5 방식: 데이터 갱신은 useEffect에서 처리
  useEffect(() => {
    if (channelsQuery.data) {
      setChannels(channelsQuery.data);
    }
  }, [channelsQuery.data, setChannels]);

  return {
    ...channelsQuery,
    channels: channelsQuery.data ?? [],
  };
};

// ✅ 채널 생성
export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const { addChannel } = useChannelStore();

  const createMutation = useMutation({
    mutationFn: channelApi.createChannel,
  });

  // ✅ v5 방식: 성공 시 동작을 useEffect로 처리
  useEffect(() => {
    if (createMutation.data?.success && createMutation.data.data) {
      addChannel(createMutation.data.data);
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    }
  }, [createMutation.data, addChannel, queryClient]);

  return createMutation;
};
