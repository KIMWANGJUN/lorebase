// src/lib/twoFactorAuth.ts
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import type { User } from '@/types';

// 6자리 인증 코드 생성
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 이메일로 인증 코드 전송 (Firebase Functions 또는 서드파티 이메일 서비스 사용)
export const sendVerificationEmail = async (email: string, code: string, purpose: 'setup' | 'login' = 'setup'): Promise<boolean> => {
  try {
    // 실제 구현에서는 Firebase Functions나 SendGrid, Nodemailer 등을 사용
    // 여기서는 시뮬레이션을 위해 console.log 사용
    console.log(`[이메일 발송 시뮬레이션]`);
    console.log(`받는이: ${email}`);
    console.log(`목적: ${purpose === 'setup' ? '2차 인증 설정' : '로그인 인증'}`);
    console.log(`인증 코드: ${code}`);
    console.log(`유효시간: 5분`);
    
    // 실제 환경에서는 이 부분을 실제 이메일 발송 로직으로 교체
    // await sendEmailViaSendGrid(email, code, purpose);
    // 또는
    // await callFirebaseFunction('sendVerificationEmail', { email, code, purpose });
    
    return true;
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    return false;
  }
};

// 2차 인증 설정 시작
export const setupTwoFactorAuth = async (userId: string, email: string): Promise<{ success: boolean; message: string; code?: string }> => {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다.');
    }

    const verificationCode = generateVerificationCode();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

    // Firestore에 임시 인증 코드 저장
    await updateDoc(doc(db, 'users', userId), {
      twoFactorSecret: verificationCode,
      twoFactorCodeExpiry: expiryTime,
      pendingEmailVerification: email,
      updatedAt: new Date()
    });

    // 이메일 발송
    const emailSent = await sendVerificationEmail(email, verificationCode, 'setup');
    
    if (!emailSent) {
      throw new Error('인증 코드 이메일 발송에 실패했습니다.');
    }

    return {
      success: true,
      message: '인증 코드가 이메일로 전송되었습니다. 5분 내에 입력해주세요.',
      code: verificationCode // 개발 환경에서만 반환 (실제 배포시 제거)
    };
  } catch (error: any) {
    console.error('2차 인증 설정 실패:', error);
    return {
      success: false,
      message: error.message || '2차 인증 설정에 실패했습니다.'
    };
  }
};

// 2차 인증 코드 확인
export const verifyTwoFactorCode = async (userId: string, inputCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다.');
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();
    const storedCode = userData.twoFactorSecret;
    const expiryTime = userData.twoFactorCodeExpiry?.toDate();

    if (!storedCode) {
      throw new Error('인증 코드가 설정되지 않았습니다.');
    }

    if (expiryTime && new Date() > expiryTime) {
      throw new Error('인증 코드가 만료되었습니다. 다시 요청해주세요.');
    }

    if (storedCode !== inputCode) {
      throw new Error('인증 코드가 올바르지 않습니다.');
    }

    // 인증 성공 - 2차 인증 활성화
    await updateDoc(doc(db, 'users', userId), {
      twoFactorEnabled: true,
      twoFactorVerifiedAt: new Date(),
      twoFactorSecret: null, // 일회용 코드 삭제
      twoFactorCodeExpiry: null,
      pendingEmailVerification: null,
      updatedAt: new Date()
    });

    return {
      success: true,
      message: '2차 인증이 성공적으로 활성화되었습니다.'
    };
  } catch (error: any) {
    console.error('2차 인증 코드 확인 실패:', error);
    return {
      success: false,
      message: error.message || '인증 코드 확인에 실패했습니다.'
    };
  }
};

// 로그인시 2차 인증 코드 전송
export const sendLoginVerificationCode = async (email: string): Promise<{ success: boolean; message: string; code?: string }> => {
  try {
    const verificationCode = generateVerificationCode();
    
    // 실제 환경에서는 Redis나 임시 저장소에 저장
    // 여기서는 localStorage 시뮬레이션 (실제로는 서버 세션이나 Redis 사용)
    const loginVerificationData = {
      code: verificationCode,
      email: email,
      expiry: Date.now() + 5 * 60 * 1000, // 5분
      timestamp: Date.now()
    };
    
    // 실제 구현에서는 서버에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('loginVerification', JSON.stringify(loginVerificationData));
    }

    const emailSent = await sendVerificationEmail(email, verificationCode, 'login');
    
    if (!emailSent) {
      throw new Error('인증 코드 이메일 발송에 실패했습니다.');
    }

    return {
      success: true,
      message: '로그인 인증 코드가 이메일로 전송되었습니다.',
      code: verificationCode // 개발 환경에서만 반환
    };
  } catch (error: any) {
    console.error('로그인 인증 코드 전송 실패:', error);
    return {
      success: false,
      message: error.message || '인증 코드 전송에 실패했습니다.'
    };
  }
};

// 로그인시 2차 인증 코드 확인
export const verifyLoginCode = async (email: string, inputCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 실제 환경에서는 서버에서 확인
    if (typeof window === 'undefined') {
      throw new Error('클라이언트 환경이 아닙니다.');
    }

    const storedData = localStorage.getItem('loginVerification');
    if (!storedData) {
      throw new Error('인증 코드가 요청되지 않았습니다.');
    }

    const loginVerificationData = JSON.parse(storedData);
    
    if (Date.now() > loginVerificationData.expiry) {
      localStorage.removeItem('loginVerification');
      throw new Error('인증 코드가 만료되었습니다. 다시 로그인해주세요.');
    }

    if (loginVerificationData.email !== email) {
      throw new Error('이메일이 일치하지 않습니다.');
    }

    if (loginVerificationData.code !== inputCode) {
      throw new Error('인증 코드가 올바르지 않습니다.');
    }

    // 인증 성공
    localStorage.removeItem('loginVerification');
    
    return {
      success: true,
      message: '2차 인증이 완료되었습니다.'
    };
  } catch (error: any) {
    console.error('로그인 인증 코드 확인 실패:', error);
    return {
      success: false,
      message: error.message || '인증 코드 확인에 실패했습니다.'
    };
  }
};

// 2차 인증 비활성화
export const disableTwoFactorAuth = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다.');
    }

    await updateDoc(doc(db, 'users', userId), {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorVerifiedAt: null,
      twoFactorCodeExpiry: null,
      pendingEmailVerification: null,
      updatedAt: new Date()
    });

    return {
      success: true,
      message: '2차 인증이 비활성화되었습니다.'
    };
  } catch (error: any) {
    console.error('2차 인증 비활성화 실패:', error);
    return {
      success: false,
      message: error.message || '2차 인증 비활성화에 실패했습니다.'
    };
  }
};
