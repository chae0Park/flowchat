// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  role: string;
  createdAt: string;
  preferences: any;
}

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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response: AxiosResponse<ApiResponse> = await this.client.post('/auth/logout', { refreshToken });
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.get('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response: AxiosResponse<ApiResponse<{ accessToken: string; refreshToken: string }>> = 
      await this.client.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  // Demo login method
  async loginDemo(): Promise<ApiResponse<AuthResponse>> {
    // Demo 계정으로 로그인 (백엔드에서 지원한다면)
    const demoCredentials = {
      email: 'demo@flowtalk.com',
      password: 'demo123'
    };
    return this.login(demoCredentials);
  }
}

export const apiClient = new ApiClient();