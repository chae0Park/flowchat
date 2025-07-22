import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('flowtalk_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: '김민수',
        email,
        avatar: '김',
        status: 'online'
      };
      
      setUser(mockUser);
      localStorage.setItem('flowtalk_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name,
        email,
        avatar: name.charAt(0),
        status: 'online'
      };
      
      setUser(mockUser);
      localStorage.setItem('flowtalk_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const demoUser: User = {
        id: 'demo',
        name: '데모 사용자',
        email: 'demo@flowtalk.com',
        avatar: '데',
        status: 'FlowTalk 체험 중 🚀'
      };
      
      setUser(demoUser);
      localStorage.setItem('flowtalk_user', JSON.stringify(demoUser));
    } catch (error) {
      throw new Error('데모 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('flowtalk_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginDemo, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};