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

// 하드코딩 Firebase 설정 (Firebase Studio 환경용)
const hardcodedConfig = {
  apiKey: "AlzaSyAMoPasnL5uf_syvROzsUpWCiCfLD1fJU",
  authDomain: "lorebase-a8b3b.firebaseapp.com",
  projectId: "lorebase-a8b3b",
  storageBucket: "lorebase-a8b3b.appspot.com",
  messagingSenderId: "978818851697",
  appId: "1:978818851697:web:9b100c52d4f976d62a8cd0"
};

// 환경변수 안전하게 가져오기
const getEnvVar = (key) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    return undefined;
  } catch (error) {
    console.warn(`환경변수 ${key} 접근 실패:`, error);
    return undefined;
  }
};

// Firebase 설정 - 환경변수 우선, 실패시 하드코딩 사용
const firebaseConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY') || hardcodedConfig.apiKey,
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || hardcodedConfig.authDomain,
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || hardcodedConfig.projectId,
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || hardcodedConfig.storageBucket,
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || hardcodedConfig.messagingSenderId,
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID') || hardcodedConfig.appId
};

// Firebase 앱 초기화
let app;

try {
  console.log('🔧 Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 15)}...` : '❌ 없음',
    projectId: firebaseConfig.projectId
  });

  const existingApps = getApps();
  
  if (existingApps.length > 0) {
    console.log('🔄 기존 Firebase 앱 감지');
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
    console.log('🆕 새로운 Firebase 앱 초기화');
  }

  console.log('✅ Firebase 앱 초기화 성공');

} catch (error) {
  console.error('❌ Firebase 앱 초기화 실패:', error);
  
  // 최후의 수단: 하드코딩으로 강제 초기화
  try {
    console.log('🚨 하드코딩 설정으로 강제 초기화 시도');
    app = initializeApp(hardcodedConfig);
    console.log('✅ 하드코딩 초기화 성공');
  } catch (hardcodedError) {
    console.error('💥 모든 초기화 방법 실패:', hardcodedError);
    throw new Error('Firebase 초기화 완전 실패');
  }
}

// Firebase 서비스 초기화 - 항상 객체 반환 (null 방지)
let authInstance = null;
let dbInstance = null;
let storageInstance = null;

if (isClient && app) {
  try {
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
    
    console.log('🔐 Auth 서비스:', authInstance ? '✅ 초기화됨' : '❌ 실패');
    console.log('📊 Firestore 서비스:', dbInstance ? '✅ 초기화됨' : '❌ 실패');
    console.log('📁 Storage 서비스:', storageInstance ? '✅ 초기화됨' : '❌ 실패');
    
  } catch (serviceError) {
    console.error('❌ Firebase 서비스 초기화 실패:', serviceError);
  }
}

// 디버그 객체 생성 (항상 생성)
if (isClient) {
  window.firebaseDebug = {
    app: app,
    auth: authInstance,
    db: dbInstance,
    storage: storageInstance,
    config: firebaseConfig,
    isFirebaseStudio: isFirebaseStudio,
    
    test: () => {
      console.log('🔧 Firebase 디버그 정보:');
      console.table({
        'App 상태': window.firebaseDebug.app ? '✅ 정상' : '❌ 실패',
        'Auth 상태': window.firebaseDebug.auth ? '✅ 정상' : '❌ 실패',
        'Firestore 상태': window.firebaseDebug.db ? '✅ 정상' : '❌ 실패',
        'Storage 상태': window.firebaseDebug.storage ? '✅ 정상' : '❌ 실패',
        '프로젝트 ID': window.firebaseDebug.app?.options?.projectId
      });
    }
  };
  
  console.log('🔧 window.firebaseDebug 객체 생성 완료');
}

// 안전한 export (검색 결과 [5], [6]에서 확인된 패턴)
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export default app;
