// src/stores/authStore.ts
//purpose: Manage authentication state using Zustand with persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, User, AuthResponse } from '../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  refreshUserData: () => Promise<void>;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login({ email, password });
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || '로그인에 실패했습니다.');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.error || error?.message || '로그인에 실패했습니다.');
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register({ name, email, password });
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || '회원가입에 실패했습니다.');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.error || error?.message || '회원가입에 실패했습니다.');
        }
      },

      loginDemo: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.loginDemo();
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || '데모 로그인에 실패했습니다.');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.error || error?.message || '데모 로그인에 실패했습니다.');
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        set({ isLoading: true });
        
        try {
          if (refreshToken) {
            await apiClient.logout();
          }
        } catch (error) {
          console.error('Logout API error:', error);
          // Continue with local logout even if API call fails
        } finally {
          set({
            ...initialState,
          });
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user: User) => {
        set({ 
          user,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          ...initialState,
        });
      },

      refreshUserData: async () => {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            set({ user: response.data });
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          // If refresh fails, clear auth
          get().clearAuth();
          throw error;
        }
      },

      // Initialize auth state on app start
      initializeAuth: () => {
        const state = get();
        if (state.accessToken && state.refreshToken) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);