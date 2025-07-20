
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
  getDocs,
  onSnapshot
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

  const saveUserToFirestore = async (userData: User): Promise<void> => {
      if (!db || !userData.id) return;
      try {
          const userDocData = { ...userData, updatedAt: serverTimestamp(), createdAt: serverTimestamp() };
          await setDoc(doc(db, 'users', userData.id), userDocData, { merge: true });
      } catch (error) {
          console.error('❌ Firestore 사용자 데이터 저장 실패:', error);
      }
  };

  useEffect(() => {
    let unsubscribeFromFirestore: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
        unsubscribeFromFirestore = null;
      }

      if (firebaseUser) {
        setLoading(true);
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        unsubscribeFromFirestore = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const appUser = { id: docSnapshot.id, ...docSnapshot.data() } as User;
            const updatedAppUser: User = {
                ...appUser,
                email: firebaseUser.email || appUser.email,
                nickname: firebaseUser.displayName || appUser.nickname,
                avatar: firebaseUser.photoURL || appUser.avatar,
            };
            setUser(updatedAppUser);
            setIsAdmin(updatedAppUser.isAdmin || false);
            localStorage.setItem('currentUser', JSON.stringify(updatedAppUser));
          } else {
            const newAppUser: User = {
                id: firebaseUser.uid,
                username: firebaseUser.email!, 
                nickname: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '새 사용자',
                email: firebaseUser.email!,
                avatar: firebaseUser.photoURL || `https://placehold.co/100x100.webp?text=${(firebaseUser.displayName || firebaseUser.email || 'N').substring(0,1).toUpperCase()}`,
                score: 0, rank: 0, tetrisRank: 0,
                categoryStats: { Unity: { score: 0 }, Unreal: { score: 0 }, Godot: { score: 0 }, General: { score: 0 } },
                nicknameLastChanged: serverTimestamp(), isBlocked: false, socialProfiles: {},
                selectedTitleIdentifier: 'none', selectedNicknameEffectIdentifier: 'none', selectedLogoIdentifier: 'none',
                twoFactorEnabled: false, emailChangesToday: 0, lastEmailChangeDate: null,
                passwordChangesToday: 0, lastPasswordChangeDate: null,
                isAdmin: false, createdAt: serverTimestamp(),
            };
            setUser(newAppUser);
            setIsAdmin(false);
            saveUserToFirestore(newAppUser);
          }
          setLoading(false);
        }, (error) => {
          console.error("🚨 Firestore onSnapshot 오류:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean, message?: string }> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: "로그인 성공!" };
    } catch (error: any) {
      setLoading(false);
      let message = "로그인에 실패했습니다.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "아이디 또는 비밀번호가 올바르지 않습니다.";
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("🚨 로그아웃 오류:", error);
    }
  };

  const signup = async (userData: SignupUserDto): Promise<{ success: boolean, message?: string, user?: User }> => {
    if (!userData.email || !userData.password) {
        return { success: false, message: "이메일과 비밀번호는 필수입니다." };
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      await updateProfile(userCredential.user, { displayName: userData.nickname });
      return { success: true, message: "회원가입 성공! 자동으로 로그인됩니다."};
    } catch (error: any) {
      let message = "회원가입 중 오류가 발생했습니다.";
       if (error.code === 'auth/email-already-in-use') {
        message = "이미 사용 중인 이메일입니다.";
      }
      return { success: false, message };
    }
  };
  
  const updateUser = async (updatedUserPartial: Partial<User>) => {
    if (!user?.id) return;
    
    const updateData: any = { ...updatedUserPartial, updatedAt: serverTimestamp() };
    if (updateData.nicknameLastChanged) {
        updateData.nicknameLastChanged = serverTimestamp();
    }

    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, updateData);
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!auth?.currentUser || !user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
    await updateUser({
        passwordChangesToday: 1, // This logic should be more robust
        lastPasswordChangeDate: serverTimestamp() as any // Cast to any to avoid type conflict
    });
  };
  
  const updateUserEmail = async (newEmail: string, currentPassword: string) => {
     if (!auth?.currentUser || !user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await firebaseUpdateEmail(auth.currentUser, newEmail);
    await updateUser({
        email: newEmail,
        emailChangesToday: 1, // This logic should be more robust
        lastEmailChangeDate: serverTimestamp() as any // Cast to any to avoid type conflict
    });
  };
  
  const contextValue: AuthContextType = { user, isAdmin, logout, login, signup, updateUser, updateUserPassword, updateUserEmail, loading };

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
