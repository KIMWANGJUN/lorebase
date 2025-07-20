
// src/app/(main)/admin/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Edit, ShieldAlert, FileCode, Gift, BarChartBig, LockKeyhole } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import type { User, Post, Inquiry, StarterProject, AssetInfo } from '@/types';

// Mock data is replaced with state that would be populated by API calls
const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  return (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="text-foreground">사용자 관리</CardTitle><CardDescription className="text-muted-foreground">사용자 제재 및 정보 수정</CardDescription></CardHeader>
      <CardContent>
        {/* 사용자 관리 테이블 */}
      </CardContent>
    </Card>
  );
}

const ManageContent = ({ title, description, items, type }: { title: string, description: string, items: any[], type: 'starter' | 'asset' | 'post' }) => {
    const [contentItems, setContentItems] = useState<any[]>([]);
    return (
        <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">{title}</CardTitle><CardDescription className="text-muted-foreground">{description}</CardDescription></CardHeader>
            <CardContent>
            {/* 컨텐츠 관리 UI */}
            </CardContent>
        </Card>
    )
};

const ManageInquiries = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    return (
        <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">문의 관리</CardTitle><CardDescription className="text-muted-foreground">사용자 문의 응답 및 처리</CardDescription></CardHeader>
            <CardContent>
            {/* 문의 관리 테이블 */}
            </CardContent>
        </Card>
    )
};

const VerifyAdminStatus = ({ uid, onVerified }: { uid: string, onVerified: (isVerified: boolean) => void }) => {
    const [verificationStatus, setVerificationStatus] = useState('검증 중...');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid }),
                });
                if (!response.ok) {
                    throw new Error(`서버 응답 오류: ${response.statusText}`);
                }
                const data = await response.json();
                if (data.isAdmin) {
                    setVerificationStatus('✅ 관리자 권한 확인됨');
                    onVerified(true);
                } else {
                    setVerificationStatus('❌ 관리자 권한이 없습니다.');
                    onVerified(false);
                }
            } catch (error) {
                console.error('관리자 권한 검증 실패:', error);
                setVerificationStatus('⚠️ 검증 중 오류 발생');
                onVerified(false);
            }
        };

        if (uid) {
            verify();
        }
    }, [uid, onVerified]);

    return (
        <div className="flex items-center space-x-2">
            <LockKeyhole className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{verificationStatus}</p>
        </div>
    );
};


export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isServerSideVerified, setIsServerSideVerified] = useState(false);


  const [usersCount, setUsersCount] = useState(0);
  const [startersCount, setStartersCount] = useState(0);
  const [assetsCount, setAssetsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

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

  const bannerImageUrl = "https://placehold.co/1920x600.webp";

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

      {user?.id && <VerifyAdminStatus uid={user.id} onVerified={setIsServerSideVerified} />}

      {isServerSideVerified ? (
        <Tabs defaultValue="overview" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6 bg-card border-border">
                {/* 탭 트리거 */}
            </TabsList>
            {/* 탭 컨텐츠 */}
        </Tabs>
      ) : (
        <Card className="mt-4">
            <CardHeader><CardTitle>권한 확인 중...</CardTitle></CardHeader>
            <CardContent>
                <p>백엔드에서 관리자 권한을 확인하고 있습니다. 잠시만 기다려주세요...</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
