
// src/app/signup/page.tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, KeyRound, AtSign, CheckCircle, XCircle } from 'lucide-react';
import type { NewUserDto as SignupUserDto } from '@/types'; // Correctly aliasing NewUserDto
import { validateEmail, validatePassword, validateNickname } from '@/lib/validationRules';
import { mockUsers } from '@/lib/mockData';

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

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);

  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (email) {
      const validationError = validateEmail(email);
      setEmailError(validationError);
      setIsEmailChecked(false);
      setIsEmailAvailable(false);
    } else {
      setEmailError(null);
    }
  }, [email]);

  useEffect(() => {
    if (nickname) {
      setNicknameError(validateNickname(nickname));
      setIsNicknameChecked(false);
      setIsNicknameAvailable(false);
    } else {
      setNicknameError(null);
    }
  }, [nickname]);

  useEffect(() => {
    if (password) {
      setPasswordError(validatePassword(password));
    } else {
      setPasswordError(null);
    }
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError(null);
    }
  }, [password, confirmPassword]);
  
  const handleCheckEmail = () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      toast({ title: "이메일 오류", description: validationError, variant: "destructive" });
      setIsEmailChecked(true);
      setIsEmailAvailable(false);
      return;
    }
    setEmailError(null);
    const isTaken = mockUsers.some(u => u.email?.toLowerCase() === email.toLowerCase());
    if (isTaken) {
      toast({ title: "이메일 중복", description: "이미 사용 중인 이메일입니다.", variant: "destructive" });
      setIsEmailAvailable(false);
    } else {
      toast({ title: "이메일 사용 가능", description: "사용 가능한 이메일입니다." });
      setIsEmailAvailable(true);
    }
    setIsEmailChecked(true);
  };

  const handleCheckNickname = () => {
    const validationError = validateNickname(nickname);
    if (validationError) {
      setNicknameError(validationError);
      toast({ title: "닉네임 오류", description: validationError, variant: "destructive" });
      setIsNicknameChecked(true);
      setIsNicknameAvailable(false);
      return;
    }
    setNicknameError(null);
    const isTaken = mockUsers.some(u => u.nickname.toLowerCase() === nickname.toLowerCase());
    if (isTaken) {
      toast({ title: "닉네임 중복", description: "이미 사용 중인 닉네임입니다.", variant: "destructive" });
      setIsNicknameAvailable(false);
    } else {
      toast({ title: "닉네임 사용 가능", description: "사용 가능한 닉네임입니다." });
      setIsNicknameAvailable(true);
    }
    setIsNicknameChecked(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      return;
    }

    if (!isEmailChecked || !isEmailAvailable) {
      toast({ title: "이메일 확인 필요", description: "이메일 중복 확인을 해주세요.", variant: "destructive" });
      return;
    }
    if (!isNicknameChecked || !isNicknameAvailable) {
      toast({ title: "닉네임 확인 필요", description: "닉네임 중복 확인을 해주세요.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const signupData: SignupUserDto = {
      username: email.trim(), // This will be used as the email for Firebase Auth
      nickname: nickname.trim(),
      password: password,
      email: email.trim(), // Ensure all fields of SignupUserDto are provided
    };

    const result = await signup(signupData);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "회원가입 성공!", description: result.message || "로그인 페이지로 이동합니다." });
      router.push('/login');
    } else {
      toast({ title: "회원가입 실패", description: result.message || "알 수 없는 오류가 발생했습니다.", variant: "destructive" });
      if (result.message?.includes("이메일")) {
        setIsEmailAvailable(false);
        setIsEmailChecked(true);
      }
      if (result.message?.includes("닉네임")) {
        setIsNicknameAvailable(false);
        setIsNicknameChecked(true);
      }
    }
  };
  
  const getFeedbackIcon = (isChecked: boolean, isAvailable: boolean, error: string | null) => {
    if (!isChecked && !error) return null; 
    if (error && (!isChecked || (isChecked && !isAvailable))) return <XCircle className="h-4 w-4 text-destructive" />;
    if (isChecked && isAvailable) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary text-primary-foreground inline-block">
            <UserPlus className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline">회원가입</CardTitle>
          <CardDescription>새로운 계정을 만드세요. 이메일 주소는 로그인 아이디로 사용됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">이메일 <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 pr-8"/>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {getFeedbackIcon(isEmailChecked, isEmailAvailable, emailError)}
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleCheckEmail} disabled={!!validateEmail(email) || email.length === 0} className="shrink-0">중복 확인</Button>
              </div>
              {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
              {!emailError && isEmailChecked && !isEmailAvailable && <p className="mt-1 text-xs text-destructive">이미 사용 중인 이메일입니다.</p>}
            </div>

            <div>
              <Label htmlFor="nickname">닉네임 <span className="text-destructive">*</span></Label>
               <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="nickname" type="text" placeholder="2~14자 한글, 영문, 숫자" value={nickname} onChange={(e) => setNickname(e.target.value)} required className="pl-10 pr-8"/>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                     {getFeedbackIcon(isNicknameChecked, isNicknameAvailable, nicknameError)}
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleCheckNickname} disabled={!!validateNickname(nickname) || nickname.length === 0} className="shrink-0">중복 확인</Button>
              </div>
              {nicknameError && <p className="mt-1 text-xs text-destructive">{nicknameError}</p>}
              {!nicknameError && isNicknameChecked && !isNicknameAvailable && <p className="mt-1 text-xs text-destructive">이미 사용 중인 닉네임입니다.</p>}
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
              disabled={
                isLoading || 
                !!emailError || 
                !!nicknameError || 
                !!passwordError || 
                !!confirmPasswordError ||
                !isEmailChecked || !isEmailAvailable ||
                !isNicknameChecked || !isNicknameAvailable
              }
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

