
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
    // First, check if auth.currentUser is already available
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    // If not, set up an observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe after the first callback
      if (user) {
        resolve(user);
      } else {
        reject(new Error('로그인이 필요합니다.')); // This is the error that might be caught
      }
    }, (error) => { // Handle errors from onAuthStateChanged itself
      unsubscribe();
      reject(new Error('Firebase 인증 상태 확인 중 오류 발생: ' + error.message));
    });

    // Timeout to prevent hanging indefinitely if Firebase doesn't respond
    setTimeout(() => {
      unsubscribe(); // Ensure unsubscription on timeout
      // If after timeout auth.currentUser is still null and onAuthStateChanged hasn't resolved/rejected
      if (!auth.currentUser) { // Check again, as onAuthStateChanged might have set it
        reject(new Error('Firebase 인증 상태 확인 시간 초과.'));
      } else {
        resolve(auth.currentUser); // It might have become available
      }
    }, 5000); // 5-second timeout
  });
};


/**
 * 기존 프로필 이미지 삭제
 * @param {string} appUserId - 애플리케이션 사용자 ID (스토리지 경로에 사용됨)
 */
const deleteExistingProfileImages = async (appUserId) => {
  try {
    const storage = getStorage();
    // Path uses appUserId
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
    // 0. Check actual Firebase Auth state.
    // getCurrentUser will throw "로그인이 필요합니다." if no Firebase user is authenticated.
    const firebaseAuthUser = await getCurrentUser();
    if (!firebaseAuthUser) {
      // This should ideally be caught by getCurrentUser's reject, but as a safeguard:
      throw new Error('Firebase에 로그인되어 있지 않아 작업을 진행할 수 없습니다.');
    }
    // At this point, firebaseAuthUser is the authenticated Firebase User object.
    // appUserId is the ID from AuthContext (e.g., 'user1', 'admin'), used for the storage path.
    // Firebase Storage Rules should handle if firebaseAuthUser.uid has rights to write to `profile-images/${appUserId}/`

    console.log('Firebase 인증된 사용자 UID:', firebaseAuthUser.uid);
    console.log('업로드 경로에 사용될 App User ID:', appUserId);

    // 1. Basic image validation
    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    if (onProgress) onProgress(10);

    // 2. MIME type double check
    const isMimeValid = await validateImageMimeType(file);
    if (!isMimeValid) {
      throw new Error('올바르지 않은 이미지 파일입니다.');
    }
    if (onProgress) onProgress(20);

    // 3. Image resizing
    const resizedBlob = await resizeImage(file);
    if (onProgress) onProgress(50);

    // 4. Re-validate resized file size
    if (resizedBlob.size > 1024 * 1024) {
      throw new Error('리사이징 후에도 파일 크기가 너무 큽니다.');
    }

    // 5. Create Firebase Storage reference using appUserId for path
    const storage = getStorage();
    const timestamp = Date.now();
    const imageRef = ref(storage, `profile-images/${appUserId}/profile_${timestamp}.jpg`);

    // 6. Set upload metadata
    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
      customMetadata: {
        originalName: file.name,
        originalSize: file.size.toString(),
        resizedSize: resizedBlob.size.toString(),
        uploadedAt: new Date().toISOString(),
        appUserId: appUserId, // Store appUserId in metadata
        firebaseUID: firebaseAuthUser.uid // Store Firebase UID for reference
      }
    };
    if (onProgress) onProgress(60);

    // 7. Delete existing images (background)
    deleteExistingProfileImages(appUserId).catch(console.warn);

    // 8. Upload file
    const snapshot = await uploadBytes(imageRef, resizedBlob, metadata);
    if (onProgress) onProgress(80);

    // 9. Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    if (onProgress) onProgress(90);

    // 10. Update Firestore user document (using appUserId as document ID)
    // This part assumes your Firestore 'users' collection uses appUserId as document IDs.
    // If it uses Firebase UIDs, then a mapping or different update strategy is needed.
    // For this prototype, we'll assume appUserId is the Firestore document ID.
    const db = getFirestore();
    const userDocRef = doc(db, 'users', appUserId); // Using appUserId for Firestore doc ID

    const docSnap = await getDoc(userDocRef);
    const updateData = {
      avatar: downloadURL, // This is the field AuthContext expects for user.avatar
      photoURL: downloadURL, // Also update photoURL if Firebase User object might be synced
      profileImageUpdatedAt: new Date().toISOString(),
      profileImageSize: resizedBlob.size
    };

    if (docSnap.exists()) {
      await setDoc(userDocRef, updateData, { merge: true });
    } else {
      // If document doesn't exist, create it.
      // This might need more user details if creating for the first time.
      const newUserData = {
        id: appUserId,
        nickname: '사용자', // Placeholder, should come from AuthContext or user profile
        email: firebaseAuthUser.email || '', // From Firebase Auth if available
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
    // The "로그인이 필요합니다." error from getCurrentUser will be caught here.
    throw new Error(userMessage); // Re-throw with the potentially modified message
  }
};

/**
 * 프로필 이미지 삭제
 * @param {string} appUserId - 애플리케이션 사용자 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const deleteProfileImage = async (appUserId) => {
  try {
    // Check actual Firebase Auth state.
    const firebaseAuthUser = await getCurrentUser();
     if (!firebaseAuthUser) {
      throw new Error('Firebase에 로그인되어 있지 않아 작업을 진행할 수 없습니다.');
    }
    // Again, Storage Rules should verify firebaseAuthUser.uid against the owner of appUserId path.

    console.log('프로필 이미지 삭제 시작, App User ID:', appUserId);

    // Storage에서 모든 프로필 이미지 삭제
    await deleteExistingProfileImages(appUserId);

    // Firestore에서 avatar 필드 제거
    const db = getFirestore();
    const userDocRef = doc(db, 'users', appUserId); // Using appUserId for Firestore doc ID

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
    // Add logic here if only admins or specific users can call this.
    // For now, any authenticated Firebase user can try, path is appUserId.

    const storage = getStorage();
    const folderRef = ref(storage, `profile-images/${appUserId}/`);
    const result = await listAll(folderRef);

    const images = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        // Firebase SDK for web doesn't expose getMetadata() directly on itemRef from listAll
        // To get metadata, you'd typically call getMetadata(itemRef)
        // However, for simplicity, we'll just get basic info.
        // const metadata = await itemRef.getMetadata(); // This line might be an issue depending on Firebase version/SDK
        return {
          name: itemRef.name,
          url,
          // size: metadata.size, // Requires getMetadata call
          // timeCreated: metadata.timeCreated,
        };
      })
    );

    return images;
  } catch (error) {
    console.error('프로필 이미지 목록 조회 오류:', error);
    throw new Error('프로필 이미지 목록을 조회할 수 없습니다.');
  }
};
