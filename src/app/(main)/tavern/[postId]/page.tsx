
// src/app/(main)/tavern/[postId]/page.tsx
"use client";

import { mockPosts, mockUsers, mockComments as globalMockComments } from '@/lib/mockData';
import type { Post, Comment as CommentType, User as UserType, PostMainCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Pin, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MiniPostList from '@/components/shared/MiniPostList';
import CommentSection from '@/components/shared/CommentSection';
import React, { useEffect, useState, useMemo, type FC } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import NicknameDisplay from '@/components/shared/NicknameDisplay';


export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const postId = typeof params.postId === 'string' ? params.postId : undefined;

  const [post, setPost] = useState<Post | null | undefined>(undefined);

  const initialCommentsForPost = useMemo(() => {
    if (!postId) return [];
    const commentsForThisPost = globalMockComments.filter(c => c.postId === postId);
    const commentMap: { [id: string]: CommentType & { replies: CommentType[] } } = {};
    const topLevelComments: CommentType[] = [];

    commentsForThisPost.forEach(c => {
      commentMap[c.id] = { ...c, replies: c.replies || [] };
    });

    commentsForThisPost.forEach(c => {
      const currentCommentInMap = commentMap[c.id];
      currentCommentInMap.replies = [];

      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies = commentMap[c.parentId].replies || [];
        if (!commentMap[c.parentId].replies.find(r => r.id === c.id)) {
            commentMap[c.parentId].replies.push(currentCommentInMap);
        }
      } else if (!c.parentId) {
        if (!topLevelComments.find(tlc => tlc.id === c.id)) {
            topLevelComments.push(currentCommentInMap);
        }
      }
    });

    Object.values(commentMap).forEach(c => {
        if (c.replies) {
            c.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
    });
    topLevelComments.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return topLevelComments;
  }, [postId]);


  useEffect(() => {
    if (postId) {
      const foundPost = mockPosts.find(p => p.id === postId);
      setPost(foundPost || null);
      if (foundPost && typeof window !== 'undefined' && !sessionStorage.getItem(`viewed_${postId}`)) {
        const postIndex = mockPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            mockPosts[postIndex].views +=1;
        }
        sessionStorage.setItem(`viewed_${postId}`, 'true');
        setPost(prev => prev ? {...prev, views: prev.views + 1} : null);
      }
    }
  }, [postId]);

  const totalCommentCount = useMemo(() => {
    const count = (comments: CommentType[]): number => {
      return comments.reduce((acc, comment) => {
        return acc + 1 + (comment.replies ? count(comment.replies) : 0);
      }, 0);
    };
    return count(initialCommentsForPost);
  }, [initialCommentsForPost]);


  if (post === undefined) {
    return <div className="container mx-auto py-8 px-4 text-center text-foreground">게시글을 불러오는 중...</div>;
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">게시글을 찾을 수 없습니다.</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/tavern">목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const authorUser = mockUsers.find(u => u.id === post.authorId);
  const getInitials = (name: string) => name ? name.substring(0, 1).toUpperCase() : 'U';

  const postDateToShow = post.isEdited && post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt);
  const formattedDate = `${postDateToShow.getFullYear()}년 ${postDateToShow.getMonth() + 1}월 ${postDateToShow.getDate()}일 ${postDateToShow.getHours()}시 ${postDateToShow.getMinutes()}분`;

  const isNotice = post.type === 'Notice' || post.type === 'Announcement';
  const canEdit = currentUser && (currentUser.id === post.authorId || (isAdmin && post.authorId === 'admin'));


  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline" className="text-sm"> {/* CHZZK: ~14px for buttons */}
          <Link href="/tavern">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
        {canEdit && (
          <Button asChild variant="outline" className="text-sm"> {/* CHZZK: ~14px for buttons */}
            <Link href={`/tavern/${post.id}/edit`}>
              <Edit3 className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
        )}
      </div>


      <Card className={cn(
        "mb-8 shadow-lg bg-card border-border",
        post.isPinned && "border-t-4 border-primary",
        isNotice && "bg-primary/10 border-primary/50"
      )}>
        <CardHeader>
          <div className="flex justify-between items-start">
             {/* CHZZK: 18-24px bold for post title */}
            <CardTitle className="text-2xl font-bold flex items-center text-foreground">
              {post.isPinned && <Pin className="h-6 w-6 mr-2 text-primary" />}
              {isNotice && <MessageSquare className="h-6 w-6 mr-2 text-primary" />}
              {post.title}
              {post.isEdited && <span className="ml-2 text-xs font-normal text-muted-foreground">(수정됨)</span>}
            </CardTitle>
          </div>
          <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorUser?.avatar || `https://placehold.co/40x40.png?text=${getInitials(post.authorNickname)}`} alt={post.authorNickname} />
              <AvatarFallback className="bg-muted">{getInitials(post.authorNickname)}</AvatarFallback>
            </Avatar>
            <div>
              {/* CHZZK: ~16px bold for author nickname on post page */}
               {authorUser ? <NicknameDisplay user={authorUser} context="postAuthor" postMainCategoryForAuthor={post.mainCategory} /> : <span className="text-base font-bold text-foreground">{post.authorNickname}</span>}
              <div className="text-xs text-muted-foreground mt-0.5"> {/* CHZZK: ~10-11px for metadata */}
                <span>{formattedDate}</span>
                <span className="mx-1">·</span>
                <span className="capitalize">{post.type}</span>
              </div>
            </div>
          </div>
        </CardHeader>
         {/* CHZZK: ~13-14px normal for post content */}
        <CardContent className="prose max-w-none text-sm text-foreground">
          <div className="whitespace-pre-wrap">{post.content}</div>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground border-t pt-4 mt-4">
           <div className="flex gap-4 items-center text-xs"> {/* CHZZK: ~11-12px for post stats */}
            <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1" /> {post.upvotes}</span>
            <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {totalCommentCount}</span>
            <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> {post.views}</span>
          </div>
           {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-[10px] bg-secondary text-secondary-foreground rounded-full">{tag}</span> // CHZZK: ~10-11px for tags
              ))}
            </div>
          )}
        </CardFooter>
      </Card>

      {authorUser && <CommentSection postId={post.id} initialComments={initialCommentsForPost} postMainCategory={post.mainCategory} />}

      <MiniPostList allPosts={mockPosts} currentPostId={post.id} />
    </div>
  );
}
