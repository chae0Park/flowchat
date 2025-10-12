import { useEffect, useRef, useState } from 'react';
import { WebSocketService, MockWebSocketService, TypingIndicator } from '../services/websocket';

/**
 * FlowTalk WebSocket hook
 * userId는 로그인 유저 ID가 없으면 자동으로 'demo' 사용
 */
export const useWebSocket = (userId?: string | null, token: string = 'mock-token') => {
  const wsRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    const effectiveUserId = userId ?? 'demo';
    wsRef.current = new MockWebSocketService(effectiveUserId, token);

    const connectWebSocket = async () => {
      try {
        await wsRef.current!.connect();
        setIsConnected(true);

        // typing 이벤트 핸들러
        wsRef.current!.on('typing', (data: TypingIndicator) => {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== data.userId);
            return data.isTyping ? [...filtered, data] : filtered;
          });
        });
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      wsRef.current?.disconnect();
    };
  }, [userId, token]);

  // 메시지 관련 액션
  const sendMessage = (channelId: string, content: string, files?: File[]) => {
    wsRef.current?.sendMessage(channelId, content, files);
  };

  const sendTyping = (channelId: string, isTyping: boolean) => {
    wsRef.current?.sendTyping(channelId, isTyping);
  };

  const sendReaction = (messageId: string, emoji: string, channelId: string) => {
    wsRef.current?.sendReaction(messageId, emoji, channelId);
  };

  const joinChannel = (channelId: string) => {
    wsRef.current?.joinChannel(channelId);
  };

  const leaveChannel = (channelId: string) => {
    wsRef.current?.leaveChannel(channelId);
  };

  const onMessage = (handler: (data: any) => void) => {
    wsRef.current?.on('message', handler);
  };

  return {
    isConnected,
    typingUsers,
    sendMessage,
    sendTyping,
    sendReaction,
    joinChannel,
    leaveChannel,
    onMessage,
  };
};
