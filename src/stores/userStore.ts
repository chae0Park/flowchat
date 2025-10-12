import { create } from 'zustand';
import { User } from '../types/userTypes';

interface UserStore {
  users: User[];
  setUsers: (users: User[]) => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  clearUsers: () => set({ users: [] }),
}));
