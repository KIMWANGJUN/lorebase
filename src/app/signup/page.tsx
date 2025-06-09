
// src/app/signup/page.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, KeyRound, AtSign } from 'lucide-react';
import type { NewUserDto } from '@/lib/mockData'; // Import the DTO type

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth(); // Get signup function from context
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !nickname.trim() || !password) {
      toast({ title: "오류", description: "아이디, 닉네임, 비밀번호는 필수입니다.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "오류", description: "비밀번호가 일치하지 않습니다.", variant: "destructive" });
      return;
    }
    // Basic validation for email if provided
    if (email && !/\S+@\S+\.\S+/.test(email)) {
        toast({ title: "오류", description: "유효한 이메일 주소를 입력해주세요.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    
    const signupData: NewUserDto = {
      username: username.trim(),
      nickname: nickname.trim(),
      email: email.trim() || undefined, // Send undefined if empty
      password: password, // Password will be handled by auth context / mockData
    };

    const result = await signup(signupData);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "회원가입 성공!", description: "로그인 페이지로 이동합니다. 가입하신 정보로 로그인해주세요." });
      router.push('/login');
    } else {
      toast({ title: "회원가입 실패", description: result.message || "알 수 없는 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary text-primary-foreground inline-block">
            <UserPlus className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline">회원가입</CardTitle>
          <CardDescription>새로운 계정을 만드세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">아이디 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="username" type="text" placeholder="사용할 아이디" value={username} onChange={(e) => setUsername(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div>
              <Label htmlFor="nickname">닉네임 <span className="text-destructive">*</span></Label>
               <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="nickname" type="text" placeholder="사용할 닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} required className="pl-10"/>
              </div>
            </div>
             <div>
              <Label htmlFor="email">이메일 (선택)</Label>
               <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="이메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10"/>
              </div>
            </div>
            <div>
              <Label htmlFor="password">비밀번호 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground" disabled={isLoading}>
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/login">로그인</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

