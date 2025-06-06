// src/app/(main)/profile/page.tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Mail, MessageSquare, ShieldAlert, UserCog, ShieldX, Star, CheckCircle, Clock, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/types';
import { mockRankings, mockPosts, mockInquiries, mockUsers } from '@/lib/mockData'; 
import { cn } from '@/lib/utils';

const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return '';
};

export default function ProfilePage() {
  const { user, isAdmin, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  
  const canChangeNickname = () => {
    if (!user?.nicknameLastChanged || isAdmin) return true;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return new Date().getTime() - new Date(user.nicknameLastChanged).getTime() > thirtyDays;
  };
  const [nicknameChangeAllowed, setNicknameChangeAllowed] = useState(canChangeNickname());
  const nextChangeDate = user?.nicknameLastChanged ? new Date(new Date(user.nicknameLastChanged).getTime() + (30 * 24 * 60 * 60 * 1000)) : null;


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setNickname(user.nickname);
      setEmail(user.email || '');
      setNicknameChangeAllowed(canChangeNickname());
    }
  }, [user, authLoading, router]);

  const handleNicknameSave = () => {
    if (!user) return;
    if (!nickname.trim()) {
        toast({ title: "오류", description: "닉네임은 비워둘 수 없습니다.", variant: "destructive"});
        return;
    }
    updateUser({ nickname, nicknameLastChanged: new Date() });
    setIsEditingNickname(false);
    setNicknameChangeAllowed(false); 
    toast({ title: "성공", description: "닉네임이 변경되었습니다." });
  };

  const handleEmailSave = () => {
    if (!user) return;
     if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
        toast({ title: "오류", description: "유효한 이메일 주소를 입력해주세요.", variant: "destructive"});
        return;
    }
    updateUser({ email });
    toast({ title: "성공", description: "이메일이 등록/수정되었습니다." });
  };
  
  if (authLoading || !user) {
    return <div className="container mx-auto py-8 px-4 text-center text-foreground">프로필 정보를 불러오는 중...</div>;
  }

  const userPosts = mockPosts.filter(p => p.authorId === user.id);
  const userInquiries = mockInquiries.filter(iq => iq.userId === user.id);

  const bannerImageUrl = "https://placehold.co/1920x600.png";

  return (
    <div className="container mx-auto py-10 px-4">
       <section 
        className="py-16 md:py-24 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="personal coat_of_arms"
      >
        <div className="absolute inset-0 bg-black/50 rounded-xl z-0"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg">내 프로필</h1>
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
                <h1 className={cn("text-3xl font-bold font-headline", isAdmin && "text-gradient-gold-fire")}>{user.nickname}</h1>
                <p className="text-sm opacity-80">{user.email || "이메일 미등록"}</p>
                <div className="mt-4 text-center">
                    <p className="text-2xl font-semibold">{user.score.toLocaleString()} 점</p>
                    <p className={cn("text-lg", getRankClass(user.rank))}>
                        {isAdmin ? "관리자" : user.rank > 0 ? `랭킹 ${user.rank}위` : "랭킹 정보 없음"}
                    </p>
                </div>
            </div>
            <div className="md:w-2/3 p-8">
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 mb-6 bg-card border-border">
                        <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><UserCog className="inline-block h-4 w-4 mr-1 md:mr-2" />내 정보</TabsTrigger>
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
                                            <Button onClick={() => setIsEditingNickname(true)} variant="outline" size="sm" disabled={!nicknameChangeAllowed} className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent"><Edit3 className="h-4 w-4 mr-1"/> 변경</Button>
                                        )}
                                    </div>
                                    {!nicknameChangeAllowed && !isAdmin && nextChangeDate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <Clock className="inline-block h-3 w-3 mr-1"/> 
                                            다음 닉네임 변경은 {nextChangeDate.toLocaleDateString()} 이후에 가능합니다.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-muted-foreground">이메일</Label>
                                    <div className="flex items-center gap-2">
                                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input border-border text-foreground focus:ring-accent"/>
                                      <Button onClick={handleEmailSave} variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent"><CheckCircle className="h-4 w-4 mr-1"/> 저장</Button>
                                    </div>
                                </div>
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
            <CardTitle className="font-headline text-foreground">전체 사용자 순위</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto p-1">
              {mockRankings.filter(r => r.rank > 0 || r.userId === user.id).map((ranker) => ( 
                <div key={ranker.userId} className={`flex items-center justify-between p-3 rounded-lg border ${ranker.userId === user.id ? 'bg-primary/10 border-primary shadow-md' : 'bg-background/30 border-border/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={cn("font-bold text-lg w-8 text-center", getRankClass(ranker.rank))}>
                        {ranker.rank > 0 ? `${ranker.rank}.` : <Star className="h-5 w-5 inline text-yellow-400" />}
                    </span>
                    <Avatar className="h-10 w-10 border-2 border-accent/50">
                      <AvatarImage src={ranker.avatar || `https://placehold.co/40x40.png?text=${ranker.nickname.substring(0,1)}`} data-ai-hint="fantasy character icon" />
                      <AvatarFallback className="bg-muted text-muted-foreground">{ranker.nickname.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span className={cn("font-medium text-foreground", getRankClass(ranker.rank), mockUsers.find(u => u.id === ranker.userId)?.username === 'WANGJUNLAND' && 'text-admin')}>{ranker.nickname}</span>
                  </div>
                  <span className="text-sm font-semibold text-accent">{ranker.score.toLocaleString()} 점</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
