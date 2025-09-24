//src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { WebSocketService, MockWebSocketService, TypingIndicator } from '../services/websocket';

export const useWebSocket = (userId: string, token: string = 'mock-token') => {
  const wsRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    // Use MockWebSocketService for development
    wsRef.current = new MockWebSocketService(userId, token);

    const connectWebSocket = async () => {
      try {
        await wsRef.current!.connect();
        setIsConnected(true);

        // Set up message handlers
        wsRef.current!.on('typing', (data: TypingIndicator) => {
          setTypingUsers(prev => {
            const filtered = prev.filter(user => user.userId !== data.userId);
            if (data.isTyping) {
              return [...filtered, data];
            }
            return filtered;
          });
        });

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [userId, token]);

  const sendMessage = (channelId: string, content: string, files?: File[]) => {
    if (wsRef.current) {
      wsRef.current.sendMessage(channelId, content, files);
    }
  };

  const sendTyping = (channelId: string, isTyping: boolean) => {
    if (wsRef.current) {
      wsRef.current.sendTyping(channelId, isTyping);
    }
  };

  const sendReaction = (messageId: string, emoji: string, channelId: string) => {
    if (wsRef.current) {
      wsRef.current.sendReaction(messageId, emoji, channelId);
    }
  };

  const joinChannel = (channelId: string) => {
    if (wsRef.current) {
      wsRef.current.joinChannel(channelId);
    }
  };

  const leaveChannel = (channelId: string) => {
    if (wsRef.current) {
      wsRef.current.leaveChannel(channelId);
    }
  };

  const onMessage = (handler: (data: any) => void) => {
    if (wsRef.current) {
      wsRef.current.on('message', handler);
    }
  };

  return {
    isConnected,
    typingUsers,
    sendMessage,
    sendTyping,
    sendReaction,
    joinChannel,
    leaveChannel,
    onMessage
  };
};