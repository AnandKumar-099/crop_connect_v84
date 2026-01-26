import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/apiService';

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  profileImageUrl?: string;
  farmDetails?: {
    farmName: string;
    address: string;
    sizeInAcres: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (params: RegisterParams) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const loggedInUser = await apiService.login(email, password);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (params: RegisterParams): Promise<User> => {
    setLoading(true);
    try {
      const newUser = await apiService.register(params);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
        throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = { user, loading, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};