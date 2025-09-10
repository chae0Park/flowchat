// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { apiClient, LoginRequest, RegisterRequest } from '../services/api';
import { useEffect } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    isLoading: storeLoading,
    login: storeLogin,
    register: storeRegister,
    loginDemo: storeLoginDemo,
    logout: storeLogout,
    refreshUserData,
    initializeAuth,
    clearAuth,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginRequest) => {
      await storeLogin(email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }: RegisterRequest) => {
      await storeRegister(name, email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });

  // Demo login mutation
  const demoLoginMutation = useMutation({
    mutationFn: async () => {
      await storeLoginDemo();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (error) => {
      console.error('Demo login error:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await storeLogout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      clearAuth();
      queryClient.clear();
    },
  });

  // Current user query - only run when authenticated
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch user');
    },
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        clearAuth();
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Sync user data with store when query succeeds
  useEffect(() => {
    if (userQuery.data && userQuery.data !== user) {
      useAuthStore.getState().setUser(userQuery.data);
    }
  }, [userQuery.data, user]);

  // Handle query errors
  useEffect(() => {
    if (userQuery.error && isAuthenticated) {
      console.error('User query error:', userQuery.error);
      // Clear auth on persistent errors
      clearAuth();
    }
  }, [userQuery.error, isAuthenticated, clearAuth]);

  return {
    // User data
    user,
    isAuthenticated,
    isLoading: storeLoading || loginMutation.isPending || registerMutation.isPending || demoLoginMutation.isPending || logoutMutation.isPending,

    // Login
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoginLoading: loginMutation.isPending,

    // Register
    signup: registerMutation.mutateAsync,
    signupError: registerMutation.error,
    isSignupLoading: registerMutation.isPending,

    // Demo login
    loginDemo: demoLoginMutation.mutateAsync,
    demoLoginError: demoLoginMutation.error,
    isDemoLoginLoading: demoLoginMutation.isPending,

    // Logout
    logout: logoutMutation.mutateAsync,
    logoutError: logoutMutation.error,
    isLogoutLoading: logoutMutation.isPending,

    // User query
    refetchUser: userQuery.refetch,
    userError: userQuery.error,
    isUserLoading: userQuery.isLoading,
    
    // Additional utilities
    refreshUserData,
    clearAuth,
  };
};