import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/chatApi';
import { Channel, Message } from '../types/chatTypes';
import { useChatStore } from '../stores/chatStore';
import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuthStore } from '../stores/authStore';

export const useChat = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const {
    channels,
    messages,
    currentChannel,
    setChannels,
    setMessages,
    addMessage,
    switchChannel,
    setConnection,
  } = useChatStore();

  // ✅ WebSocket 연결 (유저 ID 전달)
  const {
    isConnected,
    sendMessage: wsSendMessage,
    sendReaction: wsSendReaction,
    joinChannel: wsJoinChannel,
    leaveChannel: wsLeaveChannel,
    onMessage,
  } = useWebSocket(user?.id ?? 'demo', 'mock-token');

  // 연결 상태 반영
  useEffect(() => {
    setConnection(isConnected);
  }, [isConnected, setConnection]);

  // 📡 채널 목록 가져오기
  const { data: fetchedChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: async (): Promise<Channel[]> => {
      const res = await chatApi.getChannels();
      if (!res.success || !res.data) throw new Error(res.error || '채널 목록 불러오기 실패');
      return res.data;
    },
  });
  //react v5 부터 onSuccess 옵션이 사라져서 useEffect로 대체
    useEffect(() => {
        if (fetchedChannels) {
            setChannels(fetchedChannels);
        }
    }, [fetchedChannels, setChannels]);

  // 💬 현재 채널 메시지
  const { data: fetchedMessages } = useQuery({
    queryKey: ['messages', currentChannel],
    queryFn: async (): Promise<Message[]> => {
      const res = await chatApi.getMessages(currentChannel!);
      if (!res.success || !res.data) throw new Error(res.error || '메시지 불러오기 실패');
      return res.data;
    },
    enabled: !!currentChannel,
  });
  useEffect(() => {
    if(fetchedMessages && currentChannel) {
        setMessages(currentChannel, fetchedMessages);
    }
  }, [currentChannel, fetchedMessages, setMessages]);


  // 📨 메시지 전송
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentChannel) throw new Error('채널이 선택되지 않았습니다.');
      const res = await chatApi.sendMessage(currentChannel, content);
      if (!res.success || !res.data) throw new Error(res.error || '메시지 전송 실패');
      return res.data;
    },
    onSuccess: (msg) => {
      addMessage(currentChannel!, msg);
      queryClient.invalidateQueries({ queryKey: ['messages', currentChannel] });
      wsSendMessage(currentChannel!, msg.content);
    },
    onError: (error) => {
      console.error('메시지 전송 에러:', error);
    },
  });

  // 🔄 WebSocket 수신 메시지 처리
  useEffect(() => {
    onMessage((msg: Message) => {
      addMessage(msg.channelId, msg);
      if (msg.channelId === currentChannel) {
        queryClient.invalidateQueries({ queryKey: ['messages', msg.channelId] });
      }
    });
  }, [onMessage, addMessage, currentChannel, queryClient]);

  return {
    channels: fetchedChannels ?? channels,
    messages: currentChannel ? fetchedMessages ?? messages[currentChannel] ?? [] : [],
    currentChannel,
    switchChannel,
    sendMessage: (content: string) => sendMessageMutation.mutate(content),
    isConnected,
    isSending: sendMessageMutation.isPending,
  };
};
