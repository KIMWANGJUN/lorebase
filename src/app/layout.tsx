// src/app/layout.tsx
"use client";
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/overlay/toaster";
import AuthProvider, { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { ThemeCustomizationProvider } from '@/contexts/ThemeCustomizationContext';

// This new component, AppShell, will handle both client mounting and auth loading states
// to prevent hydration errors and ensure a smooth loading experience.
function AppShell({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render a consistent loading indicator on the server, and on the client
  // before the component is mounted or while authentication is in progress.
  // This prevents the "mismatch" error that was likely crashing the server.
  if (!isMounted || authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Once the client has mounted and authentication is complete, render the actual application layout.
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <ThemeCustomizationProvider>
              <AppShell>{children}</AppShell>
            </ThemeCustomizationProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
