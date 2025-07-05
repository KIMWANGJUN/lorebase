
import { db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { TwoFactorSetupResult, TwoFactorVerifyResult } from '@/types';

/**
 * Initiates the 2FA setup process.
 * In a real app, this would integrate with a service like Authy/Google Authenticator
 * to generate a secret and a QR code URL.
 * This mock will simulate a successful start.
 */
export async function setupTwoFactorAuth(userId: string, email: string): Promise<TwoFactorSetupResult> {
  try {
    // This part is highly dependent on the chosen 2FA provider.
    // We are simulating that the setup process has begun successfully.
    console.log(`2FA setup initiated for user ${userId} via email ${email}.`);
    return {
      success: true,
      message: "2차 인증 설정이 시작되었습니다. 이메일의 안내를 따라주세요.",
    };
  } catch (error) {
    console.error("Error setting up two-factor auth:", error);
    return { success: false, message: "2차 인증 설정 시작에 실패했습니다." };
  }
}

/**
 * Verifies the 2FA code and enables 2FA for the user.
 * This would typically involve validating a TOTP code against a user's secret.
 */
export async function verifyTwoFactorCode(userId: string, code: string): Promise<TwoFactorVerifyResult> {
  try {
    // A real implementation would verify the code against the secret.
    // For now, we'll accept a "valid" mock code.
    if (code === "123456") { // Still a mock, but represents a successful verification
      await updateDoc(doc(db, 'users', userId), {
        twoFactorEnabled: true,
        updatedAt: serverTimestamp()
      });
      return { success: true, message: "2차 인증이 성공적으로 활성화되었습니다." };
    } else {
      return { success: false, message: "인증 코드가 올바르지 않습니다." };
    }
  } catch (error) {
    console.error("Error verifying two-factor code:", error);
    return { success: false, message: "인증 과정 중 오류가 발생했습니다." };
  }
}

/**
 * Disables 2FA for the user.
 */
export async function disableTwoFactorAuth(userId: string): Promise<TwoFactorVerifyResult> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      twoFactorEnabled: false,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: "2차 인증이 비활성화되었습니다." };
  } catch (error) {
    console.error("Error disabling two-factor auth:", error);
    return { success: false, message: "2차 인증 비활성화에 실패했습니다." };
  }
}
