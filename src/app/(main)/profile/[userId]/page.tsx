// src/app/(main)/profile/[userId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, User, Calendar, Mail, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Badge } from '@/components/ui/data-display/badge';
import type { User as UserType } from '@/types';
import { getUser } from '@/lib/userApi';
import { toDate } from '@/lib/utils';
import NicknameDisplay from '@/components/shared/NicknameDisplay';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = params;
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 본인 프로필인 경우 메인 프로필 페이지로 리다이렉트
  useEffect(() => {
    if (currentUser?.id === userId) {
      router.push('/profile');
      return;
    }
  }, [currentUser, userId, router]);

  useEffect(() => {
    if (typeof userId === 'string' && currentUser?.id !== userId) {
      setLoading(true);
      getUser(userId)
        .then((fetchedUser: UserType | null) => {
          if (fetchedUser) {
            setProfileUser(fetchedUser);
          } else {
            setError("사용자를 찾을 수 없습니다.");
          }
        })
        .catch((err: any) => {
          console.error("Error fetching user data:", err);
          setError("프로필 정보를 불러오는 중 오류가 발생했습니다.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">프로필 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="container mx-auto py-10 px-4 text-center text-destructive">
        {error || "사용자 정보가 없습니다."}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* 프로필 헤더 */}
      <Card className="mb-8 shadow-xl overflow-hidden bg-card border-border">
        <div className="relative bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-primary/50 shadow-2xl">
                <AvatarImage src={profileUser.avatar || '/assets/images/malamute-icon.webp'} alt={profileUser.nickname} />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {profileUser.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <NicknameDisplay user={profileUser} context="profileCard" />
                {profileUser.isAdmin && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    관리자
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-4">@{profileUser.username}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                  <div className="text-2xl font-bold text-primary">{profileUser.score.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">총 점수</div>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                  <div className="text-2xl font-bold text-accent">#{profileUser.rank > 0 ? profileUser.rank : '∞'}</div>
                  <div className="text-sm text-muted-foreground">전체 랭킹</div>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                  <div className="text-2xl font-bold text-secondary">
                    {toDate(profileUser.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">가입일</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 사용자 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">사용자명</p>
                <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">가입일</p>
                <p className="text-sm text-muted-foreground">
                  {toDate(profileUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 소셜 프로필 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              소셜 프로필
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileUser.socialProfiles?.discord && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Discord</p>
                  <p className="text-sm text-muted-foreground">{profileUser.socialProfiles.discord}</p>
                </div>
              </div>
            )}
            
            {profileUser.socialProfiles?.youtube && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">YouTube</p>
                  <p className="text-sm text-muted-foreground">{profileUser.socialProfiles.youtube}</p>
                </div>
              </div>
            )}
            
            {!profileUser.socialProfiles?.discord && !profileUser.socialProfiles?.youtube && (
              <p className="text-muted-foreground text-center py-4">
                설정된 소셜 프로필이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
