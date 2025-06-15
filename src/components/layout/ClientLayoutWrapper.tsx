// src/components/layout/ClientLayoutWrapper.tsx
"use client";

import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";

// 검색 결과 [4]에서 확인된 SSR 비활성화 패턴
const DynamicAuthProvider = dynamic(
  () => import('@/contexts/AuthContext'),
  { 
    ssr: false,
    loading: () => null // 로딩 컴포넌트 제거로 하이드레이션 불일치 방지
  }
);

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

// 검색 결과 [3]에서 확인된 하이드레이션 해결 패턴
export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  // 검색 결과 [4]의 useEffect 패턴 적용
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 검색 결과 [3]에서 확인된 클라이언트 전용 렌더링
  if (!isClient) {
    return (
      <html lang="ko" suppressHydrationWarning>
        <body className="font-body antialiased">
          <div className="flex items-center justify-center min-h-screen">
            <div>Loading...</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <DynamicAuthProvider>
        {children}
        <Toaster />
      </DynamicAuthProvider>
    </ThemeProvider>
  );
}
