
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase 앱 초기화
let app;
try {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    console.log('Firebase 초기화 성공');
  }
} catch (error) {
  console.error('Firebase 초기화 오류:', error);
  throw new Error('Firebase 연결에 실패했습니다.');
}

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 환경변수 확인 (브라우저 환경에서만 실행)
if (typeof window !== 'undefined') {
  console.log('Firebase Config Being Used:', {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId
  });
  if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is MISSING or UNDEFINED in your .env.local file. Please check your environment variables.");
  }
}

export default app;
