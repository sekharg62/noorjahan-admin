import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { getApiErrorMessage } from '../lib/apiClient';
import * as authService from '../services/authService';
import type { AdminUser, LoginCredentials, LoginResponse } from '../types/auth';

type AuthContextValue = {
  user: AdminUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AdminUser | null {
  const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => readStoredUser());
  const [authToken, setAuthToken] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  );
  const [isLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(response.admin));

      setAuthToken(response.token);
      setUser(response.admin);

      return response;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Login failed'));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authToken,
      isAuthenticated: Boolean(authToken && user),
      isLoading,
      login,
      logout,
    }),
    [user, authToken, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
