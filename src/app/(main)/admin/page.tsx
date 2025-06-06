// src/app/(main)/admin/page.tsx
"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Edit, ShieldAlert, Settings, Annoyed, FileCode, Gift, BarChartBig } from 'lucide-react';
import { mockStarterProjects, mockAssetInfos, mockUsers, mockInquiries, mockPosts } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Placeholder components for admin sections
const ManageUsers = () => (
  <Card>
    <CardHeader><CardTitle>사용자 관리</CardTitle><CardDescription>사용자 제재 및 정보 수정</CardDescription></CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>아이디</TableHead><TableHead>닉네임</TableHead><TableHead>이메일</TableHead><TableHead>점수</TableHead><TableHead>상태</TableHead><TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell><TableCell>{user.nickname}</TableCell><TableCell>{user.email || '-'}</TableCell><TableCell>{user.score}</TableCell>
              <TableCell><Badge variant={user.isBlocked ? "destructive" : "secondary"}>{user.isBlocked ? "차단됨" : "활성"}</Badge></TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">수정</Button>
                <Button variant={user.isBlocked ? "secondary" : "destructive"} size="sm">{user.isBlocked ? "차단 해제" : "차단"}</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const ManageContent = ({ title, description, items, type }: { title: string, description: string, items: any[], type: 'starter' | 'asset' | 'post' }) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
    <CardContent>
      <Button className="mb-4">새 {type === 'starter' ? '프로젝트' : type === 'asset' ? '에셋' : '게시글'} 추가</Button>
      <Table>
        <TableHeader><TableRow><TableHead>이름/제목</TableHead><TableHead>타입/엔진</TableHead><TableHead>작업</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.slice(0,5).map(item => ( // Show limited items for brevity
            <TableRow key={item.id}>
              <TableCell>{item.name || item.title}</TableCell>
              <TableCell>{item.engine || item.type}</TableCell>
              <TableCell><Button variant="outline" size="sm" className="mr-2">수정</Button><Button variant="destructive" size="sm">삭제</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const ManageInquiries = () => (
 <Card>
    <CardHeader><CardTitle>문의 관리</CardTitle><CardDescription>사용자 문의 응답 및 처리</CardDescription></CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow><TableHead>사용자</TableHead><TableHead>제목</TableHead><TableHead>상태</TableHead><TableHead>날짜</TableHead><TableHead>작업</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {mockInquiries.map(inquiry => (
            <TableRow key={inquiry.id}>
              <TableCell>{inquiry.userNickname}</TableCell><TableCell>{inquiry.title}</TableCell>
              <TableCell><Badge variant={inquiry.status === 'Answered' ? 'default': inquiry.status === 'Pending' ? 'outline' : 'secondary'}>{inquiry.status}</Badge></TableCell>
              <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
              <TableCell><Button variant="outline" size="sm">답변/수정</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);


export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/'); // Redirect if not admin
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">관리자 정보를 확인 중...</div>;
  }
  if (!isAdmin) {
     return <div className="container mx-auto py-8 px-4 text-center">접근 권한이 없습니다.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="text-center py-12 mb-10 bg-gradient-to-r from-destructive to-red-700 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary-foreground">관리자 대시보드</h1>
        <p className="text-lg text-primary-foreground/90 mt-2">커뮤니티 설정을 관리하고 운영합니다.</p>
      </section>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
          <TabsTrigger value="overview"><BarChartBig className="inline-block h-4 w-4 mr-1 md:mr-2" />개요</TabsTrigger>
          <TabsTrigger value="users"><Users className="inline-block h-4 w-4 mr-1 md:mr-2" />사용자 관리</TabsTrigger>
          <TabsTrigger value="starters"><FileCode className="inline-block h-4 w-4 mr-1 md:mr-2" />스타터 관리</TabsTrigger>
          <TabsTrigger value="assets"><Gift className="inline-block h-4 w-4 mr-1 md:mr-2" />에셋 관리</TabsTrigger>
          <TabsTrigger value="posts"><Edit className="inline-block h-4 w-4 mr-1 md:mr-2" />게시글 관리</TabsTrigger>
          <TabsTrigger value="inquiries"><ShieldAlert className="inline-block h-4 w-4 mr-1 md:mr-2" />문의 관리</TabsTrigger>
          {/* <TabsTrigger value="settings"><Settings className="inline-block h-4 w-4 mr-1 md:mr-2" />사이트 설정</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>사이트 개요</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-primary/5"><CardHeader><CardTitle className="text-sm">총 사용자</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{mockUsers.length}</p></CardContent></Card>
                <Card className="bg-secondary/5"><CardHeader><CardTitle className="text-sm">스타터 프로젝트</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{mockStarterProjects.length}</p></CardContent></Card>
                <Card className="bg-accent/5"><CardHeader><CardTitle className="text-sm">무료 에셋</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{mockAssetInfos.filter(a=>a.isFree).length}</p></CardContent></Card>
                <Card className="bg-destructive/5"><CardHeader><CardTitle className="text-sm">총 게시글</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{mockPosts.length}</p></CardContent></Card>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users"><ManageUsers /></TabsContent>
        <TabsContent value="starters"><ManageContent title="스타터 프로젝트 관리" description="게임 엔진별 스타터 프로젝트 추가, 수정, 삭제" items={mockStarterProjects} type="starter" /></TabsContent>
        <TabsContent value="assets"><ManageContent title="무료 에셋 정보 관리" description="무료 에셋 사이트 목록 및 정보 관리" items={mockAssetInfos} type="asset" /></TabsContent>
        <TabsContent value="posts"><ManageContent title="게시글 관리" description="공지사항 작성, 게시글 상단 고정 및 관리" items={mockPosts} type="post" /></TabsContent>
        <TabsContent value="inquiries"><ManageInquiries /></TabsContent>
        {/* <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>사이트 설정</CardTitle></CardHeader>
            <CardContent><p>사이트 주요 설정 변경 (구현 예정)</p></CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}

