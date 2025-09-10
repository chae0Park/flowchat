// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { apiClient, LoginRequest, RegisterRequest } from '../services/api';

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
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginRequest) => storeLogin(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: RegisterRequest) => storeRegister(name, email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Demo login mutation
  const demoLoginMutation = useMutation({
    mutationFn: () => storeLoginDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => storeLogout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  // Current user query
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return {
    // User data
    user,
    isAuthenticated,
    isLoading: storeLoading || loginMutation.isPending || registerMutation.isPending || demoLoginMutation.isPending,

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
  };
};