import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 환경변수 유효성 검증 함수
const validateFirebaseConfig = () => {
  const requiredVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  const missing = [];
  const invalid = [];

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missing.push(key);
    } else if (value.includes('undefined') || value.length < 10) {
      invalid.push(`${key}: ${value}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`❌ 누락된 Firebase 환경변수: ${missing.join(', ')}`);
  }

  if (invalid.length > 0) {
    throw new Error(`❌ 유효하지 않은 Firebase 환경변수: ${invalid.join(', ')}`);
  }

  return requiredVars;
};

// 환경변수 검증 실행
let validatedConfig;
try {
  validatedConfig = validateFirebaseConfig();
  console.log('🔍 Firebase 환경변수 검증 완료');
} catch (error) {
  console.error('🚨 Firebase 환경변수 오류:', error.message);
  throw error;
}

const firebaseConfig = {
  apiKey: validatedConfig['NEXT_PUBLIC_FIREBASE_API_KEY'],
  authDomain: validatedConfig['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  projectId: validatedConfig['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket: validatedConfig['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: validatedConfig['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId: validatedConfig['NEXT_PUBLIC_FIREBASE_APP_ID']
};

// 상세한 환경변수 로딩 확인
console.log('🔧 Firebase Config 확인:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 15)}...` : '❌ 없음',
  authDomain: firebaseConfig.authDomain || '❌ 없음',
  projectId: firebaseConfig.projectId || '❌ 없음',
  storageBucket: firebaseConfig.storageBucket || '❌ 없음',
  messagingSenderId: firebaseConfig.messagingSenderId || '❌ 없음',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : '❌ 없음'
});

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase 초기화 성공');
  console.log('📡 Firebase 프로젝트:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  console.error('🔧 설정 확인 사항:');
  console.error('1. .env.local 파일이 프로젝트 루트에 있는지 확인');
  console.error('2. 모든 NEXT_PUBLIC_ 접두사가 정확한지 확인');
  console.error('3. API 키에 따옴표가 없는지 확인');
  console.error('4. 개발 서버를 재시작했는지 확인');
  throw new Error(`Firebase 설정 오류: ${error.message}`);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase 인스턴스 검증
try {
  console.log('🔐 Firebase Auth 인스턴스:', auth ? '생성됨' : '생성 실패');
  console.log('📊 Firebase Firestore 인스턴스:', db ? '생성됨' : '생성 실패');
  console.log('📁 Firebase Storage 인스턴스:', storage ? '생성됨' : '생성 실패');
} catch (error) {
  console.error('❌ Firebase 서비스 인스턴스 생성 실패:', error);
}

export default app;
