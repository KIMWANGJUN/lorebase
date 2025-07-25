// src/app/(main)/settings/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Mail, Key, Shield, Send, Link2, Settings, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const MAX_PASSWORD_CHANGES_PER_DAY = 3;
const MAX_EMAIL_CHANGES_PER_DAY = 3;

export default function SettingsPage() {
  const { user, isAdmin, updateUser, updateUserPassword, updateUserEmail, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [nickname, setNickname] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordForPasswordChange, setCurrentPasswordForPasswordChange] = useState('');
  const [currentPasswordForEmailChange, setCurrentPasswordForEmailChange] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [discordProfile, setDiscordProfile] = useState('');
  const [youtubeProfile, setYoutubeProfile] = useState('');

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
      setInputEmail(user.email);
      setOriginalEmail(user.email);
      setDiscordProfile(user.socialProfiles?.discord || '');
      setYoutubeProfile(user.socialProfiles?.youtube || '');
    } else if (!authLoading) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const canChangeEmailToday = useMemo(() => {
    if (!user) return false;
    if (isAdmin) return true;
    const today = new Date().toDateString();
    if (user.lastEmailChangeDate !== today) {
      return true;
    }
    return (user.emailChangesToday || 0) < MAX_EMAIL_CHANGES_PER_DAY;
  }, [user, isAdmin]);

  const canChangePasswordToday = useMemo(() => {
    if (!user) return false;
    if (isAdmin) return true;
    const today = new Date().toDateString();
    if (user.lastPasswordChangeDate !== today) {
      return true;
    }
    return (user.passwordChangesToday || 0) < MAX_PASSWORD_CHANGES_PER_DAY;
  }, [user, isAdmin]);

  const handleNicknameSave = async () => {
    if (!user) return;
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname || trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      toast({ title: "오류", description: "닉네임은 2-10자로 입력해주세요.", variant: "destructive"});
      return;
    }
    if (trimmedNickname === user.nickname) {
      setIsEditingNickname(false);
      return;
    }
    await updateUser({ nickname: trimmedNickname, nicknameLastChanged: true as any });
    setIsEditingNickname(false);
    toast({ title: "성공", description: "닉네임이 변경되었습니다." });
  };

  const handleEmailSave = async () => {
    if (!user) return;
    
    if (!canChangeEmailToday) {
      toast({ 
        title: "변경 제한", 
        description: `오늘은 더 이상 이메일을 변경할 수 없습니다. (${user.emailChangesToday}/${MAX_EMAIL_CHANGES_PER_DAY})`,
        variant: "destructive"
      });
      return;
    }

    const trimmedEmail = inputEmail.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: "오류", description: "올바른 이메일 주소를 입력해주세요.", variant: "destructive"});
      return;
    }
    if (trimmedEmail === originalEmail) {
      setIsEditingEmail(false);
      return;
    }

    if (!currentPasswordForEmailChange) {
      toast({ title: "오류", description: "현재 비밀번호를 입력해주세요.", variant: "destructive"});
      return;
    }

    setIsUpdatingEmail(true);
    try {
      await updateUserEmail(trimmedEmail, currentPasswordForEmailChange);
      setOriginalEmail(trimmedEmail);
      setIsEditingEmail(false);
      setCurrentPasswordForEmailChange('');
      toast({ title: "성공", description: "이메일이 변경되었습니다." });
    } catch (error: any) {
      toast({ title: "오류", description: error.message || "이메일 변경에 실패했습니다.", variant: "destructive"});
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    if (!canChangePasswordToday) {
      toast({ 
        title: "변경 제한", 
        description: `오늘은 더 이상 비밀번호를 변경할 수 없습니다. (${user.passwordChangesToday}/${MAX_PASSWORD_CHANGES_PER_DAY})`,
        variant: "destructive"
      });
      return;
    }

    if (!currentPasswordForPasswordChange || !newPassword || !confirmPassword) {
      toast({ title: "오류", description: "모든 필드를 입력해주세요.", variant: "destructive"});
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "오류", description: "새 비밀번호가 일치하지 않습니다.", variant: "destructive"});
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "오류", description: "비밀번호는 최소 8자 이상이어야 합니다.", variant: "destructive"});
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(currentPasswordForPasswordChange, newPassword);
      setCurrentPasswordForPasswordChange('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: "성공", description: "비밀번호가 변경되었습니다." });
    } catch (error: any) {
      toast({ title: "오류", description: error.message || "비밀번호 변경에 실패했습니다.", variant: "destructive"});
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSocialProfileSave = async () => {
    if (!user) return;
    
    try {
      await updateUser({
        socialProfiles: {
          discord: discordProfile.trim(),
          youtube: youtubeProfile.trim(),
        }
      });
      toast({ title: "성공", description: "소셜 프로필이 저장되었습니다." });
    } catch (error) {
      toast({ title: "오류", description: "소셜 프로필 저장에 실패했습니다.", variant: "destructive" });
    }
  };

  if (authLoading || !user) {
    return <div className="container mx-auto py-8 px-4 text-center text-foreground">설정을 불러오는 중...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Settings Header */}
      <div className="text-center py-12 mb-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl border border-border">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Settings className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold font-headline mb-2">설정</h1>
        <p className="text-muted-foreground">계정 및 소셜 설정을 관리하세요</p>
        
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => document.getElementById('account-tab')?.click()}>
            <User className="h-4 w-4" />
            계정 정보
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => document.getElementById('social-tab')?.click()}>
            <Link2 className="h-4 w-4" />
            소셜 연결
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">설정 메뉴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => document.getElementById('account-tab')?.click()}>
                <User className="mr-2 h-4 w-4" />
                계정 정보
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => document.getElementById('social-tab')?.click()}>
                <Link2 className="mr-2 h-4 w-4" />
                소셜 연결
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => document.getElementById('security-tab')?.click()}>
                <Shield className="mr-2 h-4 w-4" />
                보안 설정
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="account" id="account-tab">
                <User className="h-4 w-4 mr-2" />
                계정 정보
              </TabsTrigger>
              <TabsTrigger value="social" id="social-tab">
                <Link2 className="h-4 w-4 mr-2" />
                소셜 연결
              </TabsTrigger>
              <TabsTrigger value="security" id="security-tab">
                <Shield className="h-4 w-4 mr-2" />
                보안 설정
              </TabsTrigger>
            </TabsList>

            {/* 계정 정보 탭 */}
            <TabsContent value="account">
              <div className="space-y-6">
                {/* 닉네임 설정 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      닉네임 설정
                    </CardTitle>
                    <CardDescription>다른 사용자에게 표시될 닉네임을 변경합니다.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {isEditingNickname ? (
                        <>
                          <Input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="flex-1"
                            maxLength={10}
                          />
                          <Button onClick={handleNicknameSave}>저장</Button>
                          <Button onClick={() => { setNickname(user.nickname); setIsEditingNickname(false); }} variant="outline">취소</Button>
                        </>
                      ) : (
                        <>
                          <Input value={user.nickname} readOnly className="flex-1" />
                          <Button onClick={() => setIsEditingNickname(true)} variant="outline">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 이메일 설정 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      이메일 설정
                    </CardTitle>
                    <CardDescription>로그인에 사용되는 이메일 주소를 변경합니다. 변경 후 재 로그인이 필요할 수 있습니다.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} readOnly={!isEditingEmail} className="flex-1" />
                        {isEditingEmail ? (
                          <Button onClick={() => { setInputEmail(originalEmail); setIsEditingEmail(false); }} variant="outline">취소</Button>
                        ) : (
                          <Button onClick={() => setIsEditingEmail(true)} variant="outline" disabled={!canChangeEmailToday}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {isEditingEmail && (
                        <div className="space-y-2">
                          <Label htmlFor="current-password-email">현재 비밀번호</Label>
                          <Input
                            id="current-password-email"
                            type="password"
                            value={currentPasswordForEmailChange}
                            onChange={(e) => setCurrentPasswordForEmailChange(e.target.value)}
                            placeholder="이메일 변경을 위해 현재 비밀번호를 입력하세요."
                          />
                          <Button onClick={handleEmailSave} disabled={isUpdatingEmail || !canChangeEmailToday}>
                            {isUpdatingEmail ? '변경 중...' : '이메일 변경 저장'}
                          </Button>
                          {!canChangeEmailToday && <p className="text-sm text-destructive">오늘 변경 횟수를 초과했습니다.</p>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* 소셜 연결 탭 */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>소셜 프로필 연결</CardTitle>
                  <CardDescription>다른 플랫폼의 프로필을 연결하여 공유하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="discord">Discord 프로필</Label>
                    <Input id="discord" value={discordProfile} onChange={(e) => setDiscordProfile(e.target.value)} placeholder="yourname#1234" />
                  </div>
                  <div>
                    <Label htmlFor="youtube">YouTube 채널</Label>
                    <Input id="youtube" value={youtubeProfile} onChange={(e) => setYoutubeProfile(e.target.value)} placeholder="https://youtube.com/channel/..." />
                  </div>
                  <Button onClick={handleSocialProfileSave}>
                    <Send className="mr-2 h-4 w-4" />
                    소셜 프로필 저장
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 보안 설정 탭 */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>비밀번호 변경</CardTitle>
                  <CardDescription>새로운 비밀번호로 계정을 보호하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">현재 비밀번호</Label>
                    <Input id="current-password" type="password" value={currentPasswordForPasswordChange} onChange={(e) => setCurrentPasswordForPasswordChange(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="new-password">새 비밀번호</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button onClick={handlePasswordChange} disabled={isUpdatingPassword || !canChangePasswordToday}>
                    {isUpdatingPassword ? '변경 중...' : '비밀번호 변경'}
                  </Button>
                   {!canChangePasswordToday && <p className="text-sm text-destructive">오늘 변경 횟수를 초과했습니다.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
