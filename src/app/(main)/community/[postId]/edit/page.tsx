
// src/app/(main)/tavern/[postId]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/form/button';
import { Card } from '@/components/ui/layout/card';
import PostForm from '@/components/shared/PostForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import type { Post } from '@/types';
import { getPost, updatePost } from '@/lib/postApi';
import { ArrowLeft, Edit3 } from 'lucide-react';

export default function EditPostPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const postId = typeof params.postId === 'string' ? params.postId : '';

  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast({ title: "오류", description: "로그인이 필요합니다.", variant: "destructive" });
      router.push('/login');
      return;
    }

    if (!postId) {
        toast({ title: "오류", description: "잘못된 접근입니다.", variant: "destructive" });
        router.push('/community/general');
        return;
    }
    
    getPost(postId).then(post => {
        if (post) {
            if (post.author.id !== user.id && !isAdmin) {
                toast({ title: "권한 없음", description: "이 게시글을 수정할 권한이 없습니다.", variant: "destructive" });
                router.push(`/community/${post.mainCategory}/${postId}`);
                return;
            }
            setPostToEdit(post);
        } else {
            toast({ title: "오류", description: "게시글을 찾을 수 없습니다.", variant: "destructive" });
            router.push('/community/general');
        }
        setPageLoading(false);
    });
  }, [postId, user, isAdmin, authLoading, router, toast]);

  const handleSubmit = async (data: Partial<Omit<Post, 'id'>>) => {
    if (!postToEdit) return;

    setIsLoading(true);

    try {
        await updatePost(postToEdit.id, { ...data, isEdited: true });
        toast({ title: "성공!", description: "게시글이 성공적으로 수정되었습니다." });
        router.push(`/community/${postToEdit.mainCategory}/${postToEdit.id}`);
    } catch (error) {
        console.error("Failed to update post:", error);
        toast({ title: "오류", description: "게시글 수정에 실패했습니다.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  if (authLoading || pageLoading || !postToEdit) {
    return <div className="container mx-auto py-8 px-4 text-center">페이지를 불러오는 중...</div>;
  }

  const bannerImageUrl = "https://placehold.co/1920x600.webp";

  return (
    <div className="container mx-auto py-8 px-4">
      <section
        className="text-center py-16 md:py-24 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="editing scroll magic"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg flex items-center justify-center">
            <Edit3 className="h-10 w-10 mr-3 text-accent" />
            게시글 수정
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">게시글 내용을 수정합니다.</p>
        </div>
      </section>

      <Button asChild variant="outline" className="mb-6 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
        <Link href={`/tavern/${postId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          게시글로 돌아가기
        </Link>
      </Button>

      <Card className="shadow-xl bg-card border-border">
        <PostForm
          initialData={postToEdit}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="수정 완료"
        />
      </Card>
    </div>
  );
}
