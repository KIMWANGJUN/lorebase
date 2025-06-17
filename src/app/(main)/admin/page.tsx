
// src/app/(main)/admin/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Edit, ShieldAlert, FileCode, Gift, BarChartBig } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import type { User, Post, Inquiry, StarterProject, AssetInfo } from '@/types';
// API imports would go here, e.g., import { getUsers, getPosts } from '@/lib/api';

// Mock data is replaced with state that would be populated by API calls
const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  // In a real app, you would fetch users:
  // useEffect(() => { getUsers().then(setUsers); }, []);
  return (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="text-foreground">사용자 관리</CardTitle><CardDescription className="text-muted-foreground">사용자 제재 및 정보 수정</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">아이디</TableHead><TableHead className="text-muted-foreground">닉네임</TableHead><TableHead className="text-muted-foreground">이메일</TableHead><TableHead className="text-muted-foreground">점수</TableHead><TableHead className="text-muted-foreground">상태</TableHead><TableHead className="text-muted-foreground">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id} className="border-border text-foreground">
                <TableCell>{user.username}</TableCell><TableCell>{user.nickname}</TableCell><TableCell>{user.email || '-'}</TableCell><TableCell>{user.score}</TableCell>
                <TableCell><Badge variant={user.isBlocked ? "destructive" : "secondary"} className={user.isBlocked ? "" : "bg-secondary/70 text-secondary-foreground"}>{user.isBlocked ? "차단됨" : "활성"}</Badge></TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">수정</Button>
                  <Button variant={user.isBlocked ? "secondary" : "destructive"} size="sm" className={user.isBlocked ? "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90" : ""}>{user.isBlocked ? "차단 해제" : "차단"}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const ManageContent = ({ title, description, items, type }: { title: string, description: string, items: any[], type: 'starter' | 'asset' | 'post' }) => {
    const [contentItems, setContentItems] = useState<any[]>([]);
    // useEffect(() => { fetchApi(type).then(setContentItems); }, [type]);
    return (
        <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">{title}</CardTitle><CardDescription className="text-muted-foreground">{description}</CardDescription></CardHeader>
            <CardContent>
            <Button className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">새 {type === 'starter' ? '프로젝트' : type === 'asset' ? '에셋' : '게시글'} 추가</Button>
            <Table>
                <TableHeader><TableRow className="border-border"><TableHead className="text-muted-foreground">이름/제목</TableHead><TableHead className="text-muted-foreground">타입/엔진</TableHead><TableHead className="text-muted-foreground">작업</TableHead></TableRow></TableHeader>
                <TableBody>
                {contentItems.slice(0,5).map(item => ( 
                    <TableRow key={item.id} className="border-border text-foreground">
                    <TableCell>{item.name || item.title}</TableCell>
                    <TableCell>{item.engine || item.type}</TableCell>
                    <TableCell><Button variant="outline" size="sm" className="mr-2 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">수정</Button><Button variant="destructive" size="sm">삭제</Button></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
};

const ManageInquiries = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    // useEffect(() => { getInquiries().then(setInquiries); }, []);
    return (
        <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">문의 관리</CardTitle><CardDescription className="text-muted-foreground">사용자 문의 응답 및 처리</CardDescription></CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow className="border-border"><TableHead className="text-muted-foreground">사용자</TableHead><TableHead className="text-muted-foreground">제목</TableHead><TableHead className="text-muted-foreground">상태</TableHead><TableHead className="text-muted-foreground">날짜</TableHead><TableHead className="text-muted-foreground">작업</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                {inquiries.map(inquiry => (
                    <TableRow key={inquiry.id} className="border-border text-foreground">
                    <TableCell>{inquiry.userNickname}</TableCell><TableCell>{inquiry.title}</TableCell>
                    <TableCell><Badge variant={inquiry.status === 'Answered' ? 'default': inquiry.status === 'Pending' ? 'outline' : 'secondary'} className={inquiry.status === 'Answered' ? 'bg-green-500/70 text-primary-foreground' : inquiry.status === 'Pending' ? 'bg-yellow-500/70 text-accent-foreground border-yellow-500' : 'bg-secondary/70 text-secondary-foreground'}>{inquiry.status}</Badge></TableCell>
                    <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">답변/수정</Button></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
};

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  // State for data that was previously mocked
  const [usersCount, setUsersCount] = useState(0);
  const [startersCount, setStartersCount] = useState(0);
  const [assetsCount, setAssetsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  // Here you would fetch the real data
  // useEffect(() => {
  //   if(isAdmin) {
  //     getUsers().then(data => setUsersCount(data.length));
  //     getStarterProjects().then(data => setStartersCount(data.length));
  //     getAssetInfos().then(data => setAssetsCount(data.filter(a => a.isFree).length));
  //     getPosts().then(data => setPostsCount(data.length));
  //   }
  // }, [isAdmin]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/'); 
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div className="text-center text-foreground py-8 px-4">관리자 정보를 확인 중...</div>;
  }
  if (!isAdmin) {
     return <div className="text-center text-foreground py-8 px-4">접근 권한이 없습니다.</div>;
  }

  const bannerImageUrl = "https://placehold.co/1920x600.png";

  return (
    <div className="py-8 px-4">
      <section 
        className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg">관리자 대시보드</h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">커뮤니티 설정을 관리하고 운영합니다.</p>
        </div>
      </section>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6 bg-card border-border">
          <TabsTrigger value="overview">
            <BarChartBig className="inline-block h-4 w-4 mr-1 md:mr-2" />개요
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="inline-block h-4 w-4 mr-1 md:mr-2" />사용자 관리
          </TabsTrigger>
          <TabsTrigger value="starters">
            <FileCode className="inline-block h-4 w-4 mr-1 md:mr-2" />스타터 관리
          </TabsTrigger>
           <TabsTrigger value="assets">
            <Gift className="inline-block h-4 w-4 mr-1 md:mr-2" />에셋 관리
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Edit className="inline-block h-4 w-4 mr-1 md:mr-2" />게시글 관리
          </TabsTrigger>
          <TabsTrigger value="inquiries">
            <ShieldAlert className="inline-block h-4 w-4 mr-1 md:mr-2" />문의 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">사이트 개요</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-primary/10 border-primary/30"><CardHeader><CardTitle className="text-sm text-primary">총 사용자</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground">{usersCount}</p></CardContent></Card>
                <Card className="bg-secondary/10 border-secondary/30"><CardHeader><CardTitle className="text-sm text-secondary">스타터 프로젝트</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground">{startersCount}</p></CardContent></Card>
                <Card className="bg-accent/10 border-accent/30"><CardHeader><CardTitle className="text-sm text-accent">무료 에셋</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground">{assetsCount}</p></CardContent></Card>
                <Card className="bg-destructive/10 border-destructive/30"><CardHeader><CardTitle className="text-sm text-destructive">총 게시글</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground">{postsCount}</p></CardContent></Card>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users"><ManageUsers /></TabsContent>
        <TabsContent value="starters"><ManageContent title="스타터 프로젝트 관리" description="게임 엔진별 스타터 프로젝트 추가, 수정, 삭제" items={[]} type="starter" /></TabsContent>
        <TabsContent value="assets"><ManageContent title="무료 에셋 정보 관리" description="무료 에셋 사이트 목록 및 정보 관리" items={[]} type="asset" /></TabsContent>
        <TabsContent value="posts"><ManageContent title="게시글 관리" description="공지사항 작성, 게시글 상단 고정 및 관리" items={[]} type="post" /></TabsContent>
        <TabsContent value="inquiries"><ManageInquiries /></TabsContent>
      </Tabs>
    </div>
  );
}
