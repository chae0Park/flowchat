// src/services/authApi.ts
import { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import { User, ApiResponse } from '../types/userTypes';


export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const res: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/login', data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const res: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async logout(): Promise<ApiResponse> {
    const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const refreshToken = authState?.state?.refreshToken;
    const res: AxiosResponse<ApiResponse> = await apiClient.post('/auth/logout', { refreshToken });
    return res.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const res: AxiosResponse<ApiResponse<User>> = await apiClient.get('/auth/me');
    return res.data;
  },

  async loginDemo(): Promise<ApiResponse<AuthResponse>> {
    const demoCredentials = { email: 'demo@flowtalk.com', password: 'demo123' };
    const res: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/login', demoCredentials);
    return res.data;
  },
};
