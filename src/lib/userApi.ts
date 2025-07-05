// src/lib/userApi.ts
import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc, 
  addDoc, 
  setDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  updatePassword, 
  updateEmail, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import type { User } from '@/types';

/**
 * 사용자 ID로 사용자 정보를 가져옵니다.
 * @param userId - 사용자 ID
 * @returns User 객체 또는 null
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * 사용자 프로필을 업데이트합니다.
 * @param userId - 사용자 ID
 * @param updateData - 업데이트할 데이터
 */
export async function updateUserProfile(userId: string, updateData: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * 현재 로그인한 사용자의 프로필을 가져옵니다.
 * @returns User 객체 또는 null
 */
export async function getUserProfile(): Promise<User | null> {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return null;
    }
    
    return await getUser(currentUser.uid);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * 새로운 사용자를 생성합니다.
 * @param userId - 사용자 ID
 * @param userData - 사용자 데이터
 */
export async function createUser(userId: string, userData: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * 사용자를 삭제합니다.
 * @param userId - 사용자 ID
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * 모든 사용자를 가져옵니다.
 * @param limitCount - 제한할 사용자 수 (선택사항)
 * @returns User 배열
 */
export async function getAllUsers(limitCount?: number): Promise<User[]> {
  try {
    const usersCollection = collection(db, 'users');
    let q = query(usersCollection, orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

/**
 * 사용자명으로 사용자를 검색합니다.
 * @param username - 검색할 사용자명
 * @returns User 객체 또는 null
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

/**
 * 이메일로 사용자를 검색합니다.
 * @param email - 검색할 이메일
 * @returns User 객체 또는 null
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * 사용자를 검색합니다.
 * @param searchTerm - 검색어
 * @param limitCount - 제한할 사용자 수
 * @returns User 배열
 */
export async function searchUsers(searchTerm: string, limitCount: number = 10): Promise<User[]> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(
      usersCollection,
      where('nickname', '>=', searchTerm),
      where('nickname', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

/**
 * 사용자 비밀번호를 업데이트합니다.
 * @param currentPassword - 현재 비밀번호
 * @param newPassword - 새 비밀번호
 */
export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }
    
    // 재인증
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // 비밀번호 업데이트
    await updatePassword(user, newPassword);
    
    // Firestore에서 비밀번호 변경 이력 업데이트
    const userRef = doc(db, 'users', user.uid);
    const today = new Date().toDateString();
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastChangeDate = userData.lastPasswordChangeDate;
      const changesToday = lastChangeDate === today ? (userData.passwordChangesToday || 0) + 1 : 1;
      
      await updateDoc(userRef, {
        lastPasswordChangeDate: today,
        passwordChangesToday: changesToday,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

/**
 * 사용자 이메일을 업데이트합니다.
 * @param newEmail - 새 이메일
 * @param currentPassword - 현재 비밀번호
 */
export async function updateUserEmail(newEmail: string, currentPassword: string): Promise<void> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }
    
    // 재인증
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // 이메일 업데이트
    await updateEmail(user, newEmail);
    
    // Firestore에서 이메일 및 변경 이력 업데이트
    const userRef = doc(db, 'users', user.uid);
    const today = new Date().toDateString();
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastChangeDate = userData.lastEmailChangeDate;
      const changesToday = lastChangeDate === today ? (userData.emailChangesToday || 0) + 1 : 1;
      
      await updateDoc(userRef, {
        email: newEmail,
        lastEmailChangeDate: today,
        emailChangesToday: changesToday,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
}

/**
 * 사용자 점수를 업데이트합니다.
 * @param userId - 사용자 ID
 * @param score - 새로운 점수
 */
export async function updateUserScore(userId: string, score: number): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      score: score,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user score:', error);
    throw error;
  }
}

/**
 * 사용자 랭킹을 업데이트합니다.
 * @param userId - 사용자 ID
 * @param rank - 새로운 랭킹
 */
export async function updateUserRank(userId: string, rank: number): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      rank: rank,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user rank:', error);
    throw error;
  }
}

/**
 * 사용자 아바타를 업데이트합니다.
 * @param userId - 사용자 ID
 * @param avatarUrl - 새로운 아바타 URL
 */
export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      avatar: avatarUrl,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw error;
  }
}

/**
 * 상위 사용자들을 점수별로 가져옵니다.
 * @param limitCount - 가져올 사용자 수
 * @returns User 배열
 */
export async function getTopUsersByScore(limitCount: number = 10): Promise<User[]> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(
      usersCollection,
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc, index) => ({
      id: doc.id,
      ...doc.data(),
      rank: index + 1
    } as User));
  } catch (error) {
    console.error('Error fetching top users by score:', error);
    return [];
  }
}

/**
 * 사용자 활동 상태를 업데이트합니다.
 * @param userId - 사용자 ID
 * @param isActive - 활동 상태
 */
export async function updateUserActiveStatus(userId: string, isActive: boolean): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: isActive,
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user active status:', error);
    throw error;
  }
}

/**
 * 사용자의 마지막 로그인 시간을 업데이트합니다.
 * @param userId - 사용자 ID
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user last login:', error);
    throw error;
  }
}

/**
 * 사용자 카테고리별 통계를 업데이트합니다.
 * @param userId - 사용자 ID
 * @param category - 카테고리
 * @param stats - 통계 데이터
 */
export async function updateUserCategoryStats(userId: string, category: string, stats: any): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`categoryStats.${category}`]: stats,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user category stats:', error);
    throw error;
  }
}
