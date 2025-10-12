//src/contexts/ChatContext.tsx
//메세지 mock data
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuthStore } from '../stores/authStore';


interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; active: boolean }[];
  files?: { name: string; size: number; type: string }[];
}

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unread: number;
  active: boolean;
  members?: string[];
}

interface ChatContextType {
  messages: Message[];
  channels: Channel[];
  currentChannel: string;
  isConnected: boolean;
  typingUsers: any[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  switchChannel: (channelId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  searchMessages: (query: string) => Message[];
  sendTyping: (channelId: string, isTyping: boolean) => void;
  createChannel: (channelData: { name: string; description: string; isPrivate: boolean }) => void;
  startDirectMessage: (userId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentChannel, setCurrentChannel] = useState('general');
  const user = useAuthStore((state) => state.user);
  
  // WebSocket integration
  const {
    isConnected,
    typingUsers,
    sendMessage: wsSendMessage,
    sendTyping,
    sendReaction: wsSendReaction,
    joinChannel: wsJoinChannel,
    leaveChannel: wsLeaveChannel,
    onMessage
  } = useWebSocket(user?.id || 'demo', 'mock-token');
  
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'general', name: '일반', type: 'channel', unread: 0, active: true },
    { id: 'dev', name: '개발', type: 'channel', unread: 3, active: false },
    { id: 'design', name: '디자인', type: 'channel', unread: 0, active: false },
    { id: 'random', name: '잡담', type: 'channel', unread: 1, active: false },
    { id: 'dm1', name: '이지혜', type: 'dm', unread: 0, active: false },
    { id: 'dm2', name: '박준호', type: 'dm', unread: 2, active: false },
    { id: 'dm3', name: '최유진', type: 'dm', unread: 0, active: false },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: '김민수',
      avatar: '김',
      content: '안녕하세요! 새로운 프로젝트 관련해서 오늘 회의 어떠세요?',
      timestamp: '오후 2:30',
      reactions: [
        { emoji: '👍', count: 3, active: true },
        { emoji: '👏', count: 1, active: false }
      ]
    },
    {
      id: '2',
      user: '이지혜',
      avatar: '이',
      content: '좋아요! 오후 3시에 회의실에서 만나요. 자료도 미리 준비해 올게요 📊',
      timestamp: '오후 2:32',
      reactions: [
        { emoji: '✅', count: 2, active: false }
      ]
    },
    {
      id: '3',
      user: '박준호',
      avatar: '박',
      content: '저도 참석할게요! 개발 진행 상황 공유드릴 부분이 있어서요.',
      timestamp: '오후 2:35',
      reactions: []
    },
    {
      id: '4',
      user: '최유진',
      avatar: '최',
      content: 'UI 디자인 업데이트 완료했습니다! 확인해 주세요 🎨',
      timestamp: '오후 2:38',
      reactions: [
        { emoji: '🎉', count: 4, active: false },
        { emoji: '👀', count: 2, active: false }
      ]
    },
    {
      id: '5',
      user: '데모 사용자',
      avatar: '데',
      content: '안녕하세요! FlowTalk 데모에 오신 것을 환영합니다! 🎉 이곳에서 메시지를 보내고, 파일을 공유하고, 팀원들과 소통해보세요.',
      timestamp: '방금 전',
      reactions: [
        { emoji: '👋', count: 1, active: false },
        { emoji: '🚀', count: 2, active: false }
      ]
    },
    {
      id: '6',
      user: '김민수',
      avatar: '김',
      content: '데모 사용자님 환영합니다! FlowTalk의 다양한 기능들을 자유롭게 체험해보세요. 질문이 있으시면 언제든 말씀해주세요! 😊',
      timestamp: '방금 전',
      reactions: []
    }
  ]);

  // Set up WebSocket message handler
  React.useEffect(() => {
    onMessage((newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
    });
  }, [onMessage]);

  // Join channel when switching
  React.useEffect(() => {
    if (currentChannel) {
      wsJoinChannel(currentChannel);
    }
  }, [currentChannel, wsJoinChannel]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Send via WebSocket
    if (user) {
      wsSendMessage(currentChannel, message.content, message.files?.map(f => new File([], f.name)));
    }
  };

  const switchChannel = (channelId: string) => {
    // Leave current channel
    if (currentChannel) {
      wsLeaveChannel(currentChannel);
    }
    
    setCurrentChannel(channelId);
    
    // Join new channel
    wsJoinChannel(channelId);
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.active) {
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, active: false }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, active: true }
                  : r
              )
            };
          }
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, active: true }]
          };
        }
      }
      return msg;
    }));
    
    // Send reaction via WebSocket
    wsSendReaction(messageId, emoji, currentChannel);
  };

  const searchMessages = (query: string) => {
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase()) ||
      msg.user.toLowerCase().includes(query.toLowerCase())
    );
  };

  const createChannel = (channelData: { name: string; description: string; isPrivate: boolean }) => {
    const newChannel: Channel = {
      id: `channel_${Date.now()}`,
      name: channelData.name,
      type: 'channel',
      unread: 0,
      active: false,
      members: ['김민수'] // Current user as creator
    };
    setChannels(prev => [...prev, newChannel]);
    setCurrentChannel(newChannel.id);
  };
const startDirectMessage = (userId: string) => {
    // Mock user data - in real app, this would come from user management
    const users = [
      { id: '1', name: '김민수', avatar: '김' },
      { id: '2', name: '이지혜', avatar: '이' },
      { id: '3', name: '박준호', avatar: '박' },
      { id: '4', name: '최유진', avatar: '최' },
      { id: '5', name: '정민호', avatar: '정' },
      { id: '6', name: '한소영', avatar: '한' }
    ];
    
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    
    // Check if DM already exists
    const existingDM = channels.find(ch => 
      ch.type === 'dm' && ch.name === targetUser.name
    );
    
    if (existingDM) {
      setCurrentChannel(existingDM.id);
      return;
    }
    
    // Create new DM
    const newDM: Channel = {
      id: `dm_${Date.now()}`,
      name: targetUser.name,
      type: 'dm',
      unread: 0,
      active: false,
      members: ['김민수', targetUser.name]
    };
    
    setChannels(prev => [...prev, newDM]);
    setCurrentChannel(newDM.id);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      channels,
      currentChannel,
      isConnected,
      typingUsers,
      addMessage,
      switchChannel,
      toggleReaction,
      createChannel,
      startDirectMessage,
      searchMessages,
      sendTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};