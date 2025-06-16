// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

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

// Fallback for IDE environment if .env.local is not loaded
if (!firebaseConfig.apiKey && typeof window !== 'undefined') {
  console.log('📝 .env.local 로드 실패. 하드코딩 값으로 대체.');
  Object.assign(firebaseConfig, {
    apiKey: "AIzaSyAMoPasnL5uf-_svvROzsUpWCiCfLD1fJU",
    authDomain: "lorebase-a8b3b.firebaseapp.com",
    projectId: "lorebase-a8b3b",
    storageBucket: "lorebase-a8b3b.firebasestorage.app",
    messagingSenderId: "978818851697",
    appId: "1:978818851697:web:9b100c52d4f976d62a8cd0",
    measurementId: "G-BZNR54SCJN"
  });
}

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

let app: FirebaseApp;
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
    app = { options: {} } as FirebaseApp; // Dummy app object to prevent further crashes
  }
}

if (app.options && app.options.projectId) {
  console.log('✅ Firebase 앱 초기화 성공');
  console.log('📡 Firebase 프로젝트:', app.options.projectId);
} else {
  console.error('🚨 Firebase 앱이 올바르게 초기화되지 않았습니다. Config를 확인하세요.');
}

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let analyticsInstance: Analytics | null = null;

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
    console.log('ℹ️ Firebase 서비스 (Auth, Firestore, Storage, Analytics)는 일반적으로 클라이언트 측에서 초기화됩니다.');
  }
}

export { authInstance as auth, dbInstance as db, storageInstance as storage, analyticsInstance as analytics };
export default app;
