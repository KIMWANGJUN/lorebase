
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
import { Edit3, Mail, MessageSquare, ShieldAlert, UserCog, ShieldX, Star, CheckCircle, Clock, Users, Wand2, Crown, Gamepad2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { User, PostMainCategory, DisplayRankType } from '@/types';
import { mockPosts, mockInquiries, mockUsers, tetrisTitles, mockTetrisRankings } from '@/lib/mockData'; 
import { cn } from '@/lib/utils';
import Image from 'next/image';

const getCategoryDisplayName = (category: PostMainCategory): string => {
  switch (category) {
    case 'Unity': return 'Unity';
    case 'Unreal': return 'Unreal';
    case 'Godot': return 'Godot';
    case 'General': return '일반 & 유머';
    default: return category;
  }
};

export default function ProfilePage() {
  const { user, isAdmin, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [selectedDisplayRankState, setSelectedDisplayRankState] = useState<DisplayRankType | undefined>(user?.selectedDisplayRank || 'default');
  
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
      setSelectedDisplayRankState(user.selectedDisplayRank || 'default');
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

  const handleDisplayRankChange = (value: string) => {
    const newDisplayRank = value as DisplayRankType;
    setSelectedDisplayRankState(newDisplayRank);
    if (user) {
      updateUser({ selectedDisplayRank: newDisplayRank });
      toast({ title: "성공", description: "대표 칭호/하이라이트 설정이 변경되었습니다. (다른 페이지에서 반영됩니다)" });
    }
  };

  const availableDisplayRanks = useMemo(() => {
    if (!user || user.username === 'WANGJUNLAND') return [{value: 'default' as DisplayRankType, label: '기본 표시 (관리자는 설정 불가)'}];
    const ranks: { value: DisplayRankType; label: string }[] = [{value: 'default', label: '기본 표시 (우선순위 따름)'}];
    
    if (user.rank > 0 && user.rank <= 3) {
      ranks.push({ value: 'global', label: `종합 랭킹 ${user.rank}위` });
    }

    if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) {
      ranks.push({ value: 'tetris', label: `${tetrisTitles[user.tetrisRank - 1]} (테트리스 ${user.tetrisRank}위)`});
    }

    (Object.keys(user.categoryStats || {}) as PostMainCategory[]).forEach(catKey => {
      const stat = user.categoryStats?.[catKey];
      if (stat && stat.rankInCate && stat.rankInCate > 0 && stat.rankInCate <= 3) {
        ranks.push({ value: `category_${catKey}`, label: `${getCategoryDisplayName(catKey)} 랭킹 ${stat.rankInCate}위` });
      }
    });
    return ranks;
  }, [user]);
  
  if (authLoading || !user) {
    return <div className="container mx-auto py-8 px-4 text-center text-foreground">프로필 정보를 불러오는 중...</div>;
  }

  const userPosts = mockPosts.filter(p => p.authorId === user.id);
  const userInquiries = mockInquiries.filter(iq => iq.userId === user.id);

  const bannerImageUrl = "https://placehold.co/1920x600.png";

  // Determine user's primary style for the avatar header based on fixed priority
  let headerNicknameClass = "text-3xl font-bold font-headline";
  let headerRankText = user.rank > 0 ? `종합 ${user.rank}위` : "랭킹 정보 없음";
  let headerRankTextClass = "text-muted-foreground";
  let headerContainerClass = ""; 

  if (isAdmin) {
    headerNicknameClass = cn(headerNicknameClass, "text-admin");
    headerRankText = "관리자";
    headerRankTextClass = "text-admin";
    headerContainerClass = "admin-badge-bg admin-badge-border";
  } else if (user.rank > 0 && user.rank <= 3) { 
    headerNicknameClass = cn(headerNicknameClass, user.rank === 1 ? "text-rank-gold" : user.rank === 2 ? "text-rank-silver" : "text-rank-bronze");
    headerRankText = `종합 ${user.rank}위`;
    headerRankTextClass = user.rank === 1 ? "text-rank-gold" : user.rank === 2 ? "text-rank-silver" : "text-rank-bronze";
    headerContainerClass = cn(
      user.rank === 1 && 'rank-1-badge',
      user.rank === 2 && 'rank-2-badge',
      user.rank === 3 && 'rank-3-badge'
    );
  }
 

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
                <div className={cn("rounded-lg px-3 py-1 text-center", headerContainerClass)}>
                  <h1 className={headerNicknameClass}>{user.nickname}</h1>
                </div>
                <p className="text-sm opacity-80 mt-1">{user.email || "이메일 미등록"}</p>
                <div className="mt-4 text-center">
                    <p className="text-2xl font-semibold">{user.score.toLocaleString()} 점</p>
                     <p className={cn("text-lg", headerRankTextClass)}>
                        {headerRankText}
                    </p>
                </div>
            </div>
            <div className="md:w-2/3 p-8">
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-card border-border">
                        <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><UserCog className="inline-block h-4 w-4 mr-1 md:mr-2" />내 정보</TabsTrigger>
                        <TabsTrigger value="displayRank" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown className="inline-block h-4 w-4 mr-1 md:mr-2" />대표 칭호</TabsTrigger>
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
                                     {!isAdmin && nicknameChangeAllowed && !user.nicknameLastChanged && (
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
                            <CardTitle className="text-foreground">대표 칭호/하이라이트 설정</CardTitle>
                            <CardDescription className="text-muted-foreground">
                              여러 랭킹에 해당될 경우, 커뮤니티에 표시될 주요 칭호와 스타일을 선택하세요.
                              {isAdmin && <span className="text-destructive font-semibold"> (관리자는 이 설정이 적용되지 않습니다.)</span>}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {availableDisplayRanks.length > 1 && !isAdmin ? (
                              <RadioGroup value={selectedDisplayRankState} onValueChange={handleDisplayRankChange}>
                                {availableDisplayRanks.map(rankOption => (
                                  <div key={rankOption.value} className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem value={rankOption.value} id={rankOption.value} />
                                    <Label htmlFor={rankOption.value} className="font-normal text-foreground">
                                      {rankOption.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            ) : isAdmin ? (
                                <p className="text-sm text-muted-foreground">관리자 계정은 칭호/하이라이트 설정을 사용하지 않습니다.</p>
                            ) : availableDisplayRanks.length === 1 ? (
                               <p className="text-sm text-muted-foreground">현재 설정 가능한 대표 칭호가 한 가지 입니다: {availableDisplayRanks[0].label}</p>
                            ): (
                              <p className="text-sm text-muted-foreground">선택 가능한 대표 칭호/하이라이트가 없습니다.</p>
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
            <CardTitle className="font-headline text-foreground">전체 사용자 순위 (관리자 제외)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto p-1">
              {mockUsers.filter(u => u.username !== 'WANGJUNLAND' && u.rank > 0).sort((a, b) => a.rank - b.rank).map((rankerUser) => { 
                let finalNicknameSpanClass = "font-medium text-foreground"; // Default
                let finalItemContainerClass = "default-rank-item-bg";
                let rankNumberClass = "text-muted-foreground";

                if (rankerUser.rank > 0 && rankerUser.rank <= 3) {
                  finalItemContainerClass = cn(rankerUser.rank === 1 && 'rank-1-badge', rankerUser.rank === 2 && 'rank-2-badge', rankerUser.rank === 3 && 'rank-3-badge');
                  finalNicknameSpanClass = cn("font-medium", rankerUser.rank === 1 ? 'text-rank-gold' : rankerUser.rank === 2 ? 'text-rank-silver' : 'text-rank-bronze');
                  rankNumberClass = finalNicknameSpanClass.replace("font-medium ", "");
                }

                return (
                  <div key={rankerUser.id} className={cn("flex items-center justify-between p-3 rounded-lg border", 
                    finalItemContainerClass,
                    rankerUser.id === user.id && !finalItemContainerClass.startsWith('rank-') ? 'bg-primary/10 border-primary shadow-md' : 'border-border'
                  )}>
                    <div className="flex items-center gap-3">
                      <span className={cn("font-bold text-lg w-8 text-center", rankNumberClass)}>
                          {rankerUser.rank > 0 ? `${rankerUser.rank}.` : <Star className="h-5 w-5 inline text-yellow-400" />}
                      </span>
                      <Avatar className="h-10 w-10 border-2 border-accent/50">
                        <Image src={rankerUser.avatar || `https://placehold.co/40x40.png?text=${rankerUser.nickname.substring(0,1)}`} alt={rankerUser.nickname} width={40} height={40} className="rounded-full" data-ai-hint="fantasy character icon" />
                        <AvatarFallback className="bg-muted text-muted-foreground">{rankerUser.nickname.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <span className={finalNicknameSpanClass}>
                        {rankerUser.nickname}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-accent">{rankerUser.score.toLocaleString()} 점</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
