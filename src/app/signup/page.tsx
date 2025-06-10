
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
import type { NewUserDto } from '@/lib/mockData';
import { validateUsername, validatePassword, validateNickname } from '@/lib/validationRules';
import { mockUsers } from '@/lib/mockData'; // For client-side duplication check

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);

  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (username) {
      setUsernameError(validateUsername(username));
      setIsUsernameChecked(false); // Reset check status on change
      setIsUsernameAvailable(false);
    } else {
      setUsernameError(null);
    }
  }, [username]);

  useEffect(() => {
    if (nickname) {
      setNicknameError(validateNickname(nickname));
      setIsNicknameChecked(false); // Reset check status on change
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
  
  useEffect(() => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("유효한 이메일 주소를 입력해주세요.");
    } else {
      setEmailError(null);
    }
  }, [email]);


  const handleCheckUsername = () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      toast({ title: "아이디 오류", description: validationError, variant: "destructive" });
      setIsUsernameChecked(true);
      setIsUsernameAvailable(false);
      return;
    }
    setUsernameError(null);
    const isTaken = mockUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (isTaken) {
      toast({ title: "아이디 중복", description: "이미 사용 중인 아이디입니다.", variant: "destructive" });
      setIsUsernameAvailable(false);
    } else {
      toast({ title: "아이디 사용 가능", description: "사용 가능한 아이디입니다." });
      setIsUsernameAvailable(true);
    }
    setIsUsernameChecked(true);
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

    // Final validation check before submission
    const currentUsernameError = validateUsername(username);
    const currentNicknameError = validateNickname(nickname);
    const currentPasswordError = validatePassword(password);
    const currentConfirmPasswordError = (password !== confirmPassword) ? "비밀번호가 일치하지 않습니다." : null;
    const currentEmailError = (email && !/\S+@\S+\.\S+/.test(email)) ? "유효한 이메일 주소를 입력해주세요." : null;

    setUsernameError(currentUsernameError);
    setNicknameError(currentNicknameError);
    setPasswordError(currentPasswordError);
    setConfirmPasswordError(currentConfirmPasswordError);
    setEmailError(currentEmailError);

    if (currentUsernameError || currentNicknameError || currentPasswordError || currentConfirmPasswordError || currentEmailError) {
      toast({ title: "입력 오류", description: "입력 내용을 다시 확인해주세요.", variant: "destructive" });
      return;
    }

    if (!isUsernameChecked || !isUsernameAvailable) {
      toast({ title: "아이디 확인 필요", description: "아이디 중복 확인을 해주세요.", variant: "destructive" });
      return;
    }
    if (!isNicknameChecked || !isNicknameAvailable) {
      toast({ title: "닉네임 확인 필요", description: "닉네임 중복 확인을 해주세요.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const signupData: NewUserDto = {
      username: username.trim(),
      nickname: nickname.trim(),
      email: email.trim() || undefined,
      password: password,
    };

    const result = await signup(signupData);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "회원가입 성공!", description: "로그인 페이지로 이동합니다. 가입하신 정보로 로그인해주세요." });
      router.push('/login');
    } else {
      toast({ title: "회원가입 실패", description: result.message || "알 수 없는 오류가 발생했습니다.", variant: "destructive" });
      // Handle server-side duplication if not caught by client-side check (though less likely with mockData)
      if (result.message?.includes("아이디")) {
        setIsUsernameAvailable(false);
        setIsUsernameChecked(true); // Mark as checked, but unavailable
      }
      if (result.message?.includes("닉네임")) {
        setIsNicknameAvailable(false);
        setIsNicknameChecked(true); // Mark as checked, but unavailable
      }
    }
  };
  
  const getFeedbackIcon = (isChecked: boolean, isAvailable: boolean, error: string | null) => {
    if (!isChecked && !error) return null; // Not checked, no initial error
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
          <CardDescription>새로운 계정을 만드세요. 규칙을 확인해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="username">아이디 <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="username" type="text" placeholder="5~20자 영문 소문자, 숫자, _, -" value={username} onChange={(e) => setUsername(e.target.value)} required className="pl-10 pr-8"/>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {getFeedbackIcon(isUsernameChecked, isUsernameAvailable, usernameError)}
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleCheckUsername} disabled={!!validateUsername(username) || usernameError === "아이디를 입력해주세요."} className="shrink-0">중복 확인</Button>
              </div>
              {usernameError && <p className="mt-1 text-xs text-destructive">{usernameError}</p>}
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
                <Button type="button" variant="outline" size="sm" onClick={handleCheckNickname} disabled={!!validateNickname(nickname) || nicknameError === "닉네임을 입력해주세요."} className="shrink-0">중복 확인</Button>
              </div>
              {nicknameError && <p className="mt-1 text-xs text-destructive">{nicknameError}</p>}
            </div>

             <div>
              <Label htmlFor="email">이메일 (선택)</Label>
               <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="이메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10"/>
              </div>
              {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
            </div>

            <div>
              <Label htmlFor="password">비밀번호 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="8~16자 영문 대소문자, 숫자, 특수문자 조합" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10"/>
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
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground mt-4" 
              disabled={
                isLoading || 
                !!usernameError || 
                !!nicknameError || 
                !!passwordError || 
                !!confirmPasswordError ||
                !!emailError ||
                !isUsernameChecked || !isUsernameAvailable ||
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
