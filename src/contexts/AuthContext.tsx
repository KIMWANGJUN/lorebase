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
      // Ensure date strings are converted back to Date objects
      if (parsedUser.nicknameLastChanged) {
        parsedUser.nicknameLastChanged = new Date(parsedUser.nicknameLastChanged);
      }
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
      const userToSet = {...foundUser};
      if (userToSet.nicknameLastChanged && typeof userToSet.nicknameLastChanged === 'string') {
        userToSet.nicknameLastChanged = new Date(userToSet.nicknameLastChanged);
      }
      setUser(userToSet);
      setIsAdmin(userToSet.username === 'WANGJUNLAND');
      localStorage.setItem('currentUser', JSON.stringify(userToSet));
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
      let finalUpdatedFields = { ...updatedUserPartial };

      // If nickname is being changed, set nicknameLastChanged
      if (updatedUserPartial.nickname && updatedUserPartial.nickname.trim() !== user.nickname) {
        finalUpdatedFields.nicknameLastChanged = new Date();
      }

      const updatedUserObject = { ...user, ...finalUpdatedFields };
      
      // Ensure date is correctly typed before setting state and local storage
      if (updatedUserObject.nicknameLastChanged && typeof updatedUserObject.nicknameLastChanged === 'string') {
        updatedUserObject.nicknameLastChanged = new Date(updatedUserObject.nicknameLastChanged);
      }

      setUser(updatedUserObject);
      localStorage.setItem('currentUser', JSON.stringify(updatedUserObject));

      // Update isAdmin status if username changes (though unlikely in this partial update)
      if (updatedUserPartial.username) {
        setIsAdmin(updatedUserPartial.username === 'WANGJUNLAND');
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
