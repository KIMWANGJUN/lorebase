// src/app/(main)/tavern/[postId]/page.tsx
"use client"; 

import { mockPosts, mockUsers, mockComments as globalMockComments } from '@/lib/mockData';
import type { Post, Comment as CommentType, User, PostMainCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Pin, Box, AppWindow, PenTool, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import MiniPostList from '@/components/shared/MiniPostList';
import CommentSection from '@/components/shared/CommentSection';
import { useEffect, useState, useMemo, type FC } from 'react';
import { useParams } from 'next/navigation';

const CategoryIcon: FC<{ category: PostMainCategory, className?: string }> = ({ category, className = "h-5 w-5" }) => {
  switch (category) {
    case 'Unity': return <Box className={cn(className, "text-purple-500")} />;
    case 'Unreal': return <AppWindow className={cn(className, "text-sky-500")} />;
    case 'Godot': return <PenTool className={cn(className, "text-emerald-500")} />;
    case 'General': return <LayoutGrid className={cn(className, "text-orange-500")} />;
    default: return null;
  }
};

export default function PostDetailPage() {
  const params = useParams();
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
    return <div className="container mx-auto py-8 px-4 text-center">게시글을 불러오는 중...</div>;
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold">게시글을 찾을 수 없습니다.</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/tavern">목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const author = mockUsers.find(u => u.id === post.authorId);
  const authorDisplayName = author?.nickname || post.authorNickname;
  const authorAvatar = author?.avatar;
  const getInitials = (name: string) => name ? name.substring(0, 1).toUpperCase() : 'U';
  const postDate = new Date(post.createdAt);
  const formattedDate = `${postDate.getFullYear()}년 ${postDate.getMonth() + 1}월 ${postDate.getDate()}일 ${postDate.getHours()}시 ${postDate.getMinutes()}분`;
  const isNotice = post.type === 'Notice' || post.type === 'Announcement';

  const isAuthorAdmin = author?.username === 'WANGJUNLAND';
  const isAuthorGlobalTopRanker = author && !isAuthorAdmin && author.rank > 0 && author.rank <= 3;
  const authorCategoryRank = author?.categoryStats?.[post.mainCategory]?.rank;
  const isAuthorCategoryTopRanker = authorCategoryRank && authorCategoryRank > 0 && authorCategoryRank <= 3;

  const NicknameDisplay = () => {
    if (!author) return <span className="font-medium text-foreground">{authorDisplayName}</span>;

    if (isAuthorAdmin) {
      return (
        <div className="admin-badge-bg admin-badge-border rounded-lg px-2 py-0.5 inline-flex items-center gap-1">
          <span className="text-admin font-semibold">{authorDisplayName}</span>
        </div>
      );
    }
    if (isAuthorGlobalTopRanker) {
      return (
         <div className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2 py-0.5",
            author.rank === 1 && 'rank-1-badge',
            author.rank === 2 && 'rank-2-badge',
            author.rank === 3 && 'rank-3-badge'
          )}
        >
          {isAuthorCategoryTopRanker && <CategoryIcon category={post.mainCategory} className="h-3.5 w-3.5" />}
          <span className={cn(
            "font-semibold",
            author.rank === 1 && 'rank-1-text',
            author.rank === 2 && 'rank-2-text',
            author.rank === 3 && 'rank-3-text'
          )}>
            {authorDisplayName}
          </span>
        </div>
      );
    }
    if (isAuthorCategoryTopRanker) {
      return (
        <span className={cn(
          "category-rank-nickname px-2 py-0.5",
          post.mainCategory === 'Unity' && 'category-rank-unity',
          post.mainCategory === 'Unreal' && 'category-rank-unreal',
          post.mainCategory === 'Godot' && 'category-rank-godot',
          post.mainCategory === 'General' && 'category-rank-general',
        )}>
          <CategoryIcon category={post.mainCategory} className="h-3.5 w-3.5 mr-1" />
          {authorDisplayName}
        </span>
      );
    }
    return <span className="font-medium text-foreground">{authorDisplayName}</span>;
  };


  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/tavern">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </Button>

      <Card className={cn(
        "mb-8 shadow-lg",
        post.isPinned && "border-t-4 border-primary",
        isNotice && "bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700"
      )}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-headline flex items-center">
              {post.isPinned && <Pin className="h-6 w-6 mr-2 text-primary" />}
              {isNotice && <MessageSquare className="h-6 w-6 mr-2 text-sky-600 dark:text-sky-400" />}
              {post.title}
            </CardTitle>
          </div>
          <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorAvatar || `https://placehold.co/40x40.png?text=${getInitials(authorDisplayName)}`} alt={authorDisplayName} />
              <AvatarFallback>{getInitials(authorDisplayName)}</AvatarFallback>
            </Avatar>
            <div>
              <NicknameDisplay />
              <div className="text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                <span className="mx-1">·</span>
                <span className="capitalize">{post.type}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
          <div className="whitespace-pre-wrap">{post.content}</div> 
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground border-t pt-4 mt-4">
           <div className="flex gap-4 items-center text-sm">
            <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1" /> {post.upvotes}</span>
            <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {totalCommentCount}</span>
            <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> {post.views}</span>
          </div>
           {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>

      <CommentSection postId={post.id} initialComments={initialCommentsForPost} postMainCategory={post.mainCategory} />
      
      <MiniPostList allPosts={mockPosts} currentPostId={post.id} />
    </div>
  );
}
```