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
  lastActive?: string;
  preferences: any;
}