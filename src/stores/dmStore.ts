// src/stores/dmStore.ts
import { create } from 'zustand';
import { Channel } from '../types/chatTypes';

interface DMState {
  dms: Channel[];
  addDM: (dm: Channel) => void;
  setDMs: (dms: Channel[]) => void;
}

export const useDMStore = create<DMState>((set) => ({
  dms: [],
  addDM: (dm) => set((state) => ({ dms: [...state.dms, dm] })),
  setDMs: (dms) => set({ dms }),
}));

//TODO: GET 이 있어야 함. 