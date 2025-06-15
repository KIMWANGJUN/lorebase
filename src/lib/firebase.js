// src/lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// TEMPORARY: Hardcoding Firebase config for debugging the API key issue.
// These values are based on the user's provided Firebase console screenshot.
const firebaseConfig = {
  apiKey: "AlzaSyAMoPasnL5uf-_svvROzsUpWCiCfLD1fJU",
  authDomain: "lorebase-a8b3b.firebaseapp.com",
  projectId: "lorebase-a8b3b",
  storageBucket: "lorebase-a8b3b.appspot.com", // Corrected from .firebasestorage.app to .appspot.com if that was a typo. Usually it's projectID.appspot.com
  messagingSenderId: "978818851697",
  appId: "1:978818851697:web:9b100c52d4f976d62a8cd0",
  // measurementId is optional for core services but good to have if Analytics is used.
  // measurementId: "G-BZNR54SCJN" // If you have this, include it.
};

// Log the environment (server/client) and the config being used
const isServer = typeof window === 'undefined';
console.log(`🔍 Firebase 초기화 환경: isServer: ${isServer}, isClient: ${!isServer}`);
console.log('🔧 Firebase Config (Hardcoded for Debug):', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 15)}...` : '❌ 없음',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

let app;
const existingApps = getApps();

if (existingApps.length > 0) {
  app = existingApps[0];
  console.log('🔄 기존 Firebase 앱 사용');
} else {
  app = initializeApp(firebaseConfig);
  console.log('🆕 새로운 Firebase 앱 초기화 (Hardcoded Config)');
}

console.log('✅ Firebase 앱 초기화 성공');
console.log('📡 Firebase 프로젝트:', app.options.projectId);

let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (!isServer) { // Client-side initialization
  try {
    auth = getAuth(app);
    console.log('🔐 Firebase Auth 인스턴스 (Client): 생성됨');
    
    db = getFirestore(app);
    console.log('📊 Firebase Firestore 인스턴스 (Client): 생성됨');
    
    storage = getStorage(app);
    console.log('📁 Firebase Storage 인스턴스 (Client): 생성됨');
    
    isAnalyticsSupported().then((supported) => {
      if (supported && firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
        console.log('📈 Firebase Analytics 인스턴스 (Client): 생성됨');
      } else {
        console.log('📈 Firebase Analytics (Client): 지원되지 않거나 Measurement ID 없음');
      }
    }).catch(err => console.warn('Analytics support check error:', err));

  } catch (error) {
    console.error('❌ Firebase 클라이언트 서비스 초기화 실패:', error);
  }
} else { // Server-side logging for services (they won't be functional for client operations)
  console.log('🔐 Firebase Auth 인스턴스 (Server): getAuth(app)는 클라이언트 전용입니다.');
  console.log('📊 Firebase Firestore 인스턴스 (Server): getFirestore(app)는 클라이언트 전용입니다.');
  console.log('📁 Firebase Storage 인스턴스 (Server): getStorage(app)는 클라이언트 전용입니다.');
  console.log('📈 Firebase Analytics 인스턴스 (Server): getAnalytics(app)는 클라이언트 전용입니다.');
}

export { auth, db, storage, analytics };
export default app;
