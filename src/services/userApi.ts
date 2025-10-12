import { apiClient } from './apiClient'; // 기존 apiClient 그대로 재활용
import { User, ApiResponse } from '../types/userTypes'; // 타입 통합


export const userApi = {
  // 🔍 사용자 검색 (백엔드 /users/search)
  async searchUsers(query: string, page = 1, limit = 20): Promise<ApiResponse<User[]>> {
    try {
      const res = await apiClient.get<ApiResponse<User[]>>(`/users/search`, {
        params: { q: query, page, limit },
      });
      return res.data;
    } catch (error: any) {
      console.error('Search users API error:', error);
      throw error;
    }
  },
}

