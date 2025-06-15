// src/contexts/AuthContext.tsx
"use client";
import type { User, NewUserDto as SignupUserDto } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers as fallBackMockUsers, mockUsersData as initialMockUsersData, assignCalculatedScoresAndRanks } from '@/lib/mockData';
import { auth } from '@/lib/firebase'; // Firebase auth instance from firebase.js
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

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseAuthReady, setFirebaseAuthReady] = useState(false);

  useEffect(() => {
    console.log('🔥 AuthProvider useEffect 시작. Firebase auth 객체:', auth);
    
    if (!auth) {
      console.warn('🚨 Firebase Auth 인스턴스가 AuthProvider에 아직 로드되지 않았습니다. 로딩 지연 가능성.');
      // Firebase.js에서 auth 초기화가 비동기적으로 완료될 수 있으므로,
      // auth가 null일 경우 즉시 로딩을 해제하기보다는,
      // firebaseAuthReady 상태를 사용하여 auth가 실제로 사용 가능해질 때까지 기다릴 수 있습니다.
      // 그러나 auth가 계속 null이면 Firebase 초기화 자체에 문제가 있는 것입니다.
      const checkAuthInterval = setInterval(() => {
        if (auth) {
          setFirebaseAuthReady(true);
          clearInterval(checkAuthInterval);
          console.log('✅ Firebase Auth 인스턴스 확인됨 (지연 후).');
        }
      }, 100);
      // 5초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkAuthInterval);
        if (!auth) {
            console.error("🚨 Firebase Auth 인스턴스 초기화 시간 초과. 기능이 제대로 동작하지 않을 수 있습니다.");
            setLoading(false); // auth가 계속 없으면 로딩 해제
        }
      }, 5000);
      return () => clearInterval(checkAuthInterval);
    } else {
        setFirebaseAuthReady(true); // auth가 이미 있으면 바로 준비 상태로 설정
        console.log('✅ Firebase Auth 인스턴스 즉시 사용 가능.');
    }
  }, []); // auth 객체 자체는 변경되지 않으므로 의존성 배열에서 제거, 초기 로드 시 한 번만 확인


  useEffect(() => {
    if (!firebaseAuthReady) {
        console.log("⏳ Firebase Auth 준비 대기 중...");
        return;
    }
    console.log("🚀 onAuthStateChanged 리스너 설정 시도 (auth 객체 사용)");

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser: FirebaseUserType | null) => {
      console.log('🔥 Firebase Auth 상태 변경:', firebaseUser ? firebaseUser.uid : 'null');
      setLoading(true);
      
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
          console.log('👤 기존 사용자 정보 업데이트:', updatedAppUser.nickname);
        } else {
          const newAppUser: User = {
            id: firebaseUser.uid,
            username: firebaseUser.email!, // Firebase user email is primary identifier
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
            });
          }
          
          const updatedMockUsersList = assignCalculatedScoresAndRanks(initialMockUsersData);
          const finalNewAppUser = updatedMockUsersList.find(u => u.id === newAppUser.id) || newAppUser;

          setUser(finalNewAppUser);
          setIsAdmin(finalNewAppUser.username === 'wangjunland');
          localStorage.setItem('currentUser', JSON.stringify(finalNewAppUser));
          console.log('✨ 새 사용자 생성 및 정보 저장:', finalNewAppUser.nickname);
        }
      } else {
        console.log("🚪 Firebase 사용자 로그아웃");
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    }, (error) => {
        console.error("🚨 onAuthStateChanged 오류:", error);
        setLoading(false);
    });

    return () => {
      console.log('🧹 AuthProvider cleanup: onAuthStateChanged 구독 해제');
      unsubscribe();
    };
  }, [firebaseAuthReady]); // firebaseAuthReady 상태가 변경될 때 이 effect를 재실행

  const login = async (email: string, password: string): Promise<{ success: boolean, message?: string }> => {
    if (!auth) {
      console.error('🚨 로그인 시도: Firebase Auth 미초기화');
      return { success: false, message: 'Firebase Auth가 초기화되지 않았습니다.' };
    }
    setLoading(true);
    console.log('🔥 로그인 시도:', email);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged가 사용자 상태를 업데이트하므로 여기서는 별도 setUser 불필요
      setLoading(false);
      return { success: true, message: "로그인 성공!" };
    } catch (error: any) {
      console.error("❌ 로그인 오류:", error.code, error.message);
      let message = "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "아이디 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.code === 'auth/invalid-email') {
        message = "유효하지 않은 이메일 형식입니다.";
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

    // userData.username은 이제 이메일 형식이어야 함
    const firebaseEmail = userData.username; 
    console.log('🔥 Firebase 회원가입 시도: Email:', firebaseEmail, 'Auth API Key:', auth.app?.options?.apiKey ? '키 있음' : '❌ 키 없음 또는 auth 객체 문제');

    if (!auth.app?.options?.apiKey) {
        console.error("🚨 치명적 오류: Auth 객체에 API 키가 설정되지 않았습니다. Firebase 초기화를 확인하세요.");
        setLoading(false);
        return { success: false, message: 'Firebase 설정 오류로 회원가입할 수 없습니다. 관리자에게 문의하세요.' };
    }

    try {
      // 유효성 검사
      if (!firebaseEmail || !/\S+@\S+\.\S+/.test(firebaseEmail)) {
        throw new Error('유효한 이메일 주소를 입력해주세요.');
      }
      if (!userData.password || userData.password.length < 6) {
        throw new Error('비밀번호는 6자리 이상이어야 합니다.');
      }
      if (!userData.nickname || userData.nickname.length < 2) {
        throw new Error('닉네임은 2자 이상이어야 합니다.');
      }
  
      // Firebase 회원가입 시도
      const userCredential = await createUserWithEmailAndPassword(auth, firebaseEmail, userData.password);
      const firebaseUser = userCredential.user;
  
      console.log('✅ Firebase 회원가입 성공:', firebaseUser.uid);
      await updateProfile(firebaseUser, { displayName: userData.nickname });
      console.log('✅ Firebase 프로필 업데이트 성공 (닉네임)');

      // mockUsersData에 새 사용자 정보 추가 (id는 Firebase UID 사용)
      const newMockEntry: Omit<User, 'rank' | 'tetrisRank' | 'categoryStats' | 'score' | 'postScore' | 'selectedTitleIdentifier' | 'selectedNicknameEffectIdentifier' | 'selectedLogoIdentifier'> = {
        id: firebaseUser.uid,
        username: firebaseEmail, // 이메일을 username으로 사용
        password: userData.password, // 개발 목적으로 저장, 실제 운영시는 제외
        nickname: userData.nickname,
        email: firebaseEmail,
        avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${userData.nickname.substring(0,1).toUpperCase()}`,
        nicknameLastChanged: new Date(),
        isBlocked: false,
        socialProfiles: {},
        twoFactorEnabled: false,
      };
      
      const existingInitial = initialMockUsersData.find(u => u.id === newMockEntry.id || u.email === newMockEntry.email);
      if (!existingInitial) {
        initialMockUsersData.push(newMockEntry);
      }

      // 전체 사용자 목록을 다시 계산하여 순위 및 점수 업데이트
      const updatedMockUsersWithNewUser = assignCalculatedScoresAndRanks(initialMockUsersData);
      const finalNewUserFromMocks = updatedMockUsersWithNewUser.find(u => u.id === firebaseUser.uid);

      // onAuthStateChanged가 호출되어 setUser 등을 처리하므로 여기서는 직접 setUser 호출 불필요
      setLoading(false);
      return { success: true, message: "회원가입 성공! 자동으로 로그인됩니다.", user: finalNewUserFromMocks };

    } catch (error: any) {
      console.error("🚨 Firebase 회원가입 오류:", error.code, error.message);
      let message = "회원가입 중 오류가 발생했습니다.";
      if (error.code === 'auth/email-already-in-use') {
        message = "이미 사용 중인 이메일입니다.";
      } else if (error.code === 'auth/invalid-email') {
        message = "유효하지 않은 이메일 형식입니다.";
      } else if (error.code === 'auth/weak-password') {
        message = "비밀번호는 6자 이상이어야 합니다.";
      } else if (error.message.includes('유효한 이메일') || error.message.includes('비밀번호는') || error.message.includes('닉네임은')) {
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
      // onAuthStateChanged가 사용자 상태를 null로 설정
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error("🚨 로그아웃 오류:", error);
      // 에러 발생 시 수동으로 로컬 상태 초기화 (안전장치)
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
      console.log('👤 사용자 정보 로컬 업데이트:', updatedUserObject.nickname);
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
  if (context === defaultAuthContext && !defaultAuthContext.user && defaultAuthContext.loading) {
     // This might indicate that AuthProvider hasn't fully initialized or is still in its default state.
     // Depending on the app's structure, this might be normal during initial load or SSR.
     // console.warn("AuthContext is being used with its default value, possibly during initial load.");
  }
  if (!context) {
    // This error means useAuth is called outside of AuthProvider, which is a structural issue.
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
export { AuthProvider };
