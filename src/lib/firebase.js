// src/lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Firebase Config from Environment Variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // If you use it
};

const isServer = typeof window === 'undefined';
console.log(`🔍 Firebase 초기화 환경: isServer: ${isServer}, isClient: ${!isServer}`);

if (!firebaseConfig.apiKey) {
  console.error("🚨 Firebase API Key가 로드되지 않았습니다. .env.local 파일을 확인해주세요.");
} else {
  console.log('🔧 Firebase Config (From Env Vars):', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : '❌ 없음',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}

let app;
const apps = getApps();
if (apps.length > 0) {
  app = apps[0]; // Use the existing app if already initialized
  console.log('🔄 기존 Firebase 앱 사용');
} else {
  try {
    app = initializeApp(firebaseConfig);
    console.log('🆕 새로운 Firebase 앱 초기화 (From Env Vars)');
  } catch (e) {
    console.error("🚨 Firebase 앱 초기화 실패:", e);
    // Provide a non-functional app object or throw to prevent further errors
    // This helps prevent subsequent errors if initialization fails.
    app = { options: {} }; // Dummy app object to prevent further crashes
  }
}

if (app.options && app.options.projectId) {
  console.log('✅ Firebase 앱 초기화 성공');
  console.log('📡 Firebase 프로젝트:', app.options.projectId);
} else {
  console.error('🚨 Firebase 앱이 올바르게 초기화되지 않았습니다. Config를 확인하세요.');
}

let authInstance = null;
let dbInstance = null;
let storageInstance = null;
let analyticsInstance = null;

if (app.options && app.options.projectId) { // Only try to get services if app was initialized
  if (!isServer) { // Client-side initialization
    try {
      authInstance = getAuth(app);
      console.log('🔐 Firebase Auth 인스턴스 (Client): 생성됨');
      
      dbInstance = getFirestore(app);
      console.log('📊 Firebase Firestore 인스턴스 (Client): 생성됨');
      
      storageInstance = getStorage(app);
      console.log('📁 Firebase Storage 인스턴스 (Client): 생성됨');
      
      isAnalyticsSupported().then((supported) => {
        if (supported && firebaseConfig.measurementId) {
          analyticsInstance = getAnalytics(app);
          console.log('📈 Firebase Analytics 인스턴스 (Client): 생성됨');
        } else {
          console.log('📈 Firebase Analytics (Client): 지원되지 않거나 Measurement ID 없음');
        }
      }).catch(err => console.warn('Analytics support check error:', err));

    } catch (error) {
      console.error('❌ Firebase 클라이언트 서비스 초기화 실패:', error);
    }
  } else {
    // Server-side logging for what typically isn't initialized here
    console.log('ℹ️ Firebase 서비스 (Auth, Firestore, Storage, Analytics)는 일반적으로 클라이언트 측에서 초기화됩니다.');
  }
}

export { authInstance as auth, dbInstance as db, storageInstance as storage, analyticsInstance as analytics };
export default app;
