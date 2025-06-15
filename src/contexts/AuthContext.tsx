// src/contexts/AuthContext.tsx
"use client";
import type { User, NewUserDto as SignupUserDto } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers as fallBackMockUsers, mockUsersData as initialMockUsersData, assignCalculatedScoresAndRanks } from '@/lib/mockData';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User as FirebaseUserType } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
  login: (username: string, password: string) => Promise<{ success: boolean, message?: string }>;
  signup: (userData: SignupUserDto) => Promise<{ success: boolean, message?: string, user?: User }>;
  updateUser: (updatedUserPartial: Partial<User>) => void;
  loading: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAdmin: false,
  logout: async () => {},
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  updateUser: () => {},
  loading: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// 검색 결과 [1], [5]에서 확인된 패턴: 명시적 컴포넌트 정의
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('🔥 AuthProvider useEffect 시작');
    
    if (!auth) {
      console.warn('🚨 Firebase Auth 미초기화 - 로딩 해제');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      console.log('🔥 Firebase Auth 상태 변경:', firebaseUser ? firebaseUser.uid : 'null');
      setLoading(true);
      
      if (firebaseUser) {
        // 사용자 로그인 처리 로직...
        let appUser = fallBackMockUsers.find(u => u.email === firebaseUser.email || u.id === firebaseUser.uid);

        if (appUser) {
          const updatedAppUser: User = {
            ...appUser,
            id: firebaseUser.uid,
            email: firebaseUser.email || appUser.email,
            nickname: firebaseUser.displayName || appUser.nickname,
            avatar: firebaseUser.photoURL || appUser.avatar,
          };
          setUser(updatedAppUser);
          setIsAdmin(updatedAppUser.username === 'wangjunland');
          localStorage.setItem('currentUser', JSON.stringify(updatedAppUser));
        } else {
          // 새 사용자 생성 로직...
          const newAppUser: User = {
            id: firebaseUser.uid,
            username: firebaseUser.email || `user_${firebaseUser.uid.substring(0,6)}`,
            nickname: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '새 사용자',
            email: firebaseUser.email || undefined,
            avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${(firebaseUser.displayName || firebaseUser.email || 'N').substring(0,1).toUpperCase()}`,
            score: 0,
            rank: 0,
            tetrisRank: 0,
            categoryStats: { Unity: { score: 0 }, Unreal: { score: 0 }, Godot: { score: 0 }, General: { score: 0 } },
            nicknameLastChanged: new Date(),
            isBlocked: false,
            socialProfiles: {},
            selectedTitleIdentifier: 'none',
            selectedNicknameEffectIdentifier: 'none',
            selectedLogoIdentifier: 'none',
            twoFactorEnabled: false,
          };

          const existingInitial = initialMockUsersData.find(u => u.id === newAppUser.id || u.email === newAppUser.email);
          if (!existingInitial) {
            initialMockUsersData.push({
              id: newAppUser.id,
              username: newAppUser.username,
              nickname: newAppUser.nickname,
              email: newAppUser.email,
              avatar: newAppUser.avatar,
              socialProfiles: newAppUser.socialProfiles,
              twoFactorEnabled: undefined
            });
          }
          
          const updatedMockUsersList = assignCalculatedScoresAndRanks(initialMockUsersData);
          const finalNewAppUser = updatedMockUsersList.find(u => u.id === newAppUser.id) || newAppUser;

          setUser(finalNewAppUser);
          setIsAdmin(finalNewAppUser.username === 'wangjunland');
          localStorage.setItem('currentUser', JSON.stringify(finalNewAppUser));
        }
      } else {
        console.log("🚪 Firebase 사용자 로그아웃");
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    return () => {
      console.log('🔥 AuthProvider cleanup');
      unsubscribe();
    };
  }, []);

  const convertToFirebaseEmail = (username: string): string => {
    if (username.includes('@')) {
      return username;
    }
    return `${username}@lorebase.community`;
  };

  const login = async (username: string, password: string): Promise<{ success: boolean, message?: string }> => {
    if (!auth) {
      return { success: false, message: 'Firebase Auth가 초기화되지 않았습니다.' };
    }

    setLoading(true);
    try {
      const firebaseEmail = convertToFirebaseEmail(username);
      await signInWithEmailAndPassword(auth, firebaseEmail, password);
      setLoading(false);
      return { success: true, message: "로그인 성공!" };
    } catch (error: any) {
      console.error("❌ 로그인 오류:", error);
      let message = "로그인에 실패했습니다.";

      if (error.code === 'auth/user-not-found') {
        message = "존재하지 않는 아이디입니다.";
      } else if (error.code === 'auth/wrong-password') {
        message = "비밀번호가 틀렸습니다.";
      }

      setLoading(false);
      return { success: false, message };
    }
  };

  const signup = async (userData: SignupUserDto): Promise<{ success: boolean, message?: string, user?: User }> => {
    if (!auth) {
      return { success: false, message: 'Firebase Auth가 초기화되지 않았습니다.' };
    }

    setLoading(true);
    try {
      const firebaseEmail = convertToFirebaseEmail(userData.username);

      if (!userData.username.includes('@')) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(userData.username)) {
          throw new Error('아이디는 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.');
        }
      }

      if (!userData.password || userData.password.length < 6) {
        throw new Error('비밀번호는 6자리 이상이어야 합니다.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, firebaseEmail, userData.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: userData.nickname });

      const newMockUser: Omit<User, 'rank' | 'tetrisRank' | 'categoryStats' | 'score' | 'postScore' | 'selectedTitleIdentifier' | 'selectedNicknameEffectIdentifier' | 'selectedLogoIdentifier'> = {
        id: firebaseUser.uid,
        username: userData.username,
        password: userData.password,
        nickname: userData.nickname,
        email: firebaseUser.email!,
        avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${userData.nickname.substring(0,1).toUpperCase()}`,
        nicknameLastChanged: new Date(),
        isBlocked: false,
        socialProfiles: {},
        twoFactorEnabled: false,
      };

      const existingInitial = initialMockUsersData.find(u => u.id === newMockUser.id || u.email === newMockUser.email);
      if (!existingInitial) {
          initialMockUsersData.push(newMockUser);
      }
      const updatedMockUsersWithNewUser = assignCalculatedScoresAndRanks(initialMockUsersData);
      const finalNewUserFromMocks = updatedMockUsersWithNewUser.find(u => u.id === firebaseUser.uid);

      setLoading(false);
      return { success: true, message: "회원가입 성공! 자동으로 로그인됩니다.", user: finalNewUserFromMocks };

    } catch (error: any) {
      console.error("🚨 Firebase 회원가입 오류:", error);
      let message = "회원가입 중 오류가 발생했습니다.";

      if (error.code === 'auth/email-already-in-use') {
        message = "이미 사용 중인 아이디입니다.";
      } else if (error.message.includes('아이디는')) {
        message = error.message;
      }

      setLoading(false);
      return { success: false, message };
    }
  };

  const logout = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error("로그아웃 오류:", error);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('currentUser');
    }
  };

  const updateUser = (updatedUserPartial: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const updatedUserObject: User = {
        ...prevUser,
        ...updatedUserPartial,
        selectedTitleIdentifier: updatedUserPartial.selectedTitleIdentifier || prevUser.selectedTitleIdentifier || 'none',
        selectedNicknameEffectIdentifier: updatedUserPartial.selectedNicknameEffectIdentifier || prevUser.selectedNicknameEffectIdentifier || 'none',
        selectedLogoIdentifier: updatedUserPartial.selectedLogoIdentifier || prevUser.selectedLogoIdentifier || 'none',
        socialProfiles: updatedUserPartial.socialProfiles || prevUser.socialProfiles || {},
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUserObject));
      return updatedUserObject;
    });
  };

  const contextValue: AuthContextType = {
    user,
    isAdmin,
    logout,
    login,
    signup,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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

// 검색 결과 [1], [5]에서 확인된 패턴: 명시적 export
export default AuthProvider;
export { AuthProvider }; // Named export도 제공
