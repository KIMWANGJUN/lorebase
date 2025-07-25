
// src/components/profile/UserProfileView.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import type { User, Post } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Button } from '@/components/ui/form/button';
import { ShieldCheck, Users, Clock } from 'lucide-react';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';

interface UserProfileViewProps {
  profileUser: User;
  userPosts: Post[];
  isOwnProfile: boolean;
}

export default function UserProfileView({ profileUser, userPosts, isOwnProfile }: UserProfileViewProps) {
  return (
    <div className="container mx-auto py-10 px-4">
      {/* Profile Banner */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col items-center md:flex-row gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
              <AvatarImage src={profileUser.avatar} alt={profileUser.nickname} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {profileUser.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <NicknameDisplay user={profileUser} context="profileCard" />
                {profileUser.isAdmin && (
                  <div className="inline-flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-1 rounded-md text-xs font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    관리자
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{profileUser.email}</p>
              {profileUser.createdAt instanceof Timestamp && (
                 <p className="text-xs text-muted-foreground mt-1">
                    가입일: <FormattedDateDisplay date={profileUser.createdAt.toDate()} />
                </p>
              )}
            </div>
            {isOwnProfile && (
              <div className="md:ml-auto">
                <Link href="/profile">
                  <Button variant="outline">내 프로필 관리</Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* User Posts */}
      <Card>
        <CardHeader>
          <CardTitle>{profileUser.nickname}님의 게시물 ({userPosts.length})</CardTitle>
          <CardDescription>이 사용자가 작성한 모든 게시물입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Link key={post.id} href={`/tavern/${post.id}`} className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {post.mainCategory}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.createdAt instanceof Timestamp && <FormattedDateDisplay date={post.createdAt.toDate()} />}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      조회 {post.views || 0}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">작성한 게시물이 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
