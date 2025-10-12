// src/services/apiClient.ts
import axios, { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔒 JWT 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = authState?.state?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 토큰 자동 재발급
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        const refreshToken = authState?.state?.refreshToken;
        if (!refreshToken) throw new Error('No refresh token found');

        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

        if (res.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;

          // 상태 업데이트
          const newState = {
            ...authState,
            state: {
              ...authState.state,
              accessToken,
              refreshToken: newRefreshToken,
            },
          };
          localStorage.setItem('auth-storage', JSON.stringify(newState));

          // 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('auth-storage');
        if (typeof window !== 'undefined') window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
