// src/app/layout.tsx
"use client";
// Removed Metadata import since it's not usable in a Client Component
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import AuthProvider, { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function AppContent({ children }: { children: ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} isAdmin={isAdmin} logout={logout} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <title>LOREBASE - 인디 게임 개발자 커뮤니티</title>
        <meta name="description" content="인디 게임 개발자들을 위한 커뮤니티 플랫폼입니다." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Do+Hyeon&family=Jua&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {isMounted ? <AppContent>{children}</AppContent> : null}
              <Toaster />
            </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
