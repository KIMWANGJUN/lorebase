// src/app/(main)/community/posts/[postId]/edit/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/form/button';
import { Card } from '@/components/ui/layout/card';
import PostForm from '@/components/shared/PostForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import type { Post, PostMainCategory } from '@/types';
import { getPostById, updatePost } from '@/lib/postApi';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/data-display/skeleton';

type PostFormData = Omit<Post, 'id' | 'author' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'views' | 'commentCount' | 'tags' | 'isPinned' | 'isEdited' | 'postScore' | 'replies'> & { authorId: string, authorNickname: string, authorAvatar?: string, mainCategory: PostMainCategory };

function EditPostContent() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { postId } = useParams();
  const { toast } = useToast();
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (typeof postId !== 'string') return;

    const fetchPost = async () => {
      try {
        const post = await getPostById(postId);
        if (!post) {
          toast({ title: "오류", description: "게시글을 찾을 수 없습니다.", variant: "destructive" });
          router.push('/community/channels/general');
          return;
        }
        if (post.author.id !== user?.id && !isAdmin) {
          toast({ title: "권한 없음", description: "이 게시글을 수정할 권한이 없습니다.", variant: "destructive" });
          router.push(`/community/posts/${postId}`);
          return;
        }
        setPostToEdit(post);
      } catch (error) {
        toast({ title: "오류", description: "게시글을 불러오는 데 실패했습니다.", variant: "destructive" });
        router.push('/community/channels/general');
      } finally {
        setIsFetching(false);
      }
    };

    if (!authLoading) {
      fetchPost();
    }
  }, [postId, user, isAdmin, authLoading, router, toast]);

  const handleSubmit = async (data: PostFormData) => {
    if (!postToEdit) return;
    setIsLoading(true);
    try {
      await updatePost(postToEdit.id, data);
      toast({ title: "성공!", description: "게시글이 성공적으로 수정되었습니다." });
      router.push(`/community/posts/${postToEdit.id}`);
    } catch (error) {
      console.error("Failed to update post:", error);
      toast({ title: "오류", description: "게시글 수정에 실패했습니다.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || authLoading) {
    return <EditPostPageSkeleton />;
  }

  if (!postToEdit) {
    return <div className="container mx-auto py-8 px-4 text-center">게시글 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="text-center py-16 md:py-24 rounded-xl shadow-xl mb-10 relative bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground drop-shadow-lg flex items-center justify-center">
            <Edit3 className="h-10 w-10 mr-3 text-primary" />
            게시글 수정
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2 drop-shadow-sm">"{postToEdit.title}"</p>
        </div>
      </section>

      <Button asChild variant="outline" className="mb-6 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
        <Link href={`/community/posts/${postToEdit.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          게시글로 돌아가기
        </Link>
      </Button>

      <Card className="shadow-xl bg-card border-border">
        <PostForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={postToEdit}
          submitButtonText="수정 완료"
        />
      </Card>
    </div>
  );
}

function EditPostPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-48 md:h-64 rounded-xl shadow-xl mb-10" />
      <Skeleton className="h-10 w-48 mb-6" />
      <Card className="shadow-xl bg-card border-border">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<EditPostPageSkeleton />}>
      <EditPostContent />
    </Suspense>
  );
}
