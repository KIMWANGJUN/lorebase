
// src/app/(main)/profile/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit3, Mail, MessageSquare, ShieldAlert, UserCog, ShieldCheck, Crown, Users, Clock, CheckCircle, Wand2, Palette, Link2, Key, Shield, Send, Timer, Lock, Unlock, Camera, X, PenTool } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { User, Post, Inquiry, PostMainCategory, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import { getPostsByAuthor } from '@/lib/postApi';
import { getInquiriesByUser } from '@/lib/inquiryApi';
import { validatePassword } from '@/lib/validationRules';
import { cn } from '@/lib/utils';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { setupTwoFactorAuth, verifyTwoFactorCode, disableTwoFactorAuth } from '@/lib/twoFactorAuth';

const MAX_PASSWORD_CHANGES_PER_DAY = 3;
const MAX_EMAIL_CHANGES_PER_DAY = 3;

export default function ProfilePage() {
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

  const [selectedTitleIdentifier, setSelectedTitleIdentifier] = useState<TitleIdentifier>('none');
  const [selectedNicknameEffectIdentifier, setSelectedNicknameEffectIdentifier] = useState<NicknameEffectIdentifier>('none');
  const [selectedLogoIdentifier, setSelectedLogoIdentifier] = useState<LogoIdentifier>('none');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [discordProfile, setDiscordProfile] = useState('');
  const [youtubeProfile, setYoutubeProfile] = useState('');
  // ... other social profiles

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);

  const [twoFactorSetupStep, setTwoFactorSetupStep] = useState<'none' | 'sending' | 'verifying'>('none');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
      setInputEmail(user.email);
      setOriginalEmail(user.email);
      setSelectedTitleIdentifier(user.selectedTitleIdentifier || 'none');
      setSelectedNicknameEffectIdentifier(user.selectedNicknameEffectIdentifier || 'none');
      setSelectedLogoIdentifier(user.selectedLogoIdentifier || 'none');
      setTwoFactorEnabled(user.twoFactorEnabled || false);
      setDiscordProfile(user.socialProfiles?.discord || '');
      // ... set other social profiles

      // Fetch user-specific data
      getPostsByAuthor(user.id).then(setUserPosts);
      getInquiriesByUser(user.id).then(setUserInquiries);

    } else if (!authLoading) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // ... (rest of the component logic: canChangeEmailToday, handleNicknameSave, handleEmailSave, etc. remains the same)

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

    const isEmailChanged = useMemo(() => {
    const result = inputEmail.trim().toLowerCase() !== originalEmail.toLowerCase();
    return result;
  }, [inputEmail, originalEmail]);

    const handleNicknameSave = async () => {
    if (!user) return;

    const trimmedNickname = nickname.trim();
    
    if (!trimmedNickname) {
      toast({ title: "오류", description: "닉네임을 입력해주세요.", variant: "destructive"});
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      toast({ title: "오류", description: "닉네임은 2-10자로 입력해주세요.", variant: "destructive"});
      return;
    }

    if (trimmedNickname === user.nickname) {
      setIsEditingNickname(false);
      toast({ title: "알림", description: "닉네임이 변경되지 않았습니다."});
      return;
    }

    await updateUser({ nickname: trimmedNickname, nicknameLastChanged: new Date() });
    setIsEditingNickname(false);
    toast({ title: "성공", description: "닉네임이 변경되었습니다." });
  };

  const handleEmailEditStart = () => {
    if (!isAdmin && !canChangeEmailToday) {
      toast({ 
        title: "변경 한도 초과", 
        description: `이메일은 하루에 ${MAX_EMAIL_CHANGES_PER_DAY}번까지만 변경할 수 있습니다.`, 
        variant: "destructive"
      });
      return;
    }
    setIsEditingEmail(true);
  };

    const handleEmailEditCancel = () => {
    setInputEmail(originalEmail);
    setCurrentPasswordForEmailChange('');
    setIsEditingEmail(false);
  };

  const handleEmailSave = async () => {
    if (!user) return;

    const trimmedEmail = inputEmail.trim();

    if (!trimmedEmail) {
      toast({ title: "오류", description: "이메일을 입력해주세요.", variant: "destructive"});
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      toast({ title: "오류", description: "유효한 이메일 주소를 입력해주세요.", variant: "destructive"});
      return; 
    }

    if (!isEmailChanged) {
      setIsEditingEmail(false);
      toast({ title: "알림", description: "이메일 주소가 변경되지 않았습니다."});
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
      toast({ title: "성공", description: "이메일이 변경되었습니다." });
      setIsEditingEmail(false);
      setCurrentPasswordForEmailChange('');
    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: error.message || "이메일 변경에 실패했습니다.", 
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

    const handlePasswordChange = async () => {
    if (!user) return;
    
    if (!isAdmin && !canChangePasswordToday) {
      toast({ 
        title: "오류", 
        description: `비밀번호는 하루에 ${MAX_PASSWORD_CHANGES_PER_DAY}번까지만 변경할 수 있습니다.`, 
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({ 
        title: "오류", 
        description: "비밀번호는 6자 이상으로 입력해주세요.", 
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ 
        title: "오류", 
        description: "비밀번호가 일치하지 않습니다.", 
        variant: "destructive"
      });
      return;
    }

    if (!currentPasswordForPasswordChange) {
      toast({ 
        title: "오류", 
        description: "현재 비밀번호를 입력해주세요.", 
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await updateUserPassword(currentPasswordForPasswordChange, newPassword);
      toast({ title: "성공", description: "비밀번호가 변경되었습니다." });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordForPasswordChange('');
    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: error.message || "비밀번호 변경에 실패했습니다.", 
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

    const handleCustomizationSave = async () => {
    if (!user) return;

    await updateUser({
      selectedTitleIdentifier,
      selectedNicknameEffectIdentifier,
      selectedLogoIdentifier,
    });
    toast({ title: "성공", description: "커스터마이징 설정이 저장되었습니다." });
  };

    const handleSocialProfilesSave = async () => {
    if (!user) return;

    const socialProfiles = {
      ...user.socialProfiles,
      discord: discordProfile.trim() || undefined,
      youtube: youtubeProfile.trim() || undefined,
    };

    await updateUser({ socialProfiles });
    toast({ title: "성공", description: "소셜 프로필이 저장되었습니다." });
  };

    const handleTwoFactorSetup = async () => {
    if (!user) return;
    setTwoFactorSetupStep('sending');
    try {
      const result = await setupTwoFactorAuth(user.id, user.email);
      if (result.success) {
        setTwoFactorSetupStep('verifying');
        toast({ 
          title: "인증 코드 전송", 
          description: result.message
        });
      } else {
        setTwoFactorSetupStep('none');
        toast({ 
          title: "오류", 
          description: result.message, 
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setTwoFactorSetupStep('none');
      toast({ 
        title: "오류", 
        description: "2차 인증 설정에 실패했습니다.", 
        variant: "destructive"
      });
    }
  };

    const handleTwoFactorVerify = async () => {
    if (!user || !verificationCode.trim()) {
      toast({ 
        title: "오류", 
        description: "인증 코드를 입력해주세요.", 
        variant: "destructive"
      });
      return;
    }
    setIsVerifying(true);
    try {
      const result = await verifyTwoFactorCode(user.id, verificationCode.trim());
      if (result.success) {
        setTwoFactorEnabled(true);
        setTwoFactorSetupStep('none');
        setVerificationCode('');
        await updateUser({ twoFactorEnabled: true });
        toast({ 
          title: "성공", 
          description: result.message
        });
      } else {
        toast({ 
          title: "오류", 
          description: result.message, 
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: "인증 코드 확인에 실패했습니다.", 
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

    const handleTwoFactorDisable = async () => {
    if (!user) return;
    try {
      const result = await disableTwoFactorAuth(user.id);
      if (result.success) {
        setTwoFactorEnabled(false);
        setTwoFactorSetupStep('none');
        setVerificationCode('');
        await updateUser({ twoFactorEnabled: false });
        toast({ 
          title: "성공", 
          description: result.message
        });
      } else {
        toast({ 
          title: "오류", 
          description: result.message, 
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: "2차 인증 비활성화에 실패했습니다.", 
        variant: "destructive"
      });
    }
  };

    const handleTwoFactorCancel = () => {
    setTwoFactorSetupStep('none');
    setVerificationCode('');
  };


  if (authLoading || !user) {
    return <div className="container mx-auto py-8 px-4 text-center text-foreground">프로필 정보를 불러오는 중...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Banner Section */}
      <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20 border border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm"></div>
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary/50 shadow-2xl">
                  <AvatarImage src={user.avatar} alt={user.nickname} />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {user.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <Crown className="h-6 w-6" />
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <NicknameDisplay user={user} context="profileCard" />
                  {isAdmin && (
                    <div className="flex items-center gap-2 bg-destructive/20 text-destructive px-3 py-1 rounded-full border border-destructive/30">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-sm font-medium">관리자</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-lg mb-4">@{user.username}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl font-bold text-primary">{user.score.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">총 점수</div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl font-bold text-accent">#{user.rank > 0 ? user.rank : '∞'}</div>
                    <div className="text-sm text-muted-foreground">전체 랭킹</div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl font-bold text-secondary">{userPosts.length}</div>
                    <div className="text-sm text-muted-foreground">작성한 글</div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl font-bold text-primary">{userInquiries.length}</div>
                    <div className="text-sm text-muted-foreground">문의사항</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      
      <Card className="mb-8 shadow-xl overflow-hidden bg-card border-border">
        <div className="md:flex">
          {/* Left Panel */}
          <div className="md:w-1/3 bg-gradient-to-br from-muted/50 to-background p-8 border-r border-border">
             {/* ... Left panel content ... */}
          </div>
          
          {/* Right Panel */}
          <div className="md:w-2/3 p-8">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50">
                 <TabsTrigger value="info" className="flex items-center gap-2"><UserCog className="h-4 w-4" /> <span className="hidden sm:inline">계정 정보</span></TabsTrigger>
                 <TabsTrigger value="customization" className="flex items-center gap-2"><Palette className="h-4 w-4" /> <span className="hidden sm:inline">커스터마이징</span></TabsTrigger>
                 <TabsTrigger value="social" className="flex items-center gap-2"><Link2 className="h-4 w-4" /> <span className="hidden sm:inline">소셜</span></TabsTrigger>
                 <TabsTrigger value="posts" className="flex items-center gap-2"><PenTool className="h-4 w-4" /> <span className="hidden sm:inline">내 글</span></TabsTrigger>
                 <TabsTrigger value="inquiries" className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">문의</span></TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                {/* ... Account Info Form ... */}
              </TabsContent>

              <TabsContent value="customization">
                {/* ... Customization Form ... */}
              </TabsContent>
              
              <TabsContent value="social">
                {/* ... Social Form ... */}
              </TabsContent>

              <TabsContent value="posts">
                <Card className="bg-card border-border">
                  <CardHeader><CardTitle>내가 작성한 글 ({userPosts.length})</CardTitle></CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {userPosts.length > 0 ? userPosts.map(post => (
                          <Link href={`/tavern/${post.id}`} key={post.id}>
                            <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                              <p className="font-semibold text-foreground">{post.title}</p>
                              <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                          </Link>
                        )) : <p className="text-muted-foreground">작성한 글이 없습니다.</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inquiries">
                 <Card className="bg-card border-border">
                  <CardHeader><CardTitle>내 문의 내역 ({userInquiries.length})</CardTitle></CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {userInquiries.length > 0 ? userInquiries.map(inquiry => (
                          <div key={inquiry.id} className="p-4 rounded-lg border border-border">
                            <p className="font-semibold text-foreground">{inquiry.title}</p>
                            <p className="text-sm text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString()} - <span className={cn("font-bold", inquiry.status === 'Answered' ? 'text-green-500' : 'text-yellow-500')}>{inquiry.status}</span></p>
                          </div>
                        )) : <p className="text-muted-foreground">문의 내역이 없습니다.</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
}
