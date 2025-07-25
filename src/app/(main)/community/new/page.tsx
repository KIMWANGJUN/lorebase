
// src/app/(main)/tavern/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/form/button';
import { Card } from '@/components/ui/layout/card';
import PostForm from '@/components/shared/PostForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import type { Post, PostMainCategory } from '@/types';
import { addPost } from '@/lib/postApi';
import { ArrowLeft, FilePlus2 } from 'lucide-react';
import { getChannelBySlug, COMMUNITY_CHANNELS } from '@/lib/communityChannels';

// This is the expected data type from PostForm's onSubmit
type PostFormData = Omit<Post, 'id' | 'author' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'views' | 'commentCount' | 'tags' | 'isPinned' | 'isEdited' | 'postScore' | 'replies'> & { authorId: string, authorNickname: string, authorAvatar?: string, mainCategory: PostMainCategory };


export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "로그인 필요", description: "글을 작성하려면 먼저 로그인해주세요.", variant: "destructive" });
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  const searchParams = useSearchParams();
  const channelSlug = searchParams.get('channel'); // URL에서 channel 쿼리 파라미터 가져오기
  const currentChannel = channelSlug ? getChannelBySlug(channelSlug) : COMMUNITY_CHANNELS.find(c => c.slug === 'general'); // 채널 정보 가져오기, 없으면 'general' 채널로 기본값 설정

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "로그인 필요", description: "글을 작성하려면 먼저 로그인해주세요.", variant: "destructive" });
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  const handleSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({ title: "오류", description: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }

    if (!currentChannel) {
      toast({ title: "오류", description: "유효하지 않은 채널 정보입니다.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // PostFormData에 mainCategory 추가
      const postDataWithCategory: PostFormData = {
        ...data,
        mainCategory: currentChannel.categories[0], // 채널의 첫 번째 카테고리를 게시글의 mainCategory로 설정
      };

      const newPostId = await addPost(postDataWithCategory);
      
      toast({ title: "성공!", description: "게시글이 성공적으로 등록되었습니다." });
      router.push(`/community/${currentChannel.slug}/${newPostId}`); // 채널 슬러그를 포함하여 리다이렉트
      
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({ title: "오류", description: "게시글 작성에 실패했습니다.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="container mx-auto py-8 px-4 text-center">페이지를 불러오는 중...</div>;
  }

  const bannerImageUrl = "https://placehold.co/1920x600.webp";

  return (
    <div className="container mx-auto py-8 px-4">
      <section
        className="text-center py-16 md:py-24 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="writing desk quill"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg flex items-center justify-center">
            <FilePlus2 className="h-10 w-10 mr-3 text-accent" />
            새 게시글 작성 ({currentChannel?.name || '알 수 없는 채널'})
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">커뮤니티에 새로운 이야기를 공유하세요.</p>
        </div>
      </section>

      <Button asChild variant="outline" className="mb-6 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
        <Link href={`/community/${currentChannel?.slug || 'general'}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </Button>

      <Card className="shadow-xl bg-card border-border">
        <PostForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="게시하기"
        />
      </Card>
    </div>
  );
}
