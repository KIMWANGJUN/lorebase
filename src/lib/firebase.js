// src/lib/firebase.js
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// SSR 환경 감지
const isServer = typeof window === 'undefined';
const isClient = typeof window !== 'undefined';

// Firebase Studio 환경 감지
const isFirebaseStudio = isClient && 
  (window.location.hostname.includes('firebase-studio') ||
   window.location.hostname.includes('cloudworkstations.dev'));

console.log('🔍 Firebase 초기화 환경:');
console.log('- isServer:', isServer);
console.log('- isClient:', isClient);
console.log('- isFirebaseStudio:', isFirebaseStudio);

// 하드코딩 Firebase 설정 (대체용)
const hardcodedConfig = {
  apiKey: "YOUR_FALLBACK_API_KEY_IF_NEEDED", // 실제 키로 교체하거나, 환경변수가 항상 제공되도록 보장
  authDomain: "YOUR_FALLBACK_AUTH_DOMAIN",
  projectId: "YOUR_FALLBACK_PROJECT_ID",
  storageBucket: "YOUR_FALLBACK_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FALLBACK_MESSAGING_SENDER_ID",
  appId: "YOUR_FALLBACK_APP_ID"
};

// 환경변수 안전하게 가져오기
const getEnvVar = (key, fallbackValue = null) => {
  try {
    const value = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    return value || fallbackValue;
  } catch (error) {
    console.warn(`환경변수 ${key} 접근 실패:`, error);
    return fallbackValue;
  }
};

// Firebase 설정 - 환경변수 우선, 실패시 하드코딩 또는 null 사용
const firebaseConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY', hardcodedConfig.apiKey),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', hardcodedConfig.authDomain),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', hardcodedConfig.projectId),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', hardcodedConfig.storageBucket),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', hardcodedConfig.messagingSenderId),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID', hardcodedConfig.appId)
};

console.log('🔧 Firebase Config 확인:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 15)}...` : '❌ 없음',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0,20)}...` : '❌ 없음',
});

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase 설정 오류: API 키 또는 Project ID가 누락되었습니다. .env.local 파일을 확인하세요.');
}

// Firebase 앱 초기화
let app;
let auth = null; // auth 변수 초기화
let db = null;
let storage = null;

try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('🔄 기존 Firebase 앱 사용');
  } else {
    app = initializeApp(firebaseConfig);
    console.log('🆕 새로운 Firebase 앱 초기화');
  }
  console.log('✅ Firebase 앱 초기화 성공');
  console.log('📡 Firebase 프로젝트:', app.options.projectId);

  if (isClient && app) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('🔐 Firebase Auth 인스턴스:', auth ? '생성됨' : '❌ 실패');
    console.log('📊 Firebase Firestore 인스턴스:', db ? '생성됨' : '❌ 실패');
    console.log('📁 Firebase Storage 인스턴스:', storage ? '생성됨' : '❌ 실패');
  } else if (isServer) {
    console.log('ℹ️  서버 환경에서는 Firebase client SDK 서비스(Auth, Firestore, Storage)를 초기화하지 않습니다.');
  }

} catch (error) {
  console.error('❌ Firebase 앱 또는 서비스 초기화 실패:', error);
  if (error.message.includes('Firebase App named \'[DEFAULT]\' already exists')) {
    // This case should be handled by getApps(), but as a fallback.
    app = getApps()[0];
    if (isClient && app) {
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    }
  } else {
    // 다른 초기화 오류는 여기서 처리
    console.error("Firebase 초기화에 심각한 문제가 발생했습니다. 앱이 정상적으로 동작하지 않을 수 있습니다.");
  }
}

// 디버그 객체 생성
if (isClient) {
  window.firebaseDebug = {
    app: app,
    auth: auth,
    db: db,
    storage: storage,
    config: firebaseConfig,
    isFirebaseStudio: isFirebaseStudio,
    test: () => {
      console.log('🔧 Firebase 디버그 정보:');
      console.table({
        'App 상태': window.firebaseDebug.app ? '✅ 정상' : '❌ 실패',
        'Auth 상태': window.firebaseDebug.auth ? '✅ 정상' : '❌ 실패',
        'Firestore 상태': window.firebaseDebug.db ? '✅ 정상' : '❌ 실패',
        'Storage 상태': window.firebaseDebug.storage ? '✅ 정상' : '❌ 실패',
        'Config Project ID': window.firebaseDebug.config?.projectId,
        'App Options Project ID': window.firebaseDebug.app?.options?.projectId,
        'Config API Key': window.firebaseDebug.config?.apiKey ? '설정됨' : '❌ 없음',
        'Auth API Key': window.firebaseDebug.auth?.app?.options?.apiKey ? '설정됨' : '❌ 없음',
      });
    }
  };
  console.log('🔧 window.firebaseDebug 객체 생성 완료. 콘솔에서 window.firebaseDebug.test() 실행 가능');
}

export { app, auth, db, storage };
export default app; // 기본 export로 app 유지
