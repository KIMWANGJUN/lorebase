// src/app/(main)/tavern/[postId]/page.tsx
"use client"; 

import { mockPosts, mockUsers, mockComments as globalMockComments, mockTetrisRankings, tetrisTitles } from '@/lib/mockData'; // Added Tetris data
import type { Post, Comment as CommentType, User as UserType, PostMainCategory } from '@/types'; // Renamed User
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Pin, Edit3, Box, AppWindow, PenTool, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import MiniPostList from '@/components/shared/MiniPostList';
import CommentSection from '@/components/shared/CommentSection';
import { useEffect, useState, useMemo, type FC } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

// Helper function to get user's rank in a specific category
const getAuthorRankInCategory = (author: UserType | undefined, category: PostMainCategory, allUsers: UserType[]): number | null => {
  if (!author || !author.categoryStats || !author.categoryStats[category]) {
    return null;
  }
  const categoryScore = author.categoryStats[category]?.score;
  if (typeof categoryScore !== 'number') {
    return null;
  }

  const usersInCategory = allUsers
    .filter(u => u.id !== 'admin' && u.categoryStats && u.categoryStats[category] && typeof u.categoryStats[category]?.score === 'number')
    .sort((a, b) => (b.categoryStats![category]!.score || 0) - (a.categoryStats![category]!.score || 0));

  const rank = usersInCategory.findIndex(u => u.id === author.id);
  return rank !== -1 ? rank + 1 : null;
};

const CategoryIcon: FC<{ category: PostMainCategory, className?: string }> = ({ category, className = "h-4 w-4 shrink-0" }) => { // Adjusted default size slightly
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
  author?: UserType;
  authorDisplayName: string;
  postMainCategory: PostMainCategory; // Category context of the post
}

