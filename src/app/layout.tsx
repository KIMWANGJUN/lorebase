
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'LOREBASE - 인디 게임 개발자 커뮤니티',
  description: '인디 게임 개발자들을 위한 커뮤니티 플랫폼입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>{/* Added suppressHydrationWarning for next-themes */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Jua (body font), Do Hyeon (headline font), Black Han Sans (logo font) */}
        <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Do+Hyeon&family=Jua&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Sets initial theme to use :root styles (user's dark theme)
          enableSystem={false} // Explicitly manage themes, don't rely on system for now
          disableTransitionOnChange // Prevents style flashing on theme change
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

