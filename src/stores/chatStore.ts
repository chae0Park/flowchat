// src/stores/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, Message } from '../types/chatTypes';

interface ChatState {
  channels: Channel[];
  messages: Record<string, Message[]>; // channelId별 메시지
  currentChannel: string | null;
  typingUsers: string[];
  isConnected: boolean;
}

interface ChatActions {
  setChannels: (channels: Channel[]) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  switchChannel: (channelId: string) => void;
  setTypingUsers: (users: string[]) => void;
  setConnection: (status: boolean) => void;
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      channels: [],
      messages: {},
      currentChannel: null,
      typingUsers: [],
      isConnected: false,

      setChannels: (channels) => set({ channels }),
      setMessages: (channelId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [channelId]: messages },
        })),
      addMessage: (channelId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: [...(state.messages[channelId] || []), message],
          },
        })),
      switchChannel: (channelId) => set({ currentChannel: channelId }),
      setTypingUsers: (users) => set({ typingUsers: users }),
      setConnection: (status) => set({ isConnected: status }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
