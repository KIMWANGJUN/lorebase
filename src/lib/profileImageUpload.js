
// src/lib/profileImageUpload.js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Corrected import path
import { onAuthStateChanged } from 'firebase/auth';
import { resizeImage, validateImage, validateImageMimeType } from './imageUtils';

/**
 * 사용자 인증 상태 확인 (Promise 방식)
 */
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    if (auth && auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    if (!auth) {
      reject(new Error('Firebase Auth 서비스가 초기화되지 않았습니다.'));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); 
      if (user) {
        resolve(user);
      } else {
        reject(new Error('로그인이 필요합니다.'));
      }
    }, (error) => { 
      unsubscribe();
      reject(new Error('Firebase 인증 상태 확인 중 오류 발생: ' + error.message));
    });

    setTimeout(() => {
      unsubscribe(); 
      if (auth && !auth.currentUser) {
        reject(new Error('Firebase 인증 상태 확인 시간 초과.'));
      } else if (auth && auth.currentUser) {
        resolve(auth.currentUser);
      }
    }, 5000);
  });
};


/**
 * 기존 프로필 이미지 삭제
 * @param {string} appUserId - 애플리케이션 사용자 ID (스토리지 경로에 사용됨)
 */
const deleteExistingProfileImages = async (appUserId) => {
  try {
    const storage = getStorage();
    const folderRef = ref(storage, `profile-images/${appUserId}/`);

    const result = await listAll(folderRef);
    const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);

    console.log(`기존 프로필 이미지들 삭제 완료: profile-images/${appUserId}/`);
  } catch (error) {
    if (error.code !== 'storage/object-not-found') {
      console.warn('기존 이미지 삭제 중 오류:', error);
    }
  }
};

/**
 * Firebase Storage에 프로필 이미지 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} appUserId - 애플리케이션 사용자 ID (스토리지 경로 및 Firestore 문서 ID에 사용)
 * @param {function} onProgress - 업로드 진행률 콜백
 * @returns {Promise<string>} 업로드된 이미지의 다운로드 URL
 */
export const uploadProfileImage = async (file, appUserId, onProgress = null) => {
  try {
    const firebaseAuthUser = await getCurrentUser();
    if (!firebaseAuthUser) {
      throw new Error('Firebase에 로그인되어 있지 않아 작업을 진행할 수 없습니다.');
    }

    console.log('Firebase 인증된 사용자 UID:', firebaseAuthUser.uid);
    console.log('업로드 경로에 사용될 App User ID:', appUserId);

    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    if (onProgress) onProgress(10);

    const isMimeValid = await validateImageMimeType(file);
    if (!isMimeValid) {
      throw new Error('올바르지 않은 이미지 파일입니다.');
    }
    if (onProgress) onProgress(20);

    const resizedBlob = await resizeImage(file);
    if (onProgress) onProgress(50);

    if (resizedBlob.size > 1024 * 1024) {
      throw new Error('리사이징 후에도 파일 크기가 너무 큽니다.');
    }

    const storage = getStorage();
    const timestamp = Date.now();
    const imageRef = ref(storage, `profile-images/${appUserId}/profile_${timestamp}.jpg`);

    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
      customMetadata: {
        originalName: file.name,
        originalSize: file.size.toString(),
        resizedSize: resizedBlob.size.toString(),
        uploadedAt: new Date().toISOString(),
        appUserId: appUserId,
        firebaseUID: firebaseAuthUser.uid
      }
    };
    if (onProgress) onProgress(60);

    deleteExistingProfileImages(appUserId).catch(console.warn);

    const snapshot = await uploadBytes(imageRef, resizedBlob, metadata);
    if (onProgress) onProgress(80);

    const downloadURL = await getDownloadURL(snapshot.ref);
    if (onProgress) onProgress(90);

    if (!db) {
      console.error('Firestore DB instance is not available in profileImageUpload.');
      throw new Error('Firestore 서비스가 초기화되지 않았습니다. 데이터베이스 업데이트를 할 수 없습니다.');
    }
    const userDocRef = doc(db, 'users', appUserId);

    const docSnap = await getDoc(userDocRef);
    const updateData = {
      avatar: downloadURL,
      photoURL: downloadURL,
      profileImageUpdatedAt: new Date().toISOString(),
      profileImageSize: resizedBlob.size
    };

    if (docSnap.exists()) {
      await setDoc(userDocRef, updateData, { merge: true });
    } else {
      const newUserData = {
        id: appUserId,
        nickname: '사용자', 
        email: firebaseAuthUser.email || '',
        createdAt: new Date().toISOString(),
        ...updateData
      };
      await setDoc(userDocRef, newUserData);
    }
    if (onProgress) onProgress(100);

    return downloadURL;

  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error);
    let userMessage = error.message || '프로필 이미지 업로드에 실패했습니다.';
    throw new Error(userMessage);
  }
};

/**
 * 프로필 이미지 삭제
 * @param {string} appUserId - 애플리케이션 사용자 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const deleteProfileImage = async (appUserId) => {
  try {
    const firebaseAuthUser = await getCurrentUser();
     if (!firebaseAuthUser) {
      throw new Error('Firebase에 로그인되어 있지 않아 작업을 진행할 수 없습니다.');
    }

    console.log('프로필 이미지 삭제 시작, App User ID:', appUserId);

    await deleteExistingProfileImages(appUserId);

    if (!db) {
      console.error('Firestore DB instance is not available in deleteProfileImage.');
      throw new Error('Firestore 서비스가 초기화되지 않았습니다. 데이터베이스 업데이트를 할 수 없습니다.');
    }
    const userDocRef = doc(db, 'users', appUserId);

    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      await setDoc(userDocRef, {
        avatar: null,
        photoURL: null,
        profileImageUpdatedAt: new Date().toISOString(),
        profileImageSize: null
      }, { merge: true });
    }

    console.log('프로필 이미지 삭제 완료');
    return true;

  } catch (error) {
    console.error('프로필 이미지 삭제 오류:', error);
    let userMessage = error.message || '프로필 이미지 삭제에 실패했습니다.';
    throw new Error(userMessage);
  }
};

/**
 * 사용자의 모든 프로필 이미지 조회 (관리자용 또는 사용자 본인)
 * @param {string} appUserId - 애플리케이션 사용자 ID
 * @returns {Promise<Array>} 프로필 이미지 목록
 */
export const getUserProfileImages = async (appUserId) => {
  try {
    const firebaseAuthUser = await getCurrentUser();
     if (!firebaseAuthUser) {
      throw new Error('Firebase 로그인이 필요합니다.');
    }

    const storage = getStorage();
    const folderRef = ref(storage, `profile-images/${appUserId}/`);
    const result = await listAll(folderRef);

    const images = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
        };
      })
    );

    return images;
  } catch (error) {
    console.error('프로필 이미지 목록 조회 오류:', error);
    throw new Error('프로필 이미지 목록을 조회할 수 없습니다.');
  }
};