const NicknameDisplay: FC<NicknameDisplayProps> = ({ author, authorDisplayName, postMainCategory }) => {
  if (!author) return <span className="font-medium text-foreground">{authorDisplayName}</span>;

  const isAdminUser = author.username === 'WANGJUNLAND';
  const isGlobalTop3 = author.rank > 0 && author.rank <= 3;

  const tetrisRankEntry = mockTetrisRankings.monthly.find(r => r.userId === author.id);
  const tetrisRankIndex = tetrisRankEntry ? mockTetrisRankings.monthly.indexOf(tetrisRankEntry) : -1;
  const isTetrisTop3 = tetrisRankEntry && tetrisRankIndex !== -1 && tetrisRankIndex < 3;
  
  const authorRankInPostCategory = getAuthorRankInCategory(author, postMainCategory, mockUsers);
  const isCategoryTop3InPost = authorRankInPostCategory !== null && authorRankInPostCategory <= 3;
  const isCategoryTop10InPost = authorRankInPostCategory !== null && authorRankInPostCategory <= 10;

  const authorHasCategoryPresence = author.categoryStats && author.categoryStats[postMainCategory] && (author.categoryStats[postMainCategory]?.score || 0) > 0;

  let titleText: string | null = null;
  let titleClass = "";
  let nicknameContainerClass = "inline-flex items-center gap-1 rounded-md"; // Base class
  let nicknameTextClass = "";

  if (isAdminUser) {
    nicknameContainerClass = cn(nicknameContainerClass, "admin-badge-bg admin-badge-border px-2 py-0.5");
    nicknameTextClass = "text-admin font-semibold";
  } else if (isGlobalTop3) {
    if (author.rank === 1) nicknameContainerClass = cn(nicknameContainerClass, "rank-1-badge px-2 py-0.5");
    else if (author.rank === 2) nicknameContainerClass = cn(nicknameContainerClass, "rank-2-badge px-2 py-0.5");
    else if (author.rank === 3) nicknameContainerClass = cn(nicknameContainerClass, "rank-3-badge px-2 py-0.5");
    
    if (author.rank === 1) nicknameTextClass = "rank-1-text font-semibold";
    else if (author.rank === 2) nicknameTextClass = "rank-2-text font-semibold";
    else if (author.rank === 3) nicknameTextClass = "rank-3-text font-semibold";
  } else if (isTetrisTop3) {
    titleText = tetrisTitles[tetrisRankIndex];
    if (tetrisRankIndex === 0) { titleClass = 'text-rank-gold'; nicknameTextClass = 'text-rank-gold font-semibold';}
    else if (tetrisRankIndex === 1) { titleClass = 'text-rank-silver'; nicknameTextClass = 'text-rank-silver font-semibold';}
    else if (tetrisRankIndex === 2) { titleClass = 'text-rank-bronze'; nicknameTextClass = 'text-rank-bronze font-semibold';}

    if (isCategoryTop3InPost) { // Tetris Top 3 + Category Top 3 -> Category BG
         nicknameContainerClass = cn(nicknameContainerClass, 
            postMainCategory === 'Unity' && 'highlight-unity',
            postMainCategory === 'Unreal' && 'highlight-unreal',
            postMainCategory === 'Godot' && 'highlight-godot',
            postMainCategory === 'General' && 'highlight-general'
        );
    } else {
        nicknameContainerClass = cn(nicknameContainerClass, 'px-1.5 py-0.5');
    }
  } else if (isCategoryTop3InPost) {
    titleText = postMainCategory === 'General' ? '일반 & 유머' : postMainCategory;
    if (authorRankInPostCategory === 1) titleClass = 'text-rank-gold';
    else if (authorRankInPostCategory === 2) titleClass = 'text-rank-silver';
    else if (authorRankInPostCategory === 3) titleClass = 'text-rank-bronze';

    nicknameContainerClass = cn(nicknameContainerClass, 
        postMainCategory === 'Unity' && 'highlight-unity',
        postMainCategory === 'Unreal' && 'highlight-unreal',
        postMainCategory === 'Godot' && 'highlight-godot',
        postMainCategory === 'General' && 'highlight-general'
    );
    nicknameTextClass = cn(`nickname-text-rank-${authorRankInPostCategory}`);
  } else if (isCategoryTop10InPost) {
    nicknameContainerClass = cn(nicknameContainerClass, 'px-1.5 py-0.5');
    nicknameTextClass = cn(`nickname-text-rank-${authorRankInPostCategory}`);
      if (postMainCategory === 'Unity') nicknameTextClass = cn(nicknameTextClass, 'text-unity-text-highlight');
      else if (postMainCategory === 'Unreal') nicknameTextClass = cn(nicknameTextClass, 'text-unreal-text-highlight');
      else if (postMainCategory === 'Godot') nicknameTextClass = cn(nicknameTextClass, 'text-godot-text-highlight');
      else if (postMainCategory === 'General') nicknameTextClass = cn(nicknameTextClass, 'text-general-text-highlight');
  } else {
     nicknameContainerClass = cn(nicknameContainerClass, 'px-1.5 py-0.5');
     nicknameTextClass = "font-medium text-foreground"; // Default if no special rank
  }

  return (
    <div className="flex flex-col items-start">
      {titleText && (
        <p className={cn("text-[0.75rem] leading-tight font-semibold tracking-tight mb-0.5", titleClass)}>
          {titleText}
        </p>
      )}
      <div className={nicknameContainerClass}>
        {authorHasCategoryPresence && !isAdminUser && !isGlobalTop3 && <CategoryIcon category={postMainCategory} className="h-4 w-4" />}
        <span className={cn("font-medium", nicknameTextClass)}>{authorDisplayName}</span>
      </div>
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
  
  const postDateToShow = post.isEdited && post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt);
  const formattedDate = `${postDateToShow.getFullYear()}년 ${postDateToShow.getMonth() + 1}월 ${postDateToShow.getDate()}일 ${postDateToShow.getHours()}시 ${postDateToShow.getMinutes()}분`;
  
  const isNotice = post.type === 'Notice' || post.type === 'Announcement';
  const canEdit = currentUser && (currentUser.id === post.authorId || isAdmin);


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
              <AvatarImage src={authorAvatar || `https://placehold.co/40x40.png?text=${getInitials(authorDisplayName)}`} alt={authorDisplayName} />
              <AvatarFallback>{getInitials(authorDisplayName)}</AvatarFallback>
            </Avatar>
            <div>
               <NicknameDisplay author={author} authorDisplayName={authorDisplayName} postMainCategory={post.mainCategory} />
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

      <CommentSection postId={post.id} initialComments={initialCommentsForPost} postMainCategory={post.mainCategory} />
      
      <MiniPostList allPosts={mockPosts} currentPostId={post.id} />
    </div>
  );
}

