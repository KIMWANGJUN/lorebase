
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit3, Mail, MessageSquare, ShieldAlert, UserCog, ShieldCheck, Crown, Users, Gamepad2, Clock, CheckCircle, Wand2, Palette, VenetianMask, Star, Box, AppWindow, PenTool, LayoutGrid } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { User, PostMainCategory, AchievedRankType, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import { mockPosts, mockInquiries, mockUsers, tetrisTitles } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import NicknameDisplay from '@/components/shared/NicknameDisplay';


const getCategoryDisplayName = (category: PostMainCategory | 'Global'): string => {
  switch (category) {
    case 'Global': return '종합';
    case 'Unity': return 'Unity';
    case 'Unreal': return 'Unreal';
    case 'Godot': return 'Godot';
    case 'General': return '일반 & 유머';
    default: return category;
  }
};

const CategorySpecificIcon: React.FC<{ category: PostMainCategory | 'Global', className?: string }> = ({ category, className }) => {
  const defaultClassName = "h-4 w-4 shrink-0";
  let iconColorClass = '';
  if (category !== 'Global') {
    iconColorClass =
        category === 'Unity' ? 'icon-unity' :
        category === 'Unreal' ? 'icon-unreal' :
        category === 'Godot' ? 'icon-godot' :
        'icon-general';
  }

  switch (category) {
    case 'Global': return <Users className={cn(defaultClassName, "text-primary", className)} />;
    case 'Unity': return <Box className={cn(defaultClassName, iconColorClass, className)} />;
    case 'Unreal': return <AppWindow className={cn(defaultClassName, iconColorClass, className)} />;
    case 'Godot': return <PenTool className={cn(defaultClassName, iconColorClass, className)} />;
    case 'General': return <LayoutGrid className={cn(defaultClassName, iconColorClass, className)} />;
    default: return null;
  }
};


interface SelectOption {
  value: string;
  label: string;
}

const PROFILE_RANKERS_TO_SHOW = 50;

const titleOptionsForTest: SelectOption[] = [
  { value: 'none', label: '칭호 없음' },
  { value: 'tetris_1_title', label: '테스트: ♛테트리스♕ (금색)' },
  { value: 'tetris_2_title', label: '테스트: "테트리스" 그랜드 마스터 (은색)' },
  { value: 'tetris_3_title', label: '테스트: "테트리스" 마스터 (동색)' },
  ...(['Unity', 'Unreal', 'Godot', 'General'] as PostMainCategory[]).flatMap(cat => 
    [1, 2, 3].map(rank => ({
      value: `category_${cat}_${rank}_title` as TitleIdentifier,
      label: `테스트: ${getCategoryDisplayName(cat)} ${rank}위 칭호 (${rank===1?'금':rank===2?'은':'동'}색)`
    }))
  )
];

const nicknameEffectOptionsForTest: SelectOption[] = [
  { value: 'none', label: '기본 스타일' },
  { value: 'global_1_effect', label: '테스트: 종합 1위 효과 (금색 텍스트/배경)' },
  { value: 'global_2_effect', label: '테스트: 종합 2위 효과 (은색 텍스트/배경)' },
  { value: 'global_3_effect', label: '테스트: 종합 3위 효과 (동색 텍스트/배경)' },
  ...(['Unity', 'Unreal', 'Godot', 'General'] as PostMainCategory[]).flatMap(cat => [
    { value: `category_${cat}_1-3_effect` as NicknameEffectIdentifier, label: `테스트: ${getCategoryDisplayName(cat)} 1-3위 효과 (테마 텍스트/배경)`},
    { value: `category_${cat}_4-10_effect` as NicknameEffectIdentifier, label: `테스트: ${getCategoryDisplayName(cat)} 4-10위 효과 (테마 텍스트/배경)`},
    { value: `category_${cat}_11-20_effect` as NicknameEffectIdentifier, label: `테스트: ${getCategoryDisplayName(cat)} 11-20위 효과 (테마 텍스트, 배경X)`},
  ]),
  { value: 'tetris_1_effect', label: '테스트: 테트리스 1위 효과 (금색 텍스트, 배경X)' },
  { value: 'tetris_2_effect', label: '테스트: 테트리스 2위 효과 (은색 텍스트, 배경X)' },
  { value: 'tetris_3_effect', label: '테스트: 테트리스 3위 효과 (동색 텍스트, 배경X)' },
];

const logoOptionsForTest: SelectOption[] = [
  { value: 'none', label: '로고 없음'},
  { value: 'logo_Unity', label: '테스트: Unity 로고'},
  { value: 'logo_Unreal', label: '테스트: Unreal 로고'},
  { value: 'logo_Godot', label: '테스트: Godot 로고'},
  { value: 'logo_General', label: '테스트: 일반 & 유머 로고'},
];


export default function ProfilePage() {
  const { user, isAdmin, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState<TitleIdentifier>('none');
  const [currentNicknameEffect, setCurrentNicknameEffect] = useState<NicknameEffectIdentifier>('none');
  const [currentLogo, setCurrentLogo] = useState<LogoIdentifier>('none');
  const [activeRankingTabProfile, setActiveRankingTabProfile] = useState<PostMainCategory | 'Global'>('Global');


  const calculateCanChangeNickname = () => {
    if (!user) return false;
    if (isAdmin) return true;
    if (!user.nicknameLastChanged) return true;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return new Date().getTime() - new Date(user.nicknameLastChanged).getTime() > thirtyDays;
  };

  const [nicknameChangeAllowed, setNicknameChangeAllowed] = useState(false);

  const nextChangeDate = useMemo(() => {
    if (!user || isAdmin || !user.nicknameLastChanged || calculateCanChangeNickname()) return null;
    return new Date(new Date(user.nicknameLastChanged).getTime() + (30 * 24 * 60 * 60 * 1000));
  }, [user, isAdmin]);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setNickname(user.nickname);
      setEmail(user.email || '');
      setCurrentTitle(user.selectedTitleIdentifier || 'none');
      setCurrentNicknameEffect(user.selectedNicknameEffectIdentifier || 'none');
      setCurrentLogo(user.selectedLogoIdentifier || 'none');
      setNicknameChangeAllowed(calculateCanChangeNickname());
    }
  }, [user, authLoading, router]);

  const handleNicknameSave = () => {
    if (!user) return;

    if (!isAdmin && !nicknameChangeAllowed) {
      toast({ title: "오류", description: "닉네임은 30일에 한 번만 변경할 수 있습니다.", variant: "destructive"});
      return;
    }

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
        toast({ title: "오류", description: "닉네임은 비워둘 수 없습니다.", variant: "destructive"});
        return;
    }
    if (trimmedNickname === user.nickname) {
        setIsEditingNickname(false);
        return;
    }

    const isDuplicate = mockUsers.some(u => u.id !== user.id && u.username !== 'WANGJUNLAND' && u.nickname.toLowerCase() === trimmedNickname.toLowerCase());
    if (isDuplicate) {
        toast({ title: "오류", description: "이미 사용 중인 닉네임입니다.", variant: "destructive"});
        return;
    }

    updateUser({ nickname: trimmedNickname });
    setIsEditingNickname(false);
    setNicknameChangeAllowed(calculateCanChangeNickname()); 
    toast({ title: "성공", description: "닉네임이 변경되었습니다." });
  };

  const handleEmailSave = () => {
    if (!user) return;
    const trimmedEmail = email.trim();

    if (trimmedEmail && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
        toast({ title: "오류", description: "유효한 이메일 주소를 입력해주세요.", variant: "destructive"});
        return;
    }

    if (trimmedEmail && trimmedEmail !== (user.email || '')) {
        const isDuplicate = mockUsers.some(u => u.id !== user.id && u.username !== 'WANGJUNLAND' && u.email?.toLowerCase() === trimmedEmail.toLowerCase());
        if (isDuplicate) {
            toast({ title: "오류", description: "이미 사용 중인 이메일입니다.", variant: "destructive"});
            return;
        }
    }

    updateUser({ email: trimmedEmail || undefined });
    toast({ title: "성공", description: "이메일이 등록/수정되었습니다." });
  };

  const handlePreferenceChange = (type: 'title' | 'nicknameEffect' | 'logo', value: string) => {
    if (!user) return;
    let updatePayload: Partial<User> = {};
    if (type === 'title') {
      setCurrentTitle(value as TitleIdentifier);
      updatePayload.selectedTitleIdentifier = value as TitleIdentifier;
    } else if (type === 'nicknameEffect') {
      setCurrentNicknameEffect(value as NicknameEffectIdentifier);
      updatePayload.selectedNicknameEffectIdentifier = value as NicknameEffectIdentifier;
    } else if (type === 'logo') {
      setCurrentLogo(value as LogoIdentifier);
      updatePayload.selectedLogoIdentifier = value as LogoIdentifier;
    }
    updateUser(updatePayload);
    toast({ title: "성공", description: "대표 표시 설정이 변경되었습니다. 다른 페이지에서 반영됩니다." });
  };
  
  const getRegularUserOptions = (type: 'title' | 'nicknameEffect' | 'logo'): SelectOption[] => {
    if (!user) return [{ value: 'none', label: '없음 / 기본' }];
    
    const options: SelectOption[] = [{ value: 'none', label: '없음 / 기본' }];

    if (type === 'title' && user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <=3 ) {
         options.push({ value: `tetris_${user.tetrisRank}_title` as TitleIdentifier, label: `${tetrisTitles[user.tetrisRank]} (테트리스 ${user.tetrisRank}위)`});
    }
    
    if (type === 'nicknameEffect' && user.rank > 0 && user.rank <=3) {
        options.push({ value: `global_${user.rank}_effect` as NicknameEffectIdentifier, label: `종합 ${user.rank}위 스타일`});
    }
    
    if (type === 'logo') {
        if (user.categoryStats?.Unity?.rankInCate && user.categoryStats.Unity.rankInCate > 0) {
            options.push({ value: 'logo_Unity', label: 'Unity 로고'});
        }
         if (user.categoryStats?.Unreal?.rankInCate && user.categoryStats.Unreal.rankInCate > 0) {
            options.push({ value: 'logo_Unreal', label: 'Unreal 로고'});
        }
         if (user.categoryStats?.Godot?.rankInCate && user.categoryStats.Godot.rankInCate > 0) {
            options.push({ value: 'logo_Godot', label: 'Godot 로고'});
        }
         if (user.categoryStats?.General?.rankInCate && user.categoryStats.General.rankInCate > 0) {
            options.push({ value: 'logo_General', label: '일반 & 유머 로고'});
        }
    }
    return options;
  };
  
  const currentTitleOptions = user?.username === 'testwang1' ? titleOptionsForTest : getRegularUserOptions('title');
  const currentNicknameEffectOptions = user?.username === 'testwang1' ? nicknameEffectOptionsForTest : getRegularUserOptions('nicknameEffect');
  const currentLogoOptions = user?.username === 'testwang1' ? logoOptionsForTest : getRegularUserOptions('logo');


  const displayedRankersProfile = useMemo(() => {
    const usersToRank = mockUsers.filter(u => u.username !== 'WANGJUNLAND');
    if (activeRankingTabProfile === 'Global') {
      return usersToRank
        .filter(u => u.rank > 0)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, PROFILE_RANKERS_TO_SHOW);
    } else {
      return usersToRank
        .filter(u => u.categoryStats?.[activeRankingTabProfile]?.rankInCate && u.categoryStats[activeRankingTabProfile]!.rankInCate! > 0)
        .sort((a, b) => (a.categoryStats![activeRankingTabProfile]!.rankInCate!) - (b.categoryStats![activeRankingTabProfile]!.rankInCate!))
        .slice(0, PROFILE_RANKERS_TO_SHOW);
    }
  }, [activeRankingTabProfile]);


  if (authLoading || !user) {
    return <div className="container mx-auto py-8 px-4 text-center text-foreground">프로필 정보를 불러오는 중...</div>;
  }

  const userPosts = mockPosts.filter(p => p.authorId === user.id);
  const userInquiries = mockInquiries.filter(iq => iq.userId === user.id);

  const bannerImageUrl = "https://placehold.co/1920x600.png";
  const tabsForRanking: (PostMainCategory | 'Global')[] = ['Global', 'Unity', 'Unreal', 'Godot', 'General'];

  return (
    <div className="container mx-auto py-10 px-4">
       <section
        className="py-16 md:py-24 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="personal coat_of_arms"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="relative z-10 text-center">
           <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg flex items-center justify-center">
            <Wand2 className="h-10 w-10 mr-3 text-accent animate-pulse" />
            내 프로필
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">계정 정보를 관리하고 활동 내역을 확인하세요.</p>
        </div>
      </section>

      <Card className="mb-8 shadow-xl overflow-hidden bg-card border-border">
        <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-primary/80 to-accent/80 p-8 flex flex-col items-center justify-center text-primary-foreground">
                <Avatar className="w-32 h-32 mb-4 border-4 border-background shadow-lg">
                    <AvatarImage src={user.avatar || `https://placehold.co/200x200.png?text=${user.nickname.substring(0,1)}`} alt={user.nickname} data-ai-hint="fantasy portrait" />
                    <AvatarFallback className="text-4xl bg-muted text-muted-foreground">{user.nickname.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="mb-1">
                    <NicknameDisplay user={user} context="profileCard" />
                </div>
                <p className="text-sm opacity-80 mt-1">{user.email || "이메일 미등록"}</p>
                <div className="mt-4 text-center">
                    <p className="text-2xl font-semibold">{user.score.toLocaleString()} 점</p>
                    <p className="text-sm opacity-80">
                        {user.rank > 0 ? `종합 ${user.rank}위` : (isAdmin ? "" : "랭킹 정보 없음")}
                    </p>
                </div>
            </div>
            <div className="md:w-2/3 p-8">
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-card border-border">
                        <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><UserCog className="inline-block h-4 w-4 mr-1 md:mr-2" />내 정보</TabsTrigger>
                        <TabsTrigger value="displayRank" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown className="inline-block h-4 w-4 mr-1 md:mr-2" />대표 표시</TabsTrigger>
                        <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><MessageSquare className="inline-block h-4 w-4 mr-1 md:mr-2" />활동</TabsTrigger>
                        <TabsTrigger value="inquiries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ShieldAlert className="inline-block h-4 w-4 mr-1 md:mr-2" />문의함</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        <Card className="bg-card border-border">
                            <CardHeader><CardTitle className="text-foreground">계정 정보 수정</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="nickname" className="text-muted-foreground">닉네임</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={!isEditingNickname} className="bg-input border-border text-foreground focus:ring-accent" />
                                        {isEditingNickname ? (
                                            <Button onClick={handleNicknameSave} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"><CheckCircle className="h-4 w-4 mr-1"/> 저장</Button>
                                        ) : (
                                            <Button onClick={() => setIsEditingNickname(true)} variant="outline" size="sm" disabled={!isAdmin && !nicknameChangeAllowed} className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent"><Edit3 className="h-4 w-4 mr-1"/> 변경</Button>
                                        )}
                                    </div>
                                    {!isAdmin && !nicknameChangeAllowed && nextChangeDate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <Clock className="inline-block h-3 w-3 mr-1"/>
                                            다음 닉네임 변경은 {nextChangeDate.toLocaleDateString()} 이후에 가능합니다.
                                        </p>
                                    )}
                                     {!isAdmin && nicknameChangeAllowed && (!user.nicknameLastChanged || new Date(user.nicknameLastChanged).getFullYear() < 2024 ) && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            닉네임은 30일에 한 번 변경 가능합니다.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-muted-foreground">이메일</Label>
                                    <div className="flex items-center gap-2">
                                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input border-border text-foreground focus:ring-accent"/>
                                      <Button onClick={handleEmailSave} variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent"><CheckCircle className="h-4 w-4 mr-1"/> 등록/수정</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                     <TabsContent value="displayRank">
                        <Card className="bg-card border-border">
                          <CardHeader>
                            <CardTitle className="text-foreground">대표 표시 설정</CardTitle>
                            <CardDescription className="text-muted-foreground">
                              커뮤니티에 표시될 칭호, 닉네임 스타일, 로고를 선택하세요.
                              {isAdmin && user.username !== 'testwang1' && <span className="text-destructive font-semibold"> (관리자는 이 설정이 적용되지 않습니다.)</span>}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {isAdmin && user.username !== 'testwang1' ? (
                                <p className="text-sm text-muted-foreground">관리자 계정은 대표 표시 설정을 사용하지 않습니다.</p>
                            ) : (
                                <Tabs defaultValue="title_tab" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50 border-border p-1 rounded-lg">
                                    <TabsTrigger value="title_tab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"><VenetianMask className="inline-block h-4 w-4 mr-1"/>칭호</TabsTrigger>
                                    <TabsTrigger value="nickname_effect_tab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"><Palette className="inline-block h-4 w-4 mr-1"/>닉네임 스타일</TabsTrigger>
                                    <TabsTrigger value="logo_tab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"><Star className="inline-block h-4 w-4 mr-1"/>로고</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="title_tab">
                                    <RadioGroup value={currentTitle} onValueChange={(v) => handlePreferenceChange('title', v)}>
                                      {currentTitleOptions.map(opt => (
                                        <div key={opt.value} className="flex items-center space-x-2 py-1.5">
                                          <RadioGroupItem value={opt.value} id={`title_${opt.value}`} />
                                          <Label htmlFor={`title_${opt.value}`} className="font-normal text-foreground text-sm">{opt.label}</Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </TabsContent>
                                  <TabsContent value="nickname_effect_tab">
                                     <RadioGroup value={currentNicknameEffect} onValueChange={(v) => handlePreferenceChange('nicknameEffect', v)}>
                                      {currentNicknameEffectOptions.map(opt => (
                                        <div key={opt.value} className="flex items-center space-x-2 py-1.5">
                                          <RadioGroupItem value={opt.value} id={`effect_${opt.value}`} />
                                          <Label htmlFor={`effect_${opt.value}`} className="font-normal text-foreground text-sm">{opt.label}</Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </TabsContent>
                                  <TabsContent value="logo_tab">
                                     <RadioGroup value={currentLogo} onValueChange={(v) => handlePreferenceChange('logo', v)}>
                                      {currentLogoOptions.map(opt => (
                                        <div key={opt.value} className="flex items-center space-x-2 py-1.5">
                                          <RadioGroupItem value={opt.value} id={`logo_${opt.value}`} />
                                          <Label htmlFor={`logo_${opt.value}`} className="font-normal text-foreground text-sm">{opt.label}</Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </TabsContent>
                                </Tabs>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                    <TabsContent value="activity">
                         <Card className="bg-card border-border">
                            <CardHeader><CardTitle className="text-foreground">내 활동 내역</CardTitle></CardHeader>
                            <CardContent>
                                <h3 className="font-semibold mb-2 text-muted-foreground">작성한 게시글 ({userPosts.length})</h3>
                                {userPosts.length > 0 ? (
                                    <ul className="space-y-2 max-h-60 overflow-y-auto p-2 bg-background/30 rounded-md">
                                        {userPosts.map(p => <li key={p.id} className="text-sm p-2 bg-muted/30 rounded-md hover:bg-muted/50"><Link href={`/tavern/${p.id}`} className="text-foreground hover:text-accent">{p.title}</Link></li>)}
                                    </ul>
                                ) : <p className="text-sm text-muted-foreground">작성한 게시글이 없습니다.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="inquiries">
                        <Card className="bg-card border-border">
                            <CardHeader><CardTitle className="text-foreground">내 문의 내역</CardTitle></CardHeader>
                             <CardContent>
                                {userInquiries.length > 0 ? (
                                    <ul className="space-y-3 max-h-80 overflow-y-auto p-2 bg-background/30 rounded-md">
                                        {userInquiries.map(iq => (
                                            <li key={iq.id} className="p-3 border border-border rounded-md bg-muted/30">
                                                <p className="font-semibold text-foreground">{iq.title} <span className={`text-xs px-2 py-0.5 rounded-full ${iq.status === 'Answered' ? 'bg-green-700/30 text-green-300' : 'bg-yellow-700/30 text-yellow-300'}`}>{iq.status}</span></p>
                                                <p className="text-xs text-muted-foreground">{new Date(iq.createdAt).toLocaleString()}</p>
                                                {iq.response && <p className="text-sm mt-1 pt-1 border-t border-border/50 text-muted-foreground">답변: {iq.response}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-muted-foreground">문의 내역이 없습니다.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
      </Card>

      <section id="ranking" className="mt-12">
        <div className="text-center mb-8">
            <Users className="mx-auto h-12 w-12 text-primary mb-2" />
            <h2 className="text-3xl font-bold font-headline text-primary">커뮤니티 랭킹</h2>
            <p className="text-muted-foreground">명예의 전당에 이름을 올려보세요!</p>
        </div>
        <Card className="shadow-lg bg-card border-border">
            <CardHeader>
                <Tabs value={activeRankingTabProfile} onValueChange={(value) => setActiveRankingTabProfile(value as PostMainCategory | 'Global')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-0 bg-card border-border p-1 rounded-lg shadow-inner">
                        {tabsForRanking.map(tabKey => (
                            <TabsTrigger
                                key={tabKey}
                                value={tabKey}
                                className="text-xs px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"
                            >
                                <CategorySpecificIcon category={tabKey} /> {getCategoryDisplayName(tabKey)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] w-full">
                    {displayedRankersProfile.length > 0 ? (
                        <div className="space-y-3 p-1">
                            {displayedRankersProfile.map((rankerUser) => {
                                const isGlobalTab = activeRankingTabProfile === 'Global';
                                const rankToShow = isGlobalTab ? rankerUser.rank : rankerUser.categoryStats?.[activeRankingTabProfile as PostMainCategory]?.rankInCate || 0;
                                const scoreToShow = isGlobalTab ? rankerUser.score : rankerUser.categoryStats?.[activeRankingTabProfile as PostMainCategory]?.score || 0;

                                return (
                                    <div key={rankerUser.id} className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border bg-card/50 shadow-sm",
                                        rankerUser.id === user.id ? 'border-primary bg-primary/10' : 'border-border'
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg w-8 text-center text-muted-foreground shrink-0">
                                                {rankToShow > 0 ? `${rankToShow}.` : "-"}
                                            </span>
                                            <Avatar className="h-10 w-10 border-2 border-accent/50 shrink-0">
                                                <Image src={rankerUser.avatar || `https://placehold.co/40x40.png?text=${rankerUser.nickname.substring(0,1)}`} alt={rankerUser.nickname} width={40} height={40} className="rounded-full" data-ai-hint="fantasy character icon" />
                                                <AvatarFallback className="bg-muted text-muted-foreground">{rankerUser.nickname.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <NicknameDisplay user={rankerUser} context="rankingList" activeCategory={isGlobalTab ? undefined : activeRankingTabProfile as PostMainCategory} />
                                        </div>
                                        <span className="text-sm font-semibold text-accent shrink-0">{scoreToShow.toLocaleString()} 점</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                         <p className="text-center py-10 text-muted-foreground">선택한 카테고리의 랭커 정보가 없습니다.</p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}

    