
// src/app/(main)/tavern/[postId]/page.tsx
"use client"; 

import { mockPosts, mockUsers, mockComments as globalMockComments, tetrisTitles, mockTetrisRankings } from '@/lib/mockData'; 
import type { Post, Comment as CommentType, User as UserType, PostMainCategory, DisplayRankType } from '@/types'; 
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Pin, Edit3, Box, AppWindow, PenTool, LayoutGrid, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import MiniPostList from '@/components/shared/MiniPostList';
import CommentSection from '@/components/shared/CommentSection';
import React, { useEffect, useState, useMemo, type FC } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

const CategorySpecificIcon: FC<{ category: PostMainCategory, className?: string }> = ({ category, className = "h-4 w-4 shrink-0" }) => { 
  let iconColorClass = "";
  switch (category) {
    case 'Unity': iconColorClass = "text-unity-icon"; break;
    case 'Unreal': iconColorClass = "text-unreal-icon"; break;
    case 'Godot': iconColorClass = "text-godot-icon"; break;
    case 'General': iconColorClass = "text-general-icon"; break;
    default: iconColorClass = "text-muted-foreground"; break;
  }
  switch (category) {
    case 'Unity': return <Box className={cn(iconColorClass, className)} />;
    case 'Unreal': return <AppWindow className={cn(iconColorClass, className)} />;
    case 'Godot': return <PenTool className={cn(iconColorClass, className)} />;
    case 'General': return <LayoutGrid className={cn(iconColorClass, className)} />;
    default: return null;
  }
};

interface NicknameDisplayProps {
  author: UserType;
  postMainCategory: PostMainCategory; 
}

