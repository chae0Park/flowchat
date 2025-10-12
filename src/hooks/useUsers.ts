import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { userApi } from '../services/userApi';
import { useUserStore } from '../stores/userStore';
import { User } from '../types/userTypes';

export const useUsers = (searchQuery: string) => {
  const { setUsers } = useUserStore();

  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const res = await userApi.searchUsers(searchQuery);
      if (!res.success || !res.data) throw new Error(res.error || '유저 조회 실패');
      return res.data;
    },
    enabled: searchQuery.trim().length > 0, // 검색어 있을 때만 호출
  });

  useEffect(() => {
    if (data) setUsers(data);
  }, [data, setUsers]);

  return { users: data ?? [], isLoading, error };
};
