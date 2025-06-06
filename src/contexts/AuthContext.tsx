// src/contexts/AuthContext.tsx
"use client";
import type { User } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers } from '@/lib/mockData'; // Using mockUsers for initial data

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate checking for persisted login state
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.username === 'WANGJUNLAND');
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let foundUser: User | undefined;
    if (username === 'WANGJUNLAND' && pass === 'WJLAND1013$') {
      foundUser = mockUsers.find(u => u.username === 'WANGJUNLAND');
    } else {
      foundUser = mockUsers.find(u => u.username === username); // Simplified: no password check for others
    }

    if (foundUser) {
      setUser(foundUser);
      setIsAdmin(foundUser.username === 'WANGJUNLAND');
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updatedUserPartial: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedUserPartial };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      if (updatedUserPartial.username && updatedUserPartial.username === 'WANGJUNLAND') {
        setIsAdmin(true);
      } else if (updatedUserPartial.username) {
        setIsAdmin(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, updateUser, loading }}>
      {!loading ? children : <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
