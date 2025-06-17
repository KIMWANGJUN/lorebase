
"use client";
import type { User, NewUserDto as SignupUserDto } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  updatePassword,
  updateEmail as firebaseUpdateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUserType 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  signup: (userData: SignupUserDto) => Promise<{ success: boolean, message?: string, user?: User }>;
  updateUser: (updatedUserPartial: Partial<User>) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  loading: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAdmin: false,
  logout: async () => {},
  login: async () => ({ success: false, message: "Auth context not ready." }),
  signup: async () => ({ success: false, message: "Auth context not ready." }),
  updateUser: async () => {},
  updateUserPassword: async () => {},
  updateUserEmail: async () => {},
  loading: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Firestore에서 사용자 데이터 로드
  const loadUserFromFirestore = async (uid: string): Promise<User | null> => {
    if (!db) {
      console.warn('⚠️ Firestore 인스턴스가 없어서 mockData를 사용합니다.');
      return null;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📊 Firestore에서 사용자 데이터 로드:', userData.nickname);
        return { ...userData, id: uid } as User;
      }
    } catch (error) {
      console.error('❌ Firestore 사용자 데이터 로드 실패:', error);
    }
    
    return null;
  };

  // Firestore에 사용자 데이터 저장
  const saveUserToFirestore = async (userData: User): Promise<void> => {
    if (!db || !userData.id) {
      console.warn('⚠️ Firestore 인스턴스가 없거나 사용자 ID가 없어서 저장을 건너뜁니다.');
      return;
    }
    
    try {
      const userDocData = {
        ...userData,
        updatedAt: serverTimestamp(),
        emailChangesToday: userData.emailChangesToday || 0,
        lastEmailChangeDate: userData.lastEmailChangeDate || null,
        passwordChangesToday: userData.passwordChangesToday || 0,
        lastPasswordChangeDate: userData.lastPasswordChangeDate || null,
      };
      
      await setDoc(doc(db, 'users', userData.id), userDocData, { merge: true });
      console.log('💾 Firestore에 사용자 데이터 저장:', userData.nickname);
    } catch (error) {
      console.error('❌ Firestore 사용자 데이터 저장 실패:', error);
    }
  };

  useEffect(() => {
    if (!auth) {
      console.warn("⏳ AuthContext: Firebase Auth service instance from firebase.ts is not available yet. Waiting for it to initialize.");
      const timer = setTimeout(() => {
        if (!auth) {
            console.error("🚨 AuthContext: Firebase Auth service instance remained unavailable after timeout.");
            setLoading(false);
            setUser(null);
            setIsAdmin(false);
        }
      }, 5000); 
      return () => clearTimeout(timer);
    }

    console.log("🚀 AuthContext: Firebase Auth service available. Setting up onAuthStateChanged listener.");
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      console.log('🔥 AuthContext: Firebase Auth state changed:', firebaseUser ? firebaseUser.uid : 'null');
      
      if (firebaseUser) {
        // 먼저 Firestore에서 사용자 데이터 로드 시도
        let appUser = await loadUserFromFirestore(firebaseUser.uid);
        
        if (appUser) {
          const updatedAppUser: User = {
            ...appUser,
            id: firebaseUser.uid, 
            email: firebaseUser.email || appUser.email,
            nickname: firebaseUser.displayName || appUser.nickname,
            avatar: firebaseUser.photoURL || appUser.avatar,
            emailChangesToday: appUser.emailChangesToday || 0,
            lastEmailChangeDate: appUser.lastEmailChangeDate || null,
            passwordChangesToday: appUser.passwordChangesToday || 0,
            lastPasswordChangeDate: appUser.lastPasswordChangeDate || null,
          };
          setUser(updatedAppUser);
          setIsAdmin(updatedAppUser.isAdmin || false);
          localStorage.setItem('currentUser', JSON.stringify(updatedAppUser));
          
          // Firestore에 동기화
          await saveUserToFirestore(updatedAppUser);
          console.log('👤 AuthContext: Existing user data updated:', updatedAppUser.nickname);
        } else {
          // 새 사용자 생성
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
            emailChangesToday: 0,
            lastEmailChangeDate: null,
            passwordChangesToday: 0,
            lastPasswordChangeDate: null,
            isAdmin: false,
          };
          
          setUser(newAppUser);
          setIsAdmin(newAppUser.isAdmin || false);
          localStorage.setItem('currentUser', JSON.stringify(newAppUser));
          
          // Firestore에 새 사용자 저장
          await saveUserToFirestore(newAppUser);
          
          console.log('✨ AuthContext: New user created and data stored:', newAppUser.nickname);
        }
      } else {
        console.log("🚪 AuthContext: Firebase user logged out.");
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUser');
      }
      setLoading(false); 
    }, (error: any) => {
        console.error("🚨 AuthContext: onAuthStateChanged error:", error);
        setLoading(false);
        setUser(null);
        setIsAdmin(false);
      });

    return () => {
      console.log('🧹 AuthContext: Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, []); 

  const login = async (email: string, password: string): Promise<{ success: boolean, message?: string }> => {
    if (!auth) {
      console.error('🚨 로그인 시도: Firebase Auth 미초기화');
      return { success: false, message: 'Firebase Auth가 초기화되지 않았습니다.' };
    }
    setLoading(true);
    console.log('🔥 로그인 시도: Email:', email);

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
    
    if (!auth.app?.options?.apiKey) {
        console.error("🚨 치명적 오류: Auth 객체에 API 키가 설정되지 않았습니다. Firebase 초기화를 확인하세요.");
        setLoading(false);
        return { success: false, message: 'Firebase 설정 오류로 회원가입할 수 없습니다. 관리자에게 문의하세요.' };
    }

    try {
      if (!firebaseEmail || !/\S+@\S+\.\S+/.test(firebaseEmail)) {
        throw new Error('유효한 이메일 주소를 입력해주세요.');
      }
      if (!userData.password || userData.password.length < 6) { 
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
      
      const preliminaryNewUser: User = {
        id: firebaseUser.uid,
        username: firebaseEmail,
        nickname: userData.nickname,
        email: firebaseEmail,
        avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${userData.nickname.substring(0,1).toUpperCase()}`,
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
        emailChangesToday: 0,
        lastEmailChangeDate: null,
        passwordChangesToday: 0,
        lastPasswordChangeDate: null,
      };

      // Firestore에 저장
      await saveUserToFirestore(preliminaryNewUser);

      setLoading(false);
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
    } catch (error) {
      console.error("🚨 로그아웃 오류:", error);
    } finally {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('currentUser');
    }
  };

  const updateUser = async (updatedUserPartial: Partial<User>) => {
    if (!user) {
      console.warn('⚠️ 사용자가 로그인되어 있지 않습니다.');
      return;
    }

    const updatedUserObject: User = {
      ...user,
      ...updatedUserPartial,
      selectedTitleIdentifier: updatedUserPartial.selectedTitleIdentifier || user.selectedTitleIdentifier || 'none',
      selectedNicknameEffectIdentifier: updatedUserPartial.selectedNicknameEffectIdentifier || user.selectedNicknameEffectIdentifier || 'none',
      selectedLogoIdentifier: updatedUserPartial.selectedLogoIdentifier || user.selectedLogoIdentifier || 'none',
      socialProfiles: updatedUserPartial.socialProfiles || user.socialProfiles || {},
    };

    // 로컬 상태 업데이트
    setUser(updatedUserObject);
    localStorage.setItem('currentUser', JSON.stringify(updatedUserObject));
    
    // Firestore에 업데이트
    if (db && user.id) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          ...updatedUserPartial,
          updatedAt: serverTimestamp()
        });
        console.log('💾 Firestore에 사용자 정보 업데이트:', updatedUserObject.nickname);
      } catch (error) {
        console.error('❌ Firestore 사용자 정보 업데이트 실패:', error);
      }
    }

    console.log('👤 AuthContext: 사용자 정보 업데이트 완료:', updatedUserObject.nickname);
  };

  // 비밀번호 변경
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!auth?.currentUser || !user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }

    try {
      // 현재 비밀번호로 재인증
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 비밀번호 업데이트
      await updatePassword(auth.currentUser, newPassword);

      // 변경 횟수 업데이트
      const today = new Date().toDateString();
      const isNewDay = user.lastPasswordChangeDate !== today;
      
      await updateUser({
        passwordChangesToday: isNewDay ? 1 : (user.passwordChangesToday || 0) + 1,
        lastPasswordChangeDate: today
      });

      console.log('✅ 비밀번호 변경 성공');
    } catch (error: any) {
      console.error('❌ 비밀번호 변경 실패:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('새 비밀번호가 너무 약합니다.');
      }
      throw error;
    }
  };

  // 이메일 변경
  const updateUserEmail = async (newEmail: string, currentPassword: string) => {
    if (!auth?.currentUser || !user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }

    try {
      // 이메일 중복 확인 (Firestore에서)
      if (db) {
        const emailQuery = query(
          collection(db, 'users'),
          where('email', '==', newEmail.toLowerCase())
        );
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty && emailSnapshot.docs[0].id !== user.id) {
          throw new Error('이미 사용 중인 이메일입니다.');
        }
      }

      // 현재 비밀번호로 재인증
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Firebase Auth 이메일 업데이트
      await firebaseUpdateEmail(auth.currentUser, newEmail);

      // 변경 횟수 업데이트
      const today = new Date().toDateString();
      const isNewDay = user.lastEmailChangeDate !== today;
      
      await updateUser({
        email: newEmail.toLowerCase(),
        emailChangesToday: isNewDay ? 1 : (user.emailChangesToday || 0) + 1,
        lastEmailChangeDate: today
      });

      console.log('✅ 이메일 변경 성공');
    } catch (error: any) {
      console.error('❌ 이메일 변경 실패:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('이미 사용 중인 이메일입니다.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('유효하지 않은 이메일 형식입니다.');
      }
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAdmin,
    logout,
    login,
    signup,
    updateUser,
    updateUserPassword,
    updateUserEmail,
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
