
// src/app/login/page.tsx
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
import { LogIn, Mail, KeyRound, UserPlus } from 'lucide-react';

// Placeholder icons for social login
const GoogleIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.03v2.79h5.32c-.46 1.65-1.96 2.93-3.98 2.93-2.48 0-4.5-2.01-4.5-4.49s2.02-4.49 4.5-4.49c1.21 0 2.26.44 3.08 1.16l2.13-2.13C15.41 4.46 13.54 3.5 11.32 3.5 7.06 3.5 3.5 7.06 3.5 11.32s3.56 7.82 7.82 7.82c4.07 0 7.49-3.16 7.49-7.49 0-.61-.07-1.21-.19-1.75z"></path></svg>;
const NaverIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#03C75A" d="M16.273 12.845L12.54 7.155H7.045v9.69h5.768l3.733-5.69zM7.045 4.5h9.91v2.655h-4.23L8.502 11.73H7.045V4.5zm0 15h9.91V16.87h-4.23l-4.228-4.575H7.045v7.19z"></path></svg>;
const KakaoIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#FFEB00" d="M12 2C6.48 2 2 5.89 2 10.49c0 2.83 1.71 5.31 4.31 6.78-.19.98-.71 3.42-1.14 4.47-.09.24.06.5.3.59.08.03.16.04.24.04.16 0 .31-.06.43-.18 1.87-1.41 3.29-2.78 4.07-3.68C10.99 18.91 11.5 19 12 19c5.52 0 10-3.89 10-8.51S17.52 2 12 2z"></path></svg>;


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Removed socialLogin for now to simplify, will use login
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password); // Standard login
    setIsLoading(false);
    if (success) {
      toast({ title: "로그인 성공", description: "커뮤니티에 오신 것을 환영합니다!" });
      router.push('/');
    } else {
      toast({ title: "로그인 실패", description: "아이디 또는 비밀번호를 확인해주세요.", variant: "destructive" });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'naver' | 'kakao') => {
    setIsLoading(true);
    // In a real app, this would trigger OAuth flow.
    // For mock, we'll use predefined usernames that AuthContext.login can recognize
    // and that have pre-filled socialProfiles in mockData.
    let mockSocialUsername = '';
    switch (provider) {
      case 'google': mockSocialUsername = 'googleuser'; break;
      case 'naver': mockSocialUsername = 'naveruser'; break;
      case 'kakao': mockSocialUsername = 'kakaouser'; break;
      default:
        toast({ title: "오류", description: "알 수 없는 소셜 로그인 제공자입니다.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    // Using the existing login function, assuming mockData has these users
    // with a placeholder password and their socialProfiles field populated.
    const success = await login(mockSocialUsername, 'socialPasswordPlaceholder');
    setIsLoading(false);
    if (success) {
      toast({ title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} 로그인 성공`, description: "커뮤니티에 오신 것을 환영합니다!"});
      router.push('/');
    } else {
      toast({ title: "소셜 로그인 실패", description: `목업 ${provider} 계정 로그인에 실패했습니다. (mockData 확인 필요)`, variant: "destructive" });
    }
  };


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
              <Label htmlFor="username">아이디</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="아이디를 입력하세요" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  className="pl-10"
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
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  또는 소셜 계정으로 로그인
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                <GoogleIcon /> <span className="ml-2 hidden sm:inline">Google</span>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('naver')} disabled={isLoading}>
                <NaverIcon /> <span className="ml-2 hidden sm:inline">Naver</span>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('kakao')} disabled={isLoading}>
                <KakaoIcon /> <span className="ml-2 hidden sm:inline">Kakao</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
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
