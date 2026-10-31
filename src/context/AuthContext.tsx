import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setToken, removeToken, getToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getProfile();
        setUser(response.user);
        setTokenState(storedToken);
      } catch (err) {
        console.error('Session expired or invalid:', err);
        removeToken();
        setUser(null);
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.register({ name, email, password, phone });
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
