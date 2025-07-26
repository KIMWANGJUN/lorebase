"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPostById, updatePostViews } from '@/lib/postApi';
import { getComments } from '@/lib/commentApi';
import { useAuth } from '@/contexts/AuthContext';
import type { Post, Comment, User as UserType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, ThumbsUp, ThumbsDown, MessageSquare, Eye, Pin, Clock, User as UserIcon } from 'lucide-react';
import { deletePost } from '@/lib/postApi';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CommentSection from '@/components/shared/CommentSection';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { COMMUNITY_CHANNELS, getChannelBySlug } from '@/lib/communityChannels';
import { Timestamp } from 'firebase/firestore';

// Timestamp 타입 가드 함수
function isTimestamp(value: any): value is Timestamp {
  return value && typeof value.toDate === 'function';
}

function PostContent() {
  const { postId } = useParams();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof postId === 'string') {
      const fetchData = async () => {
        try {
          const fetchedPost = await getPostById(postId);
          if (fetchedPost) {
            setPost(fetchedPost);
            
            // 댓글 가져오기
            const fetchedComments = await getComments(postId);
            setComments(fetchedComments);
            
            // Increment views only once per session
            const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
            if (!viewedPosts.includes(postId)) {
              await updatePostViews(postId);
              sessionStorage.setItem('viewedPosts', JSON.stringify([...viewedPosts, postId]));
            }
          } else {
            toast({ title: "오류", description: "게시글을 찾을 수 없습니다.", variant: "destructive" });
            router.push('/community/channels/general');
          }
        } catch (error) {
          console.error("Error fetching post:", error);
          toast({ title: "오류", description: "게시글을 불러오는 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [postId, router, toast]);

  const handleDelete = async () => {
    if (!post) return;
    try {
      await deletePost(post.id);
      toast({ title: "성공", description: "게시글이 삭제되었습니다." });
      router.push(`/community/channels/${post.mainCategory}`);
    } catch (error) {
      toast({ title: "오류", description: "게시글 삭제에 실패했습니다.", variant: "destructive" });
    }
  };

  if (loading) {
    return <PostPageSkeleton />;
  }

  if (!post) {
    return <div className="container mx-auto py-8 px-4 text-center">게시글을 찾을 수 없습니다.</div>;
  }

  const currentChannel = getChannelBySlug(post.mainCategory) || COMMUNITY_CHANNELS[0];

  // 안전한 날짜 처리
  const getPostDate = () => {
    if (isTimestamp(post.createdAt)) {
      return post.createdAt.toDate();
    } else if (post.createdAt instanceof Date) {
      return post.createdAt;
    } else {
      return new Date(); // 기본값
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
          <Link href={`/community/channels/${post.mainCategory}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl bg-card border-border">
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {post.isPinned && <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent"><Pin className="h-3 w-3 mr-1" /> 고정됨</Badge>}
                <Badge variant="outline">{post.type}</Badge>
              </div>
              <CardTitle className="text-3xl font-bold font-headline text-foreground">{post.title}</CardTitle>
              <div className="flex items-center mt-4 text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-border">
                    <AvatarImage src={post.author.avatar} alt={post.author.nickname} />
                    <AvatarFallback>{post.author.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <NicknameDisplay user={post.author} context="postAuthor" postMainCategoryForAuthor={post.mainCategory} />
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <FormattedDateDisplay date={getPostDate()} />
                  {post.isEdited && <span className="text-xs ml-1">(수정됨)</span>}
                </div>
              </div>
            </div>
            {(user?.id === post.author.id || isAdmin) && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/community/posts/${post.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> 수정
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>게시글 삭제 확인</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{post.title}" 게시글을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>아니오</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>예, 삭제합니다</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          <div
            className="prose dark:prose-invert max-w-none text-foreground text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
        <Separator />
        <CardFooter className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" /> {post.upvotes}</span>
            <span className="flex items-center gap-1.5"><ThumbsDown className="h-4 w-4" /> {post.downvotes}</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {post.commentCount}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {post.views}</span>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <CommentSection postId={post.id} initialComments={comments} />
      </div>
    </div>
  );
}

function PostPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="shadow-xl bg-card border-border">
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-9 w-3/4" />
              <div className="flex items-center mt-4 text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
        </CardContent>
        <Separator />
        <CardFooter className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4 text-muted-foreground">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
          </div>
        </CardFooter>
      </Card>
      <div className="mt-8">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<PostPageSkeleton />}>
      <PostContent />
    </Suspense>
  );
}
