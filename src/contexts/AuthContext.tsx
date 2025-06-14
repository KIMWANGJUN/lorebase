
// src/contexts/AuthContext.tsx
"use client";
import type { User, NewUserDto as SignupUserDto, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers as fallBackMockUsers, addUserToMockList, mockUsersData as initialMockUsersData, assignCalculatedScoresAndRanks } from '@/lib/mockData';
import { auth } from '@/lib/firebase'; // Firebase auth instance
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, type User as FirebaseUserType } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  logout: () => Promise<void>; // Made async for signOut
  signup: (userData: SignupUserDto) => Promise<{ success: boolean, message?: string, user?: User }>; // Adjusted return type
  updateUser: (updatedUserPartial: Partial<User>) => void;
  loading: boolean; // Indicates if Firebase auth state is still being determined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start as true until auth state is known

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      setLoading(true);
      if (firebaseUser) {
        console.log("Firebase Auth State Changed - User Logged In:", firebaseUser);
        // User is signed in
        let appUser = fallBackMockUsers.find(u => u.email === firebaseUser.email || u.id === firebaseUser.uid);

        if (appUser) {
          // Update existing mock user with Firebase data if needed
          const updatedAppUser: User = {
            ...appUser,
            id: firebaseUser.uid, // Ensure appUser id matches Firebase UID
            email: firebaseUser.email || appUser.email,
            nickname: firebaseUser.displayName || appUser.nickname,
            avatar: firebaseUser.photoURL || appUser.avatar,
            // Preserve other mockData specific fields like score, rank, etc.
          };
          setUser(updatedAppUser);
          setIsAdmin(updatedAppUser.username === 'wangjunland');
          localStorage.setItem('currentUser', JSON.stringify(updatedAppUser));
        } else {
          // New user (e.g. via social login, or first time login for an existing Firebase user not in mocks)
          const newAppUser: User = {
            id: firebaseUser.uid,
            username: firebaseUser.email || `user_${firebaseUser.uid.substring(0,6)}`, // Use email as username or generate
            nickname: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '새 사용자',
            email: firebaseUser.email || undefined,
            avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${(firebaseUser.displayName || firebaseUser.email || 'N').substring(0,1).toUpperCase()}`,
            score: 0,
            rank: 0,
            tetrisRank: 0,
            categoryStats: { Unity: { score: 0 }, Unreal: { score: 0 }, Godot: { score: 0 }, General: { score: 0 } },
            nicknameLastChanged: new Date(),
            isBlocked: false,
            socialProfiles: {}, // Can be populated based on providerData
            selectedTitleIdentifier: 'none',
            selectedNicknameEffectIdentifier: 'none',
            selectedLogoIdentifier: 'none',
            twoFactorEnabled: false, // Default for new user
          };

          // Add to our mock data system
          const existingInitial = initialMockUsersData.find(u => u.id === newAppUser.id || u.email === newAppUser.email);
          if (!existingInitial) {
            initialMockUsersData.push({
              id: newAppUser.id,
              username: newAppUser.username,
              nickname: newAppUser.nickname,
              email: newAppUser.email,
              avatar: newAppUser.avatar,
              // No password for social logins initially in mockData
              socialProfiles: newAppUser.socialProfiles,
              twoFactorEnabled: undefined
            });
          }
          // Recalculate all ranks and scores with the new user, then find the new user from the updated list
          const updatedMockUsersList = assignCalculatedScoresAndRanks(initialMockUsersData);
          const finalNewAppUser = updatedMockUsersList.find(u => u.id === newAppUser.id) || newAppUser;

          setUser(finalNewAppUser);
          setIsAdmin(finalNewAppUser.username === 'wangjunland');
          localStorage.setItem('currentUser', JSON.stringify(finalNewAppUser));
        }
      } else {
        // User is signed out
        console.log("Firebase Auth State Changed - User Logged Out");
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);


  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing user state and localStorage
    } catch (error) {
      console.error("Error signing out from Firebase: ", error);
      // Even if Firebase signout fails, clear local state as a fallback
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('currentUser');
    }
  };

  const signup = async (userData: SignupUserDto): Promise<{ success: boolean, message?: string, user?: User }> => {
    setLoading(true);
    try {
      // Firebase 설정 사전 확인
      if (!auth.app.options.apiKey) {
        throw new Error('Firebase API 키가 설정되지 않았습니다.');
      }

      if (!auth.app.options.projectId) {
        throw new Error('Firebase 프로젝트 ID가 설정되지 않았습니다.');
      }

      console.log('🔥 Firebase 회원가입 시도:', {
        email: userData.username, // userData.username is the email from signup form
        firebaseProject: auth.app.options.projectId,
        apiKeyFromAuthInstance: auth.app.options.apiKey ? `${auth.app.options.apiKey.substring(0,5)}...` : '❌ 없음 (AuthContext)',
        timestamp: new Date().toISOString()
      });

      // 이메일 형식 검증 (userData.username should be the email)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.username)) {
        throw new Error('유효한 이메일 형식을 입력해주세요.');
      }

      // 비밀번호 검증
      if (!userData.password || userData.password.length < 6) {
        throw new Error('비밀번호는 6자리 이상이어야 합니다.');
      }

      // Firebase 회원가입 시도
      const userCredential = await createUserWithEmailAndPassword(auth, userData.username, userData.password);
      const firebaseUser = userCredential.user;

      console.log('✅ Firebase 회원가입 성공:', firebaseUser.uid);

      // Update Firebase profile display name
      await updateProfile(firebaseUser, { displayName: userData.nickname });

      // Add user to our mock data system
      const newMockUser: Omit<User, 'rank' | 'tetrisRank' | 'categoryStats' | 'score' | 'postScore' | 'selectedTitleIdentifier' | 'selectedNicknameEffectIdentifier' | 'selectedLogoIdentifier'> = {
        id: firebaseUser.uid,
        username: firebaseUser.email!, // Username is email for Firebase
        password: userData.password, // Store password for mock system consistency if needed
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

      // onAuthStateChanged should pick this new user up, but we can return success here
      setLoading(false);
      return { success: true, message: "회원가입 성공! 자동으로 로그인됩니다.", user: finalNewUserFromMocks };

    } catch (error: any) {
      console.error("🚨 Firebase 회원가입 오류:", error);
      let message = "회원가입 중 오류가 발생했습니다.";

      if (error.code === 'auth/api-key-not-valid') {
        message = "Firebase API 키가 유효하지 않습니다. 관리자에게 문의하세요.";
        console.error("🔑 API 키 오류 - 확인 사항:");
        console.error("1. .env.local 파일이 프로젝트 루트에 있는지, 변수 이름과 값이 정확한지 확인");
        console.error("2. API 키에 불필요한 문자(따옴표 등)가 없는지 확인");
        console.error("3. 개발 서버를 완전히 재시작했는지 확인 (`Ctrl+C` 후 `npm run dev`)");
        console.error("4. Firebase 콘솔에서 API 키 제한(HTTP 리퍼러, API 서비스) 확인");
        console.error("5. Firebase 콘솔에서 'Authentication > Sign-in method'에 '이메일/비밀번호' 방식이 활성화되어 있는지 확인");
      } else if (error.code === 'auth/email-already-in-use') {
        message = "이미 사용 중인 이메일 (아이디)입니다.";
      } else if (error.code === 'auth/invalid-email') {
        message = "유효하지 않은 이메일 (아이디) 형식입니다.";
      } else if (error.code === 'auth/weak-password') {
        message = "비밀번호는 6자 이상이어야 합니다.";
      } else if (error.code === 'auth/network-request-failed') {
        message = "네트워크 연결을 확인해주세요.";
      } else if (error.message.includes('API 키') || error.message.includes('프로젝트 ID')) {
        message = error.message;
      } else {
        message = error.message || "회원가입에 실패했습니다.";
      }

      setLoading(false);
      return { success: false, message };
    }
  };

  const updateUser = (updatedUserPartial: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      let finalUpdatedFields = { ...updatedUserPartial };
      if (updatedUserPartial.nickname && updatedUserPartial.nickname.trim() !== prevUser.nickname) {
        finalUpdatedFields.nicknameLastChanged = new Date();
      }

      const updatedUserObject: User = {
        ...prevUser,
        ...finalUpdatedFields,
        selectedTitleIdentifier: finalUpdatedFields.selectedTitleIdentifier || prevUser.selectedTitleIdentifier || 'none',
        selectedNicknameEffectIdentifier: finalUpdatedFields.selectedNicknameEffectIdentifier || prevUser.selectedNicknameEffectIdentifier || 'none',
        selectedLogoIdentifier: finalUpdatedFields.selectedLogoIdentifier || prevUser.selectedLogoIdentifier || 'none',
        socialProfiles: finalUpdatedFields.socialProfiles || prevUser.socialProfiles || {},
      };

      if (typeof updatedUserObject.nicknameLastChanged === 'string') {
        updatedUserObject.nicknameLastChanged = new Date(updatedUserObject.nicknameLastChanged);
      }

      localStorage.setItem('currentUser', JSON.stringify(updatedUserObject));

      // Update the user in the main mockUsers array (used by the rest of the app)
      const userIndexInGlobalMocks = fallBackMockUsers.findIndex(u => u.id === prevUser.id);
      if (userIndexInGlobalMocks !== -1) {
        fallBackMockUsers[userIndexInGlobalMocks] = { ...fallBackMockUsers[userIndexInGlobalMocks], ...updatedUserObject };
      }

      // Also update the initialMockUsersData if the user exists there to keep source consistent
      const initialUserIndex = initialMockUsersData.findIndex(u => u.id === prevUser.id);
      if(initialUserIndex !== -1) {
        initialMockUsersData[initialUserIndex] = {
          ...initialMockUsersData[initialUserIndex],
           ...updatedUserObject, // Spreading full object might be safer here for consistency
        };
      }

      // If current Firebase user and nickname/avatar changed, update Firebase profile
      if (auth.currentUser && auth.currentUser.uid === updatedUserObject.id) {
        const profileUpdates: { displayName?: string; photoURL?: string } = {};
        if (finalUpdatedFields.nickname && finalUpdatedFields.nickname !== auth.currentUser.displayName) {
          profileUpdates.displayName = finalUpdatedFields.nickname;
        }
        if (finalUpdatedFields.avatar && finalUpdatedFields.avatar !== auth.currentUser.photoURL) {
          profileUpdates.photoURL = finalUpdatedFields.avatar;
        }
        if (Object.keys(profileUpdates).length > 0) {
          updateProfile(auth.currentUser, profileUpdates).catch(err => console.error("Error updating Firebase profile:", err));
        }
      }

      return updatedUserObject;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, logout, signup, updateUser, loading }}>
      {children}
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
