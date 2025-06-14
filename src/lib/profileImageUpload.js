// src/lib/profileImageUpload.js

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { resizeImage, validateImage, validateImageMimeType } from './imageUtils';

/**
 * 기존 프로필 이미지 삭제
 * @param {string} userId - 사용자 ID
 */
const deleteExistingProfileImage = async (userId) => {
  try {
    const storage = getStorage();
    const oldImageRef = ref(storage, `profile-images/${userId}/profile.jpg`);
    await deleteObject(oldImageRef);
    console.log('기존 프로필 이미지가 삭제되었습니다.');
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
    // 1. 기본 이미지 유효성 검사
    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. 진행률 업데이트: 유효성 검사 완료
    if (onProgress) onProgress(5);

    // 3. MIME 타입 이중 검증
    const isMimeValid = await validateImageMimeType(file);
    if (!isMimeValid) {
      throw new Error('올바르지 않은 이미지 파일입니다.');
    }

    if (onProgress) onProgress(10);

    // 4. 이미지 리사이징
    const resizedBlob = await resizeImage(file);
    if (onProgress) onProgress(30);

    // 5. 리사이징된 파일 크기 재검증
    if (resizedBlob.size > 1024 * 1024) { // 1MB
      throw new Error('리사이징 후에도 파일 크기가 너무 큽니다.');
    }

    // 6. 기존 이미지 삭제 (병렬 처리)
    const deletePromise = deleteExistingProfileImage(userId);
    
    // 7. Firebase Storage 참조 생성
    const storage = getStorage();
    const timestamp = Date.now();
    const imageRef = ref(storage, `profile-images/${userId}/profile_${timestamp}.jpg`);
    
    // 8. 업로드 메타데이터 설정
    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000', // 1년 캐시
      customMetadata: {
        originalName: file.name,
        originalSize: file.size.toString(),
        resizedSize: resizedBlob.size.toString(),
        uploadedAt: new Date().toISOString(),
        resized: 'true',
        version: '1.0'
      }
    };

    if (onProgress) onProgress(40);

    // 9. 파일 업로드
    const snapshot = await uploadBytes(imageRef, resizedBlob, metadata);
    if (onProgress) onProgress(70);

    // 10. 다운로드 URL 획득
    const downloadURL = await getDownloadURL(snapshot.ref);
    if (onProgress) onProgress(90);

    // 11. Firestore 사용자 문서 업데이트
    const db = getFirestore();
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      avatar: downloadURL,
      profileImageUpdatedAt: new Date().toISOString(),
      profileImageSize: resizedBlob.size
    });

    // 12. 기존 이미지 삭제 완료 대기
    await deletePromise;

    if (onProgress) onProgress(100);

    return downloadURL;

  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error);
    
    // 사용자 친화적인 오류 메시지 제공
    let userMessage = '프로필 이미지 업로드에 실패했습니다.';
    
    if (error.message.includes('형식') || error.message.includes('파일')) {
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
 */
export const deleteProfileImage = async (userId) => {
  try {
    // Storage에서 이미지 삭제
    await deleteExistingProfileImage(userId);

    // Firestore에서 avatar 필드 제거
    const db = getFirestore();
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      avatar: null,
      profileImageUpdatedAt: new Date().toISOString(),
      profileImageSize: null
    });

    return true;
  } catch (error) {
    console.error('프로필 이미지 삭제 오류:', error);
    throw new Error('프로필 이미지 삭제에 실패했습니다.');
  }
};

/**
 * 사용자의 모든 프로필 이미지 조회 (관리자용)
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Array>} 프로필 이미지 목록
 */
export const getUserProfileImages = async (userId) => {
  try {
    const storage = getStorage();
    const { listAll } = await import('firebase/storage');
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
          updated: metadata.updated
        };
      })
    );
    
    return images;
  } catch (error) {
    console.error('프로필 이미지 목록 조회 오류:', error);
    throw new Error('프로필 이미지 목록을 조회할 수 없습니다.');
  }
};
