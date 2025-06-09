
// src/contexts/AuthContext.tsx
"use client";
import type { User, NewUserDto as SignupUserDto } from '@/types'; // Changed import name
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers, addUser as addUserToMockList } from '@/lib/mockData'; // Using mockUsers for initial data

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: SignupUserDto) => Promise<{ success: boolean, message?: string }>; // Added signup
  updateUser: (updatedUser: Partial<User>) => void;
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
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    let foundUser: User | undefined;
    if (username === 'WANGJUNLAND') {
      if (pass === 'WJLAND1013$') { // Strict password check for admin
        foundUser = mockUsers.find(u => u.username === 'WANGJUNLAND');
      }
    } else {
      // For regular users, check username and password
      foundUser = mockUsers.find(u => u.username === username && u.password === pass);
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

  const signup = async (userData: SignupUserDto): Promise<{ success: boolean, message?: string }> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    const result = addUserToMockList(userData); // This now modifies the global mockUsers array
    
    setLoading(false);
    return result; // result contains { success: boolean, message?: string, user?: User }
  };


  const updateUser = (updatedUserPartial: Partial<User>) => {
    if (user) {
      let finalUpdatedFields = { ...updatedUserPartial };

      if (updatedUserPartial.nickname && updatedUserPartial.nickname.trim() !== user.nickname) {
        finalUpdatedFields.nicknameLastChanged = new Date();
      }

      const updatedUserObject = { ...user, ...finalUpdatedFields };
      
      if (updatedUserObject.nicknameLastChanged && typeof updatedUserObject.nicknameLastChanged === 'string') {
        updatedUserObject.nicknameLastChanged = new Date(updatedUserObject.nicknameLastChanged);
      }

      setUser(updatedUserObject);
      localStorage.setItem('currentUser', JSON.stringify(updatedUserObject));

      // Update global mockUsers array as well for consistency across sessions if needed (or if page reloads without localstorage clear)
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...finalUpdatedFields };
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

