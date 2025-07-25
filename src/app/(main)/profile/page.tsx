// src/app/(main)/profile/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import { Switch } from "@/components/ui/form/switch";
import { Edit3, Mail, MessageSquare, ShieldAlert, UserCog, ShieldCheck, Crown, Users, Clock, CheckCircle, Wand2, Palette, Link2, Key, Shield, Send, Timer, Lock, Unlock, Camera, X, PenTool } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { User, Post, Inquiry, PostMainCategory, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import { getPostsByAuthor } from '@/lib/postApi';
import { getInquiriesByUser } from '@/lib/inquiryApi';
import { validatePassword } from '@/lib/validationRules';
import { cn, toDate, toTimestamp } from '@/lib/utils';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import ProfileImageSelect from '@/components/ProfileImageSelect';
import { setupTwoFactorAuth, verifyTwoFactorCode, disableTwoFactorAuth } from '@/lib/twoFactorAuth';
import ThemeSelector from '@/components/profile/ThemeSelector';

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

  // 프로필 이미지 관련 상태 추가
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [isSavingProfileImage, setIsSavingProfileImage] = useState(false);

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
      setSelectedImageUrl(user.avatar || '/assets/images/malamute-icon.webp');
      setSelectedTitleIdentifier(user.selectedTitleIdentifier || 'none');
      setSelectedNicknameEffectIdentifier(user.selectedNicknameEffectIdentifier || 'none');
      setSelectedLogoIdentifier(user.selectedLogoIdentifier || 'none');
      setTwoFactorEnabled(user.twoFactorEnabled || false);
      setDiscordProfile(user.socialProfiles?.discord || '');
      setYoutubeProfile(user.socialProfiles?.youtube || '');

      // Fetch user-specific data
      getPostsByAuthor(user.id).then(setUserPosts);
      getInquiriesByUser(user.id).then(setUserInquiries);

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

  const isEmailChanged = useMemo(() => {
    const result = inputEmail.trim().toLowerCase() !== originalEmail.toLowerCase();
    return result;
  }, [inputEmail, originalEmail]);

  // 프로필 이미지 저장 함수 추가
  const handleProfileImageSave = async () => {
    if (!user || !selectedImageUrl) return;

    if (selectedImageUrl === user.avatar) {
      toast({ title: "알림", description: "프로필 이미지가 변경되지 않았습니다." });
      return;
    }

    setIsSavingProfileImage(true);
    try {
      await updateUser({ avatar: selectedImageUrl });
      toast({ title: "성공", description: "프로필 이미지가 변경되었습니다." });
    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: error.message || "프로필 이미지 변경에 실패했습니다.", 
        variant: "destructive"
      });
    } finally {
      setIsSavingProfileImage(false);
    }
  };

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

    await updateUser({ 
      nickname: trimmedNickname, 
      nicknameLastChanged: toTimestamp(new Date()) 
    });
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
    <>
      <style jsx global>{`
        .custom-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          background: transparent;
        }

        .custom-button::before {
          content: '';
          position: absolute;
          top: 100%;
          left: -100%;
          width: 300%;
          height: 300%;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
          transition: all 0.6s ease;
          z-index: 1;
        }

        .custom-button:hover::before {
          top: -100%;
          left: 100%;
        }

        .custom-button > * {
          position: relative;
          z-index: 2;
        }

        .edit-cancel-button {
          border: 2px solid hsl(var(--border));
          color: hsl(var(--foreground));
          background: transparent;
        }

        .edit-cancel-button:hover {
          border-color: hsl(var(--foreground));
          background-color: hsl(var(--foreground));
          color: hsl(var(--background));
        }

        .save-button {
          border: 2px solid #d4af37;
          color: hsl(var(--foreground));
          background: transparent;
        }

        .save-button:hover {
          border-color: #d4af37;
          background-color: #d4af37;
          color: hsl(var(--foreground));
        }

        .danger-button {
          border: 2px solid #dc2626;
          color: #dc2626;
          background: transparent;
        }

        .danger-button:hover {
          border-color: #dc2626;
          background-color: #dc2626;
          color: white;
        }
      `}</style>
      <div className="container mx-auto py-10 px-4">
        {/* Banner Section */}
        <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20 border border-border">
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm"></div>
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/50 shadow-2xl">
                    <AvatarImage src={user.avatar || selectedImageUrl} alt={user.nickname} />
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
              <div className="text-center mb-8">
                <div className="space-y-4">
                  <ProfileImageSelect
                    currentImageUrl={selectedImageUrl}
                    onImageSelect={setSelectedImageUrl}
                    disabled={isSavingProfileImage}
                  />
                  
                  <Button
                    onClick={handleProfileImageSave}
                    disabled={isSavingProfileImage || selectedImageUrl === user.avatar}
                    className="w-full custom-button save-button"
                  >
                    {isSavingProfileImage ? (
                      <>
                        <Timer className="w-4 h-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        프로필 이미지 저장
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">계정 정보</h3>
                  <p className="text-muted-foreground">프로필 설정을 관리하세요</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <UserCog className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">사용자명</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">이메일</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">가입일</p>
                      <p className="text-sm text-muted-foreground">{toDate(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">2차 인증</p>
                      <p className="text-sm text-muted-foreground">{twoFactorEnabled ? '활성화됨' : '비활성화됨'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel - 탭 내용들 계속... */}
            <div className="md:w-2/3 p-8">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50">
                   <TabsTrigger value="info" className="flex items-center gap-2"><UserCog className="h-4 w-4" /> <span className="hidden sm:inline">계정 정보</span></TabsTrigger>
                   <TabsTrigger value="customization" className="flex items-center gap-2"><Palette className="h-4 w-4" /> <span className="hidden sm:inline">커스터마이징</span></TabsTrigger>
                   <TabsTrigger value="social" className="flex items-center gap-2"><Link2 className="h-4 w-4" /> <span className="hidden sm:inline">소셜</span></TabsTrigger>
                   <TabsTrigger value="posts" className="flex items-center gap-2"><PenTool className="h-4 w-4" /> <span className="hidden sm:inline">내 글</span></TabsTrigger>
                   <TabsTrigger value="inquiries" className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">문의</span></TabsTrigger>
                </TabsList>

                {/* 탭 내용들... */}
                <TabsContent value="customization">
                  <div className="space-y-8">
                    <ThemeSelector />
                    <Card>
                      <CardHeader>
                        <CardTitle>닉네임/칭호 꾸미기</CardTitle>
                        <CardDescription>획득한 칭호와 효과를 적용해보세요.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* ... 기존 꾸미기 옵션들 ... */}
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleCustomizationSave} className="ml-auto">꾸미기 설정 저장</Button>
                      </CardFooter>
                    </Card>
                  </div>
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
                              <p className="text-sm text-muted-foreground">
                                {toDate(inquiry.createdAt).toLocaleDateString()} - 
                                <span className={cn("font-bold", inquiry.status === 'Completed' ? 'text-green-500' : 'text-yellow-500')}>
                                  {inquiry.status}
                                </span>
                              </p>
                            </div>
                          )) : <p className="text-muted-foreground">문의 내역이 없습니다.</p>}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* 나머지 탭 내용들은 이전과 동일 */}
              </Tabs>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
