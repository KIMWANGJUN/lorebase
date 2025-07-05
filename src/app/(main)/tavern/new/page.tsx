
// src/app/(main)/tavern/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PostForm from '@/components/shared/PostForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import type { Post } from '@/types';
import { addPost } from '@/lib/postApi';
import { ArrowLeft, FilePlus2 } from 'lucide-react';

// This is the expected data type from PostForm's onSubmit
type PostFormData = Omit<Post, 'id' | 'author' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'views' | 'commentCount' | 'tags' | 'isPinned' | 'isEdited' | 'postScore' | 'replies'> & { authorId: string, authorNickname: string, authorAvatar?: string };


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

  const handleSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({ title: "오류", description: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const newPostId = await addPost(data);
      
      toast({ title: "성공!", description: "게시글이 성공적으로 등록되었습니다." });
      router.push(`/tavern/${newPostId}`);
      
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

  const bannerImageUrl = "https://placehold.co/1920x600.png";

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
            새 게시글 작성
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">커뮤니티에 새로운 이야기를 공유하세요.</p>
        </div>
      </section>

      <Button asChild variant="outline" className="mb-6 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
        <Link href="/tavern">
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
