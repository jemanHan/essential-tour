import { useState, useEffect } from 'react';
import { api } from '../api/http';

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'visitkorea_auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // 로컬 스토리지에서 인증 상태 로드
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuthState({
          user: parsedAuth.user,
          isAuthenticated: !!parsedAuth.user,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to parse saved auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 인증 상태를 로컬 스토리지에 저장
  const saveAuthState = (newAuthState: AuthState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
    setAuthState(newAuthState);
  };

  // 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      // 실제 로그인 API 호출 (환경별 베이스 URL/헤더 공통 적용)
      const data = await api('/v1/auth/login', {
        method: 'POST',
        body: { email, password }
      });
        const user: User = {
          id: data.user.id,
          name: data.user.displayName || email.split('@')[0],
          email: data.user.email
        };
        
        const newAuthState: AuthState = {
          user,
          isAuthenticated: true,
          isLoading: false
        };
        
        // JWT 토큰을 vk_token 키로도 저장 (API 호출용)
        if (data.token) {
          localStorage.setItem('vk_token', data.token);
        }
        
        saveAuthState(newAuthState);
        return true;
      
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // 회원가입 함수
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      // 실제 회원가입 API 호출 (환경별 베이스 URL/헤더 공통 적용)
      const data = await api('/v1/auth/signup', {
        method: 'POST',
        body: { email, password, displayName: name }
      });
        const user: User = {
          id: data.user.id,
          name: data.user.displayName || name,
          email: data.user.email
        };
        
        const newAuthState: AuthState = {
          user,
          isAuthenticated: true,
          isLoading: false
        };
        
        // JWT 토큰을 vk_token 키로도 저장 (API 호출용)
        if (data.token) {
          localStorage.setItem('vk_token', data.token);
        }
        
        saveAuthState(newAuthState);
        return true;
      
    } catch (error) {
      console.error('Signup error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    const newAuthState: AuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
    
    saveAuthState(newAuthState);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('vk_token'); // JWT 토큰도 제거
  };

  return {
    ...authState,
    login,
    signup,
    logout
  };
};
