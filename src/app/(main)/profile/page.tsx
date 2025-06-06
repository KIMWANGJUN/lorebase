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
import { Edit3, Mail, MessageSquare, ShieldAlert, UserCog, ShieldX, Star, CheckCircle, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/types';
import { mockRankings, mockPosts, mockInquiries, mockUsers } from '@/lib/mockData'; // Assuming inquiries are related to user
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
    setNicknameChangeAllowed(false); // Update UI immediately
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
    return <div className="container mx-auto py-8 px-4 text-center">프로필 정보를 불러오는 중...</div>;
  }

  const userPosts = mockPosts.filter(p => p.authorId === user.id);
  const userInquiries = mockInquiries.filter(iq => iq.userId === user.id);

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8 shadow-xl overflow-hidden">
        <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-primary to-accent p-8 flex flex-col items-center justify-center text-primary-foreground">
                <Avatar className="w-32 h-32 mb-4 border-4 border-background shadow-lg">
                    <AvatarImage src={user.avatar || `https://placehold.co/200x200.png?text=${user.nickname.substring(0,1)}`} alt={user.nickname} />
                    <AvatarFallback className="text-4xl">{user.nickname.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h1 className={cn("text-3xl font-bold font-headline", isAdmin && "text-yellow-300")}>{user.nickname}</h1>
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
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6">
                        <TabsTrigger value="info"><UserCog className="inline-block h-4 w-4 mr-1 md:mr-2" />내 정보</TabsTrigger>
                        <TabsTrigger value="activity"><MessageSquare className="inline-block h-4 w-4 mr-1 md:mr-2" />활동</TabsTrigger>
                        <TabsTrigger value="inquiries"><ShieldAlert className="inline-block h-4 w-4 mr-1 md:mr-2" />문의함</TabsTrigger>
                        {/* <TabsTrigger value="dms">귓속말</TabsTrigger> */}
                        {/* <TabsTrigger value="blocked">차단 목록</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="info">
                        <Card>
                            <CardHeader><CardTitle>계정 정보 수정</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="nickname">닉네임</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={!isEditingNickname} />
                                        {isEditingNickname ? (
                                            <Button onClick={handleNicknameSave} size="sm"><CheckCircle className="h-4 w-4 mr-1"/> 저장</Button>
                                        ) : (
                                            <Button onClick={() => setIsEditingNickname(true)} variant="outline" size="sm" disabled={!nicknameChangeAllowed}><Edit3 className="h-4 w-4 mr-1"/> 변경</Button>
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
                                    <Label htmlFor="email">이메일</Label>
                                    <div className="flex items-center gap-2">
                                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                      <Button onClick={handleEmailSave} variant="outline" size="sm"><CheckCircle className="h-4 w-4 mr-1"/> 저장</Button>
                                    </div>
                                </div>
                                {/* Add other fields like avatar upload here */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity">
                         <Card>
                            <CardHeader><CardTitle>내 활동 내역</CardTitle></CardHeader>
                            <CardContent>
                                <h3 className="font-semibold mb-2">작성한 게시글 ({userPosts.length})</h3>
                                {userPosts.length > 0 ? (
                                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                                        {userPosts.map(p => <li key={p.id} className="text-sm p-2 bg-muted/50 rounded-md hover:bg-muted"><Link href={`/tavern/#post-${p.id}`}>{p.title}</Link></li>)}
                                    </ul>
                                ) : <p className="text-sm text-muted-foreground">작성한 게시글이 없습니다.</p>}
                                {/* Add comments, upvotes etc. */}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="inquiries">
                        <Card>
                            <CardHeader><CardTitle>내 문의 내역</CardTitle></CardHeader>
                             <CardContent>
                                {userInquiries.length > 0 ? (
                                    <ul className="space-y-3 max-h-80 overflow-y-auto">
                                        {userInquiries.map(iq => (
                                            <li key={iq.id} className="p-3 border rounded-md">
                                                <p className="font-semibold">{iq.title} <span className={`text-xs px-2 py-0.5 rounded-full ${iq.status === 'Answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{iq.status}</span></p>
                                                <p className="text-xs text-muted-foreground">{new Date(iq.createdAt).toLocaleString()}</p>
                                                {iq.response && <p className="text-sm mt-1 pt-1 border-t">답변: {iq.response}</p>}
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
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">커뮤니티 랭킹</h2>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">전체 사용자 순위</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {mockRankings.filter(r => r.rank > 0 || r.userId === user.id).map((ranker) => ( // Show all ranked users or current user
                <div key={ranker.userId} className={`flex items-center justify-between p-3 rounded-lg ${ranker.userId === user.id ? 'bg-primary/10 border border-primary shadow-md' : 'bg-muted/30'}`}>
                  <div className="flex items-center gap-3">
                    <span className={cn("font-bold text-lg w-8 text-center", getRankClass(ranker.rank))}>
                        {ranker.rank > 0 ? `${ranker.rank}.` : <Star className="h-5 w-5 inline text-yellow-400" />}
                    </span>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ranker.avatar || `https://placehold.co/40x40.png?text=${ranker.nickname.substring(0,1)}`} />
                      <AvatarFallback>{ranker.nickname.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span className={cn("font-medium", getRankClass(ranker.rank), mockUsers.find(u => u.id === ranker.userId)?.username === 'WANGJUNLAND' && 'text-admin')}>{ranker.nickname}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{ranker.score.toLocaleString()} 점</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
