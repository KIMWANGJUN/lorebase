
// src/app/signup/page.tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, KeyRound, AtSign, CheckCircle, XCircle } from 'lucide-react';
import type { NewUserDto as SignupUserDto } from '@/types';
import { validateEmail, validatePassword, validateNickname } from '@/lib/validationRules';

// In a real application, you would have API endpoints to check for email/nickname availability
// e.g., import { checkEmailAvailability, checkNicknameAvailability } from '@/lib/userApi';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // These states are now controlled by the result of the API call in `signup`
  const [isEmailAvailable, setIsEmailAvailable] = useState(true);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(true);

  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (email) setEmailError(validateEmail(email));
    else setEmailError(null);
  }, [email]);

  useEffect(() => {
    if (nickname) setNicknameError(validateNickname(nickname));
    else setNicknameError(null);
  }, [nickname]);

  useEffect(() => {
    if (password) setPasswordError(validatePassword(password));
    else setPasswordError(null);
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError(null);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Reset availability errors before submission
    setIsEmailAvailable(true);
    setIsNicknameAvailable(true);

    const currentEmailError = validateEmail(email);
    const currentNicknameError = validateNickname(nickname);
    const currentPasswordError = validatePassword(password);
    const currentConfirmPasswordError = (password !== confirmPassword) ? "비밀번호가 일치하지 않습니다." : null;

    setEmailError(currentEmailError);
    setNicknameError(currentNicknameError);
    setPasswordError(currentPasswordError);
    setConfirmPasswordError(currentConfirmPasswordError);

    if (currentEmailError || currentNicknameError || currentPasswordError || currentConfirmPasswordError) {
      toast({ title: "입력 오류", description: "입력 내용을 다시 확인해주세요.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const signupData: SignupUserDto = {
      username: email.trim(),
      nickname: nickname.trim(),
      password: password,
      email: email.trim(),
    };

    const result = await signup(signupData);
    
    if (result.success) {
      toast({ title: "회원가입 성공!", description: result.message || "로그인 페이지로 이동합니다." });
      router.push('/login');
    } else {
      toast({ title: "회원가입 실패", description: result.message || "알 수 없는 오류가 발생했습니다.", variant: "destructive" });
      if (result.message?.includes("이메일")) {
        setIsEmailAvailable(false);
      }
      if (result.message?.includes("닉네임")) {
        setIsNicknameAvailable(false);
      }
    }
    setIsLoading(false);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-lg shadow-2xl">
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
              <Label htmlFor="email">이메일 <span className="text-destructive">*</span></Label>
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10"/>
              </div>
              {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
              {!isEmailAvailable && <p className="mt-1 text-xs text-destructive">이미 사용 중인 이메일입니다.</p>}
            </div>

            <div>
              <Label htmlFor="nickname">닉네임 <span className="text-destructive">*</span></Label>
               <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="nickname" type="text" placeholder="2~14자 한글, 영문, 숫자" value={nickname} onChange={(e) => setNickname(e.target.value)} required className="pl-10"/>
              </div>
              {nicknameError && <p className="mt-1 text-xs text-destructive">{nicknameError}</p>}
              {!isNicknameAvailable && <p className="mt-1 text-xs text-destructive">이미 사용 중인 닉네임입니다.</p>}
            </div>

            <div>
              <Label htmlFor="password">비밀번호 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="8~16자 영문 대/소문자, 숫자, 특수문자 조합" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10"/>
              </div>
              {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="비밀번호 다시 입력" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10"/>
              </div>
              {confirmPasswordError && <p className="mt-1 text-xs text-destructive">{confirmPasswordError}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground mt-6"
              disabled={isLoading || !!emailError || !!nicknameError || !!passwordError || !!confirmPasswordError}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
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
