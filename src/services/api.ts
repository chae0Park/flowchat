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

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        // Get token from auth store instead of localStorage directly
        const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        const token = authState?.state?.accessToken;
        
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
            const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            const refreshToken = authState?.state?.refreshToken;
            
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
              refreshToken,
            });

            if (response.data.success) {
              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              
              // Update the auth store
              const currentState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
              const newState = {
                ...currentState,
                state: {
                  ...currentState.state,
                  accessToken,
                  refreshToken: newRefreshToken,
                }
              };
              localStorage.setItem('auth-storage', JSON.stringify(newState));

              // Retry the original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            
            // Clear auth state
            localStorage.removeItem('auth-storage');
            
            // Redirect to auth page
            if (typeof window !== 'undefined') {
              window.location.href = '/auth';
            }
            
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error('Register API error:', error);
      throw error;
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const refreshToken = authState?.state?.refreshToken;
      
      const response: AxiosResponse<ApiResponse> = await this.client.post('/auth/logout', { 
        refreshToken 
      });
      return response.data;
    } catch (error: any) {
      console.error('Logout API error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.client.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Get current user API error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const refreshToken = authState?.state?.refreshToken;
      
      const response: AxiosResponse<ApiResponse<{ accessToken: string; refreshToken: string }>> = 
        await this.client.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      console.error('Refresh token API error:', error);
      throw error;
    }
  }

  // Demo login method - 실제 데모 계정으로 로그인
  async loginDemo(): Promise<ApiResponse<AuthResponse>> {
    try {
      // 실제 데모 계정 정보 사용
      const demoCredentials = {
        email: 'demo@flowtalk.com',
        password: 'demo123'
      };
      
      // 백엔드에 데모 계정이 없다면 일반 로그인 사용
      const response = await this.login(demoCredentials);
      return response;
    } catch (error: any) {
      console.error('Demo login API error:', error);
      // 데모 계정이 없다면 에러 메시지 변경
      if (error?.response?.status === 401) {
        throw new Error('데모 계정을 찾을 수 없습니다. 관리자에게 문의하세요.');
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();