// src/lib/profileImageUpload.js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { resizeImage, validateImage, validateImageMimeType } from './imageUtils';

/**
 * 사용자 인증 상태 확인 (Promise 방식)
 */
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('로그인이 필요합니다.'));
      }
    });

    // 5초 타임아웃
    setTimeout(() => {
      unsubscribe();
      reject(new Error('인증 상태 확인 시간이 초과되었습니다.'));
    }, 5000);
  });
};

/**
 * 기존 프로필 이미지 삭제
 * @param {string} userId - 사용자 ID
 */
const deleteExistingProfileImages = async (userId) => {
  try {
    const storage = getStorage();
    const folderRef = ref(storage, `profile-images/${userId}/`);
    
    // 기존 이미지들 조회 및 삭제
    const result = await listAll(folderRef);
    const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);
    
    console.log('기존 프로필 이미지들이 삭제되었습니다.');
  } catch (error) {
    // 파일이 존재하지 않는 경우는 정상적인 상황
    if (error.code !== 'storage/object-not-found') {
      console.warn('기존 이미지 삭제 중 오류:', error);
    }
  }
};

/**
 * Firebase Storage에 프로필 이미지 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} userId - 사용자 ID
 * @param {function} onProgress - 업로드 진행률 콜백
 * @returns {Promise<string>} 업로드된 이미지의 다운로드 URL
 */
export const uploadProfileImage = async (file, userId, onProgress = null) => {
  try {
    // 0. 사용자 인증 확인 (개선된 방식)
    const user = await getCurrentUser();
    
    if (!user || user.uid !== userId) {
      throw new Error('인증된 사용자만 자신의 프로필을 수정할 수 있습니다.');
    }

    console.log('인증된 사용자:', user.uid);

    // 1. 기본 이미지 유효성 검사
    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (onProgress) onProgress(10);

    // 2. MIME 타입 이중 검증
    const isMimeValid = await validateImageMimeType(file);
    if (!isMimeValid) {
      throw new Error('올바르지 않은 이미지 파일입니다.');
    }

    if (onProgress) onProgress(20);

    // 3. 이미지 리사이징
    const resizedBlob = await resizeImage(file);
    if (onProgress) onProgress(50);

    // 4. 리사이징된 파일 크기 재검증
    if (resizedBlob.size > 1024 * 1024) {
      throw new Error('리사이징 후에도 파일 크기가 너무 큽니다.');
    }

    // 5. Firebase Storage 참조 생성
    const storage = getStorage();
    const timestamp = Date.now();
    const imageRef = ref(storage, `profile-images/${userId}/profile_${timestamp}.jpg`);
    
    // 6. 업로드 메타데이터 설정
    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
      customMetadata: {
        originalName: file.name,
        originalSize: file.size.toString(),
        resizedSize: resizedBlob.size.toString(),
        uploadedAt: new Date().toISOString(),
        userId: userId
      }
    };

    if (onProgress) onProgress(60);

    // 7. 기존 이미지 삭제 (백그라운드에서 실행)
    deleteExistingProfileImages(userId).catch(console.warn);

    // 8. 파일 업로드
    const snapshot = await uploadBytes(imageRef, resizedBlob, metadata);
    if (onProgress) onProgress(80);

    // 9. 다운로드 URL 획득
    const downloadURL = await getDownloadURL(snapshot.ref);
    if (onProgress) onProgress(90);

    // 10. Firestore 사용자 문서 업데이트
    const db = getFirestore();
    const userDocRef = doc(db, 'users', userId);
    
    // 문서 존재 여부 확인 후 업데이트
    const docSnap = await getDoc(userDocRef);
    const updateData = {
      avatar: downloadURL,
      profileImageUpdatedAt: new Date().toISOString(),
      profileImageSize: resizedBlob.size
    };

    if (docSnap.exists()) {
      await setDoc(userDocRef, updateData, { merge: true });
    } else {
      // 문서가 없으면 기본 사용자 정보와 함께 생성
      const newUserData = {
        id: userId,
        nickname: user.displayName || '사용자',
        email: user.email || '',
        createdAt: new Date().toISOString(),
        ...updateData
      };
      await setDoc(userDocRef, newUserData);
    }

    if (onProgress) onProgress(100);

    return downloadURL;

  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error);
    
    // 사용자 친화적인 오류 메시지 제공
    let userMessage = '프로필 이미지 업로드에 실패했습니다.';
    
    if (error.message.includes('로그인')) {
      userMessage = '로그인이 필요합니다.';
    } else if (error.message.includes('형식') || error.message.includes('파일')) {
      userMessage = error.message;
    } else if (error.message.includes('크기')) {
      userMessage = error.message;
    } else if (error.code === 'storage/unauthorized') {
      userMessage = '업로드 권한이 없습니다. 로그인을 확인해주세요.';
    } else if (error.code === 'storage/quota-exceeded') {
      userMessage = '저장 공간이 부족합니다. 관리자에게 문의해주세요.';
    } else if (error.code === 'storage/retry-limit-exceeded') {
      userMessage = '네트워크 오류로 업로드에 실패했습니다. 다시 시도해주세요.';
    } else if (error.code === 'storage/invalid-format') {
      userMessage = '지원되지 않는 파일 형식입니다.';
    } else if (error.code === 'storage/unknown') {
      userMessage = '알 수 없는 오류가 발생했습니다. 네트워크 연결을 확인해주세요.';
    }

    throw new Error(userMessage);
  }
};

