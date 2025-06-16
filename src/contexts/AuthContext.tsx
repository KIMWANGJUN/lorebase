
// src/contexts/AuthContext.tsx
"use client";
import type { User, NewUserDto as SignupUserDto } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers as fallBackMockUsers, mockUsersData as initialMockUsersData, assignCalculatedScoresAndRanks } from '@/lib/mockData';
import { auth } from '@/lib/firebase'; // Firebase auth instance
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User as FirebaseUserType } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  signup: (userData: SignupUserDto) => Promise<{ success: boolean, message?: string, user?: User }>;
  updateUser: (updatedUserPartial: Partial<User>) => void;
  loading: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAdmin: false,
  logout: async () => {},
  login: async () => ({ success: false, message: "Auth context not ready." }),
  signup: async () => ({ success: false, message: "Auth context not ready." }),
  updateUser: () => {},
  loading: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) {
      console.warn("⏳ AuthContext: Firebase Auth service instance from firebase.ts is not available yet. Waiting for it to initialize.");
      // setLoading(true); // Keep loading true if auth might become available
      // If auth is guaranteed to be null permanently (e.g. server-side where it's not init),
      // then setLoading(false) and setting user to null might be appropriate.
      // For client-side, we expect `auth` to become available.
      // If after a timeout `auth` is still null, then we might stop loading.
      const timer = setTimeout(() => {
        if (!auth) {
            console.error("🚨 AuthContext: Firebase Auth service instance remained unavailable after timeout.");
            setLoading(false);
            setUser(null);
            setIsAdmin(false);
        }
      }, 5000); // Wait 5 seconds for auth to potentially become available
      return () => clearTimeout(timer);
    }

    console.log("🚀 AuthContext: Firebase Auth service available. Setting up onAuthStateChanged listener.");
    setLoading(true); // Explicitly set loading to true before listener setup

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      console.log('🔥 AuthContext: Firebase Auth state changed:', firebaseUser ? firebaseUser.uid : 'null');
      
      if (firebaseUser) {
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
          console.log('👤 AuthContext: Existing user data updated:', updatedAppUser.nickname);
        } else {
          const newAppUser: User = {
            id: firebaseUser.uid,
            username: firebaseUser.email!, 
            nickname: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '새 사용자',
            email: firebaseUser.email!,
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
              password: 'passwordPlaceholder', // Placeholder, actual password not stored here
              nicknameLastChanged: newAppUser.nicknameLastChanged,
              isBlocked: newAppUser.isBlocked,
              twoFactorEnabled: newAppUser.twoFactorEnabled,
            });
          }
          
          const updatedMockUsersList = assignCalculatedScoresAndRanks(initialMockUsersData);
          const finalNewUserFromMocks = updatedMockUsersList.find(u => u.id === newAppUser.id) || newAppUser;

          setUser(finalNewUserFromMocks);
          setIsAdmin(finalNewUserFromMocks.username === 'wangjunland');
          localStorage.setItem('currentUser', JSON.stringify(finalNewUserFromMocks));
          console.log('✨ AuthContext: New user created and data stored:', finalNewUserFromMocks.nickname);
        }
      } else {
        console.log("🚪 AuthContext: Firebase user logged out.");
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUser');
      }
      setLoading(false); // Auth state determined (or user is null)
    }, (error) => {
        console.error("🚨 AuthContext: onAuthStateChanged error:", error);
        setLoading(false);
        setUser(null);
        setIsAdmin(false);
    });

    return () => {
      console.log('🧹 AuthContext: Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, [auth]); // Depend on the auth object from firebase.ts

  const login = async (email: string, password: string): Promise<{ success: boolean, message?: string }> => {
    if (!auth) {
      console.error('🚨 로그인 시도: Firebase Auth 미초기화');
      return { success: false, message: 'Firebase Auth가 초기화되지 않았습니다.' };
    }
    setLoading(true);
    console.log('🔥 로그인 시도: Email:', email);
    console.log('🔑 로그인 시 사용되는 Auth API Key:', auth?.app?.options?.apiKey ? auth.app.options.apiKey.substring(0,15)+'...' : '❌ 키 없음 또는 auth 객체 문제');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting user state
      setLoading(false);
      return { success: true, message: "로그인 성공!" };
    } catch (error: any) {
      console.error("❌ 로그인 오류:", error.code, error.message);
      let message = "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "아이디 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.code === 'auth/invalid-email') {
        message = "유효하지 않은 이메일 형식입니다.";
      } else if (error.code === 'auth/api-key-not-valid') {
        message = "Firebase API 키가 유효하지 않습니다. 관리자에게 문의하거나 Firebase 설정을 확인해주세요.";
      }
      setLoading(false);
      return { success: false, message };
    }
  };

  const signup = async (userData: SignupUserDto): Promise<{ success: boolean, message?: string, user?: User }> => {
    if (!auth) {
      console.error('🚨 회원가입 시도: Firebase Auth 미초기화');
      return { success: false, message: 'Firebase Auth가 초기화되지 않았습니다.' };
    }
    setLoading(true);

    const firebaseEmail = userData.email; 
    console.log('🔥 Firebase 회원가입 시도: Email:', firebaseEmail);
    console.log('🔑 회원가입 시 사용되는 Auth API Key:', auth?.app?.options?.apiKey ? auth.app.options.apiKey.substring(0,15)+'...' : '❌ 키 없음 또는 auth 객체 문제');
    
    if (!auth.app?.options?.apiKey) {
        console.error("🚨 치명적 오류: Auth 객체에 API 키가 설정되지 않았습니다. Firebase 초기화를 확인하세요.");
        setLoading(false);
        return { success: false, message: 'Firebase 설정 오류로 회원가입할 수 없습니다. 관리자에게 문의하세요.' };
    }

    try {
      if (!firebaseEmail || !/\S+@\S+\.\S+/.test(firebaseEmail)) {
        throw new Error('유효한 이메일 주소를 입력해주세요.');
      }
      if (!userData.password || userData.password.length < 6) { // Firebase default is 6
        throw new Error('비밀번호는 6자리 이상이어야 합니다.');
      }
      if (!userData.nickname || userData.nickname.length < 2) {
        throw new Error('닉네임은 2자 이상이어야 합니다.');
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, firebaseEmail, userData.password);
      const firebaseUser = userCredential.user;
  
      console.log('✅ Firebase 회원가입 성공:', firebaseUser.uid);
      await updateProfile(firebaseUser, { displayName: userData.nickname });
      console.log('✅ Firebase 프로필 업데이트 성공 (닉네임)');

      // onAuthStateChanged will handle setting the user state correctly,
      // including creating the mock user if not found.
      // The user object returned here might be slightly delayed if onAuthStateChanged hasn't fired yet.
      // For immediate feedback, we can construct a preliminary user object.
      
      const preliminaryNewUser: User = {
        id: firebaseUser.uid,
        username: firebaseEmail,
        nickname: userData.nickname,
        email: firebaseEmail,
        avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${userData.nickname.substring(0,1).toUpperCase()}`,
        score: 0, rank: 0, tetrisRank: 0,
        categoryStats: { Unity: { score: 0 }, Unreal: { score: 0 }, Godot: { score: 0 }, General: { score: 0 } },
        nicknameLastChanged: new Date(),
        isBlocked: false,
        socialProfiles: {},
        selectedTitleIdentifier: 'none',
        selectedNicknameEffectIdentifier: 'none',
        selectedLogoIdentifier: 'none',
        twoFactorEnabled: false,
      };

      // Add to mockUsersData so onAuthStateChanged can pick it up correctly if it runs next
      const existingInitial = initialMockUsersData.find(u => u.id === preliminaryNewUser.id || u.email === preliminaryNewUser.email);
      if (!existingInitial) {
        initialMockUsersData.push({
          id: preliminaryNewUser.id,
          username: preliminaryNewUser.username,
          nickname: preliminaryNewUser.nickname,
          email: preliminaryNewUser.email,
          avatar: preliminaryNewUser.avatar,
          password: 'passwordPlaceholder',
          nicknameLastChanged: preliminaryNewUser.nicknameLastChanged,
          isBlocked: preliminaryNewUser.isBlocked,
          socialProfiles: preliminaryNewUser.socialProfiles,
          twoFactorEnabled: preliminaryNewUser.twoFactorEnabled,
        });
         // Re-process mockUsers to include new user with calculated ranks/scores
        fallBackMockUsers = assignCalculatedScoresAndRanks(initialMockUsersData);
      }


      setLoading(false);
      // The user state will be set by onAuthStateChanged.
      // The returned user here is for immediate use if needed by the caller,
      // but the context's `user` will be the source of truth after onAuthStateChanged.
      return { success: true, message: "회원가입 성공! 자동으로 로그인됩니다.", user: preliminaryNewUser };
    } catch (error: any) {
      console.error("🚨 Firebase 회원가입 오류:", error.code, error.message);
      let message = "회원가입 중 오류가 발생했습니다.";
      if (error.code === 'auth/email-already-in-use') {
        message = "이미 사용 중인 이메일입니다.";
      } else if (error.code === 'auth/invalid-email') {
        message = "유효하지 않은 이메일 형식입니다.";
      } else if (error.code === 'auth/weak-password') {
        message = "비밀번호는 6자 이상이어야 합니다.";
      } else if (error.code === 'auth/api-key-not-valid') {
        message = "Firebase API 키가 유효하지 않습니다. 관리자에게 문의하거나 Firebase 설정을 확인해주세요.";
      } else if (error.message?.includes('유효한 이메일') || error.message?.includes('비밀번호는') || error.message?.includes('닉네임은')) {
        message = error.message;
      }
      setLoading(false);
      return { success: false, message };
    }
  };

  const logout = async () => {
    if (!auth) {
        console.error('🚨 로그아웃 시도: Firebase Auth 미초기화');
        return;
    }
    console.log('🔥 로그아웃 시도');
    try {
      await signOut(auth);
      console.log('✅ 로그아웃 성공');
      // onAuthStateChanged will set user to null
    } catch (error) {
      console.error("🚨 로그아웃 오류:", error);
    } finally {
      // Explicitly clear local state too, though onAuthStateChanged should handle it.
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
      
      // Update in the mockUsers array as well for consistency across sessions if mockData is persisted/reused
      const userIndex = fallBackMockUsers.findIndex(u => u.id === prevUser.id);
      if (userIndex !== -1) {
        fallBackMockUsers[userIndex] = { ...fallBackMockUsers[userIndex], ...updatedUserObject };
      }
       const mockDataIndex = initialMockUsersData.findIndex(u => u.id === prevUser.id);
       if (mockDataIndex !== -1) {
          initialMockUsersData[mockDataIndex] = {
            ...initialMockUsersData[mockDataIndex],
            nickname: updatedUserObject.nickname,
            avatar: updatedUserObject.avatar,
            email: updatedUserObject.email, // if email can be changed
            nicknameLastChanged: updatedUserObject.nicknameLastChanged,
            socialProfiles: updatedUserObject.socialProfiles,
            twoFactorEnabled: updatedUserObject.twoFactorEnabled,
            // Update other relevant fields from updatedUserPartial
          };
          // Optionally re-run assignCalculatedScoresAndRanks if scores/ranks could change
          // fallBackMockUsers = assignCalculatedScoresAndRanks(initialMockUsersData);
       }


      console.log('👤 AuthContext: 사용자 정보 로컬 업데이트:', updatedUserObject.nickname);
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

export default AuthProvider;
