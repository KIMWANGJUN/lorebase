// src/app/login/page.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, KeyRound } from 'lucide-react';
import { auth } from '@/lib/firebase'; // Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Ensure auth is available at the time of the call
    if (!auth) {
      console.error("Login attempt failed: Firebase auth service is not available.");
      toast({
        title: "로그인 실패",
        description: "인증 서비스를 현재 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log(`Attempting login for email: ${email} with auth instance: ${auth?.app?.name}`);
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "로그인 성공", description: "커뮤니티에 오신 것을 환영합니다!" });
      router.push('/'); 
    } catch (error: any) {
      console.error("Firebase email login error:", error.code, error.message); 
      let errorMessage = "아이디 또는 비밀번호를 확인해주세요."; 
      
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential') {
        errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "유효하지 않은 이메일 형식입니다.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
      } else if (error.message?.includes('Firebase authentication이 초기화되지 않았습니다')) {
        errorMessage = "시스템 오류가 발생했습니다. 페이지를 새로고침해주세요.";
      }
      
      toast({ title: "로그인 실패", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof window !== 'undefined' && !auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground">Firebase 인증 서비스를 초기화하는 중입니다...</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              페이지 새로고침
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary text-primary-foreground inline-block">
            <LogIn className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline">로그인</CardTitle>
          <CardDescription>커뮤니티 계정으로 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 (아이디)</Label> 
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email"
                  placeholder="이메일 주소를 입력하세요" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="비밀번호를 입력하세요" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground" 
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 mt-6">
          <p className="text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/signup">회원가입</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
