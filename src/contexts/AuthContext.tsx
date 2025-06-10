
// src/contexts/AuthContext.tsx
"use client";
import type { User, NewUserDto as SignupUserDto, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers, addUser as addUserToMockList } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: SignupUserDto) => Promise<{ success: boolean, message?: string }>;
  updateUser: (updatedUserPartial: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      if (parsedUser.nicknameLastChanged && typeof parsedUser.nicknameLastChanged === 'string') {
        parsedUser.nicknameLastChanged = new Date(parsedUser.nicknameLastChanged);
      }
      // Ensure new granular preferences are defaulted if not present
      parsedUser.selectedTitleIdentifier = parsedUser.selectedTitleIdentifier || 'none';
      parsedUser.selectedNicknameEffectIdentifier = parsedUser.selectedNicknameEffectIdentifier || 'none';
      parsedUser.selectedLogoIdentifier = parsedUser.selectedLogoIdentifier || 'none';
      
      setUser(parsedUser);
      setIsAdmin(parsedUser.username === 'WANGJUNLAND');
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let foundUser = mockUsers.find(u => u.username === username && (username === 'WANGJUNLAND' ? u.password === pass : u.password === pass));

    if (foundUser) {
      const userToSet = {...foundUser};
      if (userToSet.nicknameLastChanged && typeof userToSet.nicknameLastChanged === 'string') {
        userToSet.nicknameLastChanged = new Date(userToSet.nicknameLastChanged);
      }
      userToSet.selectedTitleIdentifier = userToSet.selectedTitleIdentifier || 'none';
      userToSet.selectedNicknameEffectIdentifier = userToSet.selectedNicknameEffectIdentifier || 'none';
      userToSet.selectedLogoIdentifier = userToSet.selectedLogoIdentifier || 'none';

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

  const signup = async (userData: SignupUserDto): Promise<{ success: boolean, message?: string }> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const result = addUserToMockList(userData); // addUserToMockList should handle new fields
    setLoading(false);
    return result;
  };

  const updateUser = (updatedUserPartial: Partial<User>) => {
    if (user) {
      let finalUpdatedFields = { ...updatedUserPartial };

      if (updatedUserPartial.nickname && updatedUserPartial.nickname.trim() !== user.nickname) {
        finalUpdatedFields.nicknameLastChanged = new Date();
      }
      
      const updatedUserObject: User = {
        ...user,
        ...finalUpdatedFields,
        selectedTitleIdentifier: finalUpdatedFields.selectedTitleIdentifier || user.selectedTitleIdentifier || 'none',
        selectedNicknameEffectIdentifier: finalUpdatedFields.selectedNicknameEffectIdentifier || user.selectedNicknameEffectIdentifier || 'none',
        selectedLogoIdentifier: finalUpdatedFields.selectedLogoIdentifier || user.selectedLogoIdentifier || 'none',
      };
      
      if (updatedUserObject.nicknameLastChanged && typeof updatedUserObject.nicknameLastChanged === 'string') {
        updatedUserObject.nicknameLastChanged = new Date(updatedUserObject.nicknameLastChanged);
      }

      setUser(updatedUserObject);
      localStorage.setItem('currentUser', JSON.stringify(updatedUserObject));

      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { 
            ...mockUsers[userIndex], 
            ...finalUpdatedFields, 
            selectedTitleIdentifier: updatedUserObject.selectedTitleIdentifier,
            selectedNicknameEffectIdentifier: updatedUserObject.selectedNicknameEffectIdentifier,
            selectedLogoIdentifier: updatedUserObject.selectedLogoIdentifier,
        };
      }

      if (updatedUserPartial.username) {
        setIsAdmin(updatedUserPartial.username === 'WANGJUNLAND');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, signup, updateUser, loading }}>
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
