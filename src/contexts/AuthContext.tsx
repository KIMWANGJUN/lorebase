
// src/contexts/AuthContext.tsx
"use client";
import type { User, NewUserDto as SignupUserDto, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers, addUserToMockList, mockUsersData as initialMockUsersData } from '@/lib/mockData'; // Import initialMockUsersData for re-assigning during login if needed

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
      parsedUser.selectedTitleIdentifier = parsedUser.selectedTitleIdentifier || 'none';
      parsedUser.selectedNicknameEffectIdentifier = parsedUser.selectedNicknameEffectIdentifier || 'none';
      parsedUser.selectedLogoIdentifier = parsedUser.selectedLogoIdentifier || 'none';
      parsedUser.socialProfiles = parsedUser.socialProfiles || {}; // Ensure socialProfiles exists
      
      setUser(parsedUser);
      setIsAdmin(parsedUser.username === 'wangjunland');
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find user in the current mockUsers array (which is recalculated with ranks)
    let foundUser = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);

    if (foundUser) {
      const userToSet = {...foundUser};
      if (userToSet.nicknameLastChanged && typeof userToSet.nicknameLastChanged === 'string') {
        userToSet.nicknameLastChanged = new Date(userToSet.nicknameLastChanged);
      }
      userToSet.selectedTitleIdentifier = userToSet.selectedTitleIdentifier || 'none';
      userToSet.selectedNicknameEffectIdentifier = userToSet.selectedNicknameEffectIdentifier || 'none';
      userToSet.selectedLogoIdentifier = userToSet.selectedLogoIdentifier || 'none';
      userToSet.socialProfiles = userToSet.socialProfiles || {}; // Ensure socialProfiles on login

      setUser(userToSet);
      setIsAdmin(userToSet.username === 'wangjunland');
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
    // addUserToMockList now correctly initializes new users without email from form
    // and with empty socialProfiles.
    const result = addUserToMockList(userData); 
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
        socialProfiles: finalUpdatedFields.socialProfiles || user.socialProfiles || {}, // Ensure socialProfiles is preserved/updated
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
            socialProfiles: updatedUserObject.socialProfiles, // Persist to mockUsers array
        };
      }
      // Also update the initialMockUsersData if the user exists there to keep source consistent
      const initialUserIndex = initialMockUsersData.findIndex(u => u.id === user.id);
      if(initialUserIndex !== -1) {
        initialMockUsersData[initialUserIndex] = {
          ...initialMockUsersData[initialUserIndex],
           ...finalUpdatedFields,
           // We don't store selected preferences or dynamic ranks in initialMockUsersData
           // But socialProfiles should be updated if it changes
           socialProfiles: updatedUserObject.socialProfiles,
           email: updatedUserObject.email, // if email is updated
           nickname: updatedUserObject.nickname, // if nickname is updated
        }
      }


      if (updatedUserPartial.username) {
        setIsAdmin(updatedUserPartial.username === 'wangjunland');
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