const NicknameDisplay: FC<NicknameDisplayProps> = ({ author, postMainCategory }) => {
  if (!author) return <span className="font-medium text-foreground">Unknown User</span>;

  let finalItemContainerClass = "default-rank-item-bg";
  let finalNicknameTextClass = "text-foreground";
  let finalTitleText: string | null = null;
  let finalTitleColorClass = "";
  let showCategoryIcon = true;

  const { 
    rank: globalRank, 
    tetrisRank, 
    categoryStats, 
    username 
  } = author;

  const authorCategoryStats = categoryStats?.[postMainCategory];
  const rankInCurrentCategory = authorCategoryStats?.rankInCate || 0;

  // 1. Admin
  if (username === 'WANGJUNLAND') {
    finalItemContainerClass = "admin-badge-bg admin-badge-border px-1.5 py-0.5";
    finalNicknameTextClass = "text-admin";
    showCategoryIcon = false; 
  }
  // 2. Global Community Rank Top 3
  else if (globalRank > 0 && globalRank <= 3) {
    finalItemContainerClass = cn(globalRank === 1 && 'rank-1-badge', globalRank === 2 && 'rank-2-badge', globalRank === 3 && 'rank-3-badge', "px-1.5 py-0.5");
    finalNicknameTextClass = globalRank === 1 ? 'text-rank-gold' : globalRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
    showCategoryIcon = true; 
  }
  // 3. Tetris Monthly Rank Top 3
  else if (tetrisRank && tetrisRank > 0 && tetrisRank <= 3) {
    finalTitleText = tetrisTitles[tetrisRank - 1];
    finalTitleColorClass = tetrisRank === 1 ? 'text-rank-gold' : tetrisRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
    finalNicknameTextClass = finalTitleColorClass;
    showCategoryIcon = true;
    if (rankInCurrentCategory > 0 && rankInCurrentCategory <= 3) {
      finalItemContainerClass = cn(`highlight-${postMainCategory.toLowerCase()}`, "px-1.5 py-0.5");
    } else {
      finalItemContainerClass = "default-rank-item-bg px-1.5 py-0.5";
    }
  }
  // 4. Category Rank Top 3
  else if (rankInCurrentCategory > 0 && rankInCurrentCategory <= 3) {
    finalTitleText = postMainCategory === 'General' ? '일반 & 유머' : postMainCategory;
    finalTitleColorClass = rankInCurrentCategory === 1 ? 'text-rank-gold' : rankInCurrentCategory === 2 ? 'text-rank-silver' : 'text-rank-bronze';
    finalNicknameTextClass = finalTitleColorClass; 
    finalItemContainerClass = cn(`highlight-${postMainCategory.toLowerCase()}`, "px-1.5 py-0.5");
    showCategoryIcon = true;
  }
  // 5. Category Rank 4-10
  else if (rankInCurrentCategory > 0 && rankInCurrentCategory <= 10) {
    finalNicknameTextClass = cn(`text-${postMainCategory.toLowerCase()}-themed`, `nickname-text-rank-${rankInCurrentCategory}`);
    finalItemContainerClass = "default-rank-item-bg px-1.5 py-0.5";
    showCategoryIcon = true;
  }
  // 6. Default
  else {
    finalItemContainerClass = "default-rank-item-bg px-1.5 py-0.5";
    showCategoryIcon = true; 
  }
  
  const NicknameWrapper = finalItemContainerClass.includes('highlight-general') && !finalItemContainerClass.includes('highlight-general-inner') ? 'div' : React.Fragment;
  const wrapperProps = NicknameWrapper === 'div' ? { className: 'highlight-general-inner p-0' } : {};

  return (
    <div className="flex flex-col items-start">
      {finalTitleText && (
        <div className="title-container">
            <p className={cn("text-[0.75rem] leading-tight font-semibold tracking-tight", finalTitleColorClass)}>
            {finalTitleText}
            </p>
        </div>
      )}
      <NicknameWrapper {...wrapperProps}>
        <div className={cn("inline-flex items-center gap-1", finalItemContainerClass, finalTitleText && "mt-0.5", NicknameWrapper === 'div' && "p-0")}>
            {showCategoryIcon && postMainCategory && <CategorySpecificIcon category={postMainCategory} className="h-3.5 w-3.5" />}
            <span className={cn("font-medium nickname-text", finalNicknameTextClass)}>{author.nickname}</span>
        </div>
      </NicknameWrapper>
    </div>
  );
};


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
      if (foundPost && !sessionStorage.getItem(`viewed_${postId}`)) {
        foundPost.views += 1;
        sessionStorage.setItem(`viewed_${postId}`, 'true');
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

  const authorUser = mockUsers.find(u => u.id === post.authorId);
  const getInitials = (name: string) => name ? name.substring(0, 1).toUpperCase() : 'U';
  
  const postDateToShow = post.isEdited && post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt);
  const formattedDate = `${postDateToShow.getFullYear()}년 ${postDateToShow.getMonth() + 1}월 ${postDateToShow.getDate()}일 ${postDateToShow.getHours()}시 ${postDateToShow.getMinutes()}분`;
  
  const isNotice = post.type === 'Notice' || post.type === 'Announcement';
  const canEdit = currentUser && (currentUser.id === post.authorId || (isAdmin && post.authorId === 'admin'));


  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline">
          <Link href="/tavern">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
        {canEdit && (
          <Button asChild variant="outline">
            <Link href={`/tavern/${post.id}/edit`}>
              <Edit3 className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
        )}
      </div>
      

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
              {post.isEdited && <span className="ml-2 text-xs font-normal text-muted-foreground">(수정됨)</span>}
            </CardTitle>
          </div>
          <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorUser?.avatar || `https://placehold.co/40x40.png?text=${getInitials(post.authorNickname)}`} alt={post.authorNickname} />
              <AvatarFallback>{getInitials(post.authorNickname)}</AvatarFallback>
            </Avatar>
            <div>
               {authorUser ? <NicknameDisplay author={authorUser} postMainCategory={post.mainCategory} /> : <span className="font-medium text-foreground">{post.authorNickname}</span>}
              <div className="text-xs text-muted-foreground mt-0.5">
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

      {authorUser && <CommentSection postId={post.id} initialComments={initialCommentsForPost} postMainCategory={post.mainCategory} authorFull={authorUser} />}
      
      <MiniPostList allPosts={mockPosts} currentPostId={post.id} />
    </div>
  );
}
    
