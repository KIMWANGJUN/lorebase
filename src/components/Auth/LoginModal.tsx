
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Firebase 설정 파일 경로 확인 필요

// 기본적인 모달 UI를 포함하여 로그인/회원가입 폼을 렌더링합니다.
// 실제 UI 디자인은 필요에 따라 추가/수정해야 합니다.
export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null); // 오류 메시지 상태 추가

  if (!isOpen) {
    return null; // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // 시도 전에 오류 초기화
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('회원가입 성공! 로그인해주세요.'); // 간단한 성공 알림
        setIsSignUp(false); // 회원가입 성공 후 로그인 폼으로 전환
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onClose(); // 로그인 성공 시 모달 닫기
      }
    } catch (err) {
      console.error('인증 오류:', err);
      // 사용자에게 더 친절한 오류 메시지 표시
      if (err.code === 'auth/user-not-found') {
        setError('사용자를 찾을 수 없습니다.');
      } else if (err.code === 'auth/wrong-password') {
        setError('비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 6자 이상이어야 합니다.');
      }
       else {
        setError('로그인 또는 회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000, // 다른 요소 위에 표시
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        minWidth: '300px',
        textAlign: 'center',
        position: 'relative', // 닫기 버튼 배치를 위해 추가
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.2em',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>
        <h2>{isSignUp ? '회원가입' : '로그인'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>이메일:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>} {/* 오류 메시지 표시 */}
          <button type="submit" style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em',
          }}>
            {isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            marginTop: '15px',
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '0.9em',
          }}
        >
          {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
        </button>
      </div>
    </div>
  );
}
