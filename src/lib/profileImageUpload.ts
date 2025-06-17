
"use client";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, UploadMetadata } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { resizeImage, validateImage, validateImageMimeType } from './imageUtils';
import type { User } from '@/types';


const getCurrentUserPromise = (): Promise<FirebaseUser> => {
  return new Promise((resolve, reject) => {
    if (auth && auth.currentUser) {
      return resolve(auth.currentUser);
    }
    if (!auth) {
      return reject(new Error('Firebase Auth service is not initialized.'));
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Login is required.'));
      }
    }, (error) => {
      unsubscribe();
      reject(new Error('Error checking Firebase auth state: ' + error.message));
    });
  });
};


const deleteExistingProfileImages = async (appUserId: string): Promise<void> => {
  try {
    const storage = getStorage();
    const folderRef = ref(storage, `profile-images/${appUserId}/`);

    const result = await listAll(folderRef);
    const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);

    console.log(`Successfully deleted old profile images for: ${appUserId}`);
  } catch (error: any) {
    if (error.code !== 'storage/object-not-found') {
      console.warn('Error deleting existing images:', error);
    }
  }
};


export const uploadProfileImage = async (
  file: File, 
  appUserId: string, 
  onProgress: ((progress: number) => void) | null = null
): Promise<string> => {
  try {
    const firebaseAuthUser = await getCurrentUserPromise();
    if (onProgress) onProgress(10);

    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid image file.');
    }
    if (onProgress) onProgress(20);

    const isMimeValid = await validateImageMimeType(file);
    if (!isMimeValid) {
      throw new Error('Invalid image file type.');
    }
    if (onProgress) onProgress(30);

    const resizedBlob: Blob | null = await resizeImage(file);
    if (!resizedBlob) {
        throw new Error('Failed to resize image.');
    }
    if (onProgress) onProgress(50);

    if (resizedBlob.size > 1024 * 1024) { // 1MB
      throw new Error('Resized file size is still too large.');
    }

    const storage = getStorage();
    const timestamp = Date.now();
    const imageRef = ref(storage, `profile-images/${appUserId}/profile_${timestamp}.jpg`);
    
    const metadata: UploadMetadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
      customMetadata: {
        originalName: file.name,
        originalSize: file.size.toString(),
        resizedSize: resizedBlob.size.toString(),
        appUserId: appUserId,
        firebaseUID: firebaseAuthUser.uid
      }
    };
    if (onProgress) onProgress(60);
    
    await deleteExistingProfileImages(appUserId);

    const snapshot = await uploadBytes(imageRef, resizedBlob, metadata);
    if (onProgress) onProgress(80);

    const downloadURL = await getDownloadURL(snapshot.ref);
    if (onProgress) onProgress(90);

    if (!db) {
      throw new Error('Firestore service is not initialized.');
    }
    const userDocRef = doc(db, 'users', appUserId);

    const docSnap = await getDoc(userDocRef);
    const updateData: Partial<User> = {
      avatar: downloadURL,
      // profileImageUpdatedAt and profileImageSize are not in User type, consider adding them if needed
    };

    if (docSnap.exists()) {
      await setDoc(userDocRef, updateData, { merge: true });
    } else {
        const newUser: Partial<User> = {
            id: appUserId,
            username: firebaseAuthUser.email || `user_${appUserId}`,
            nickname: firebaseAuthUser.displayName || 'New User',
            email: firebaseAuthUser.email || '',
            ...updateData
          };
      await setDoc(userDocRef, newUser, { merge: true });
    }
    if (onProgress) onProgress(100);

    return downloadURL;

  } catch (error: any) {
    console.error('Profile image upload error:', error);
    throw new Error(error.message || 'Failed to upload profile image.');
  }
};


export const deleteProfileImage = async (appUserId: string): Promise<boolean> => {
    try {
      await getCurrentUserPromise();
      await deleteExistingProfileImages(appUserId);
  
      if (!db) {
        throw new Error('Firestore service is not initialized.');
      }
      const userDocRef = doc(db, 'users', appUserId);
  
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        await setDoc(userDocRef, {
          avatar: null,
        }, { merge: true });
      }
  
      console.log('Successfully deleted profile image from Storage and Firestore.');
      return true;
  
    } catch (error: any) {
      console.error('Profile image deletion error:', error);
      throw new Error(error.message || 'Failed to delete profile image.');
    }
  };


export const getUserProfileImages = async (appUserId: string): Promise<{name: string, url: string}[]> => {
    try {
      await getCurrentUserPromise();
  
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
    } catch (error: any) {
      console.error('Error fetching user profile images:', error);
      throw new Error('Could not fetch user profile images.');
    }
  };
