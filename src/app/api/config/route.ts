
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// 서비스 계정 키를 환경 변수에서 읽어와 초기화합니다.
// Vercel/IDX 환경 변수에 'SERVICE_ACCOUNT_KEY_BASE64'라는 이름으로 
// serviceAccountKey.json 파일의 내용을 Base64 인코딩하여 저장해야 합니다.
try {
  if (!admin.apps.length) {
    const serviceAccountKeyBase64 = process.env.SERVICE_ACCOUNT_KEY_BASE64;
    if (!serviceAccountKeyBase64) {
      throw new Error('SERVICE_ACCOUNT_KEY_BASE64 환경 변수가 설정되지 않았습니다.');
    }
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Firebase Admin SDK 초기화 실패:', error);
}

// 기존 GET 요청 핸들러
export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}

// 관리자 권한 확인을 위한 POST 요청 핸들러
export async function POST(request: Request) {
  if (!admin.apps.length) {
    return NextResponse.json({ error: '서버 설정 오류. 관리자에게 문의하세요.' }, { status: 500 });
  }

  try {
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: '사용자 UID가 필요합니다.' }, { status: 400 });
    }

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ isAdmin: false, message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;

    return NextResponse.json({ isAdmin });

  } catch (error) {
    console.error('관리자 권한 확인 중 오류 발생:', error);
    return NextResponse.json({ error: '내부 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
