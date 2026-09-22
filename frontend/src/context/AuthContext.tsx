import React, { createContext, useContext, useState, useMemo } from 'react';
import type { User, LoginPayload } from '../types';
import { ROLES } from '../constants/roles';
import { api } from '../services/api';
import {
  getToken,
  setToken as saveToken,
  getUser,
  setUser as saveUser,
  clearAuth,
} from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getUser());
  const [token, setToken] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      setToken(data.token);
      setUser(data.user);
      saveToken(data.token);
      saveUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const isAdmin = useMemo(() => user?.role === ROLES.ADMIN, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
