// src/stores/channelStore.ts
import { create } from 'zustand';
import { Channel } from '../types/chatTypes';

interface ChannelState {
  channels: Channel[];
  currentChannel: Channel | null;
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: string) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  clearChannels: () => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  currentChannel: null,
  setChannels: (channels) => set({ channels }),
  addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
  removeChannel: (channelId) =>
    set((state) => ({ channels: state.channels.filter((c) => c.id !== channelId) })),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  clearChannels: () => set({ channels: [], currentChannel: null }),
}));