/**
 * 프로필 이미지 삭제
 * @param {string} userId - 사용자 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const deleteProfileImage = async (userId) => {
  try {
    // 사용자 인증 확인
    const user = await getCurrentUser();
    
    if (!user || user.uid !== userId) {
      throw new Error('인증된 사용자만 자신의 프로필을 수정할 수 있습니다.');
    }

    console.log('프로필 이미지 삭제 시작:', userId);

    // Storage에서 모든 프로필 이미지 삭제
    await deleteExistingProfileImages(userId);

    // Firestore에서 avatar 필드 제거
    const db = getFirestore();
    const userDocRef = doc(db, 'users', userId);
    
    // 문서 존재 여부 확인 후 업데이트
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      await setDoc(userDocRef, {
        avatar: null,
        profileImageUpdatedAt: new Date().toISOString(),
        profileImageSize: null
      }, { merge: true });
    }

    console.log('프로필 이미지 삭제 완료');
    return true;

  } catch (error) {
    console.error('프로필 이미지 삭제 오류:', error);
    
    // 사용자 친화적인 오류 메시지
    let userMessage = '프로필 이미지 삭제에 실패했습니다.';
    
    if (error.message.includes('로그인')) {
      userMessage = '로그인이 필요합니다.';
    } else if (error.code === 'storage/unauthorized') {
      userMessage = '삭제 권한이 없습니다. 로그인을 확인해주세요.';
    } else if (error.code === 'storage/unknown') {
      userMessage = '네트워크 오류로 삭제에 실패했습니다. 다시 시도해주세요.';
    }

    throw new Error(userMessage);
  }
};

/**
 * 사용자의 모든 프로필 이미지 조회 (관리자용)
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Array>} 프로필 이미지 목록
 */
export const getUserProfileImages = async (userId) => {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.uid !== userId) {
      throw new Error('인증된 사용자만 자신의 이미지 목록을 조회할 수 있습니다.');
    }

    const storage = getStorage();
    const folderRef = ref(storage, `profile-images/${userId}/`);
    const result = await listAll(folderRef);
    
    const images = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await itemRef.getMetadata();
        return {
          name: itemRef.name,
          url,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          contentType: metadata.contentType
        };
      })
    );
    
    return images;
  } catch (error) {
    console.error('프로필 이미지 목록 조회 오류:', error);
    throw new Error('프로필 이미지 목록을 조회할 수 없습니다.');
  }
};
