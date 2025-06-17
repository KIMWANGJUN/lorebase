
// src/components/shared/PostList.tsx
"use client";

import React, { useState, useMemo, FC, ElementType, useEffect } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Post, PostMainCategory, PostType, User as UserType } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, ThumbsUp, Eye, Pin, Edit, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ScrollText,
  ListChecks, HelpCircle, BookOpen, ClipboardList, Smile, Flame
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import { useToast } from '@/hooks/use-toast';

const POSTS_PER_PAGE = 10;

// PostItem 컴포넌트는 변경 없음...
const PostItem = ({
  post,
  currentUser,
  isAdmin,
  router,
  isRecommended,
  onToggleRecommend
}: {
  post: Post,
  currentUser: UserType | null,
  isAdmin: boolean,
  router: AppRouterInstance,
  isRecommended: boolean,
  onToggleRecommend: (postId: string) => void
}) => {
  const postDateToShow = post.isEdited && post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt);
  const formattedDate = `${postDateToShow.getFullYear()}/${(postDateToShow.getMonth() + 1).toString().padStart(2, '0')}/${postDateToShow.getDate().toString().padStart(2, '0')}`;
  const isNotice = post.type === 'Notice';

  const handleRecommendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleRecommend(post.id);
  };

  return (
    <Card
      className={cn(
        "shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out bg-card border-border hover:border-primary/30",
        post.isPinned && "border-t-4 border-accent",
        isNotice && "bg-primary/10 border-primary/50"
      )}
    >
      <Link href={`/tavern/${post.id}`} className="block hover:bg-card/5 transition-colors rounded-lg relative group">
        <CardHeader className="pb-1 pt-2 px-3">
          <div className="flex justify-between items-start">
            <h3 className={cn("text-base mb-0.5 flex items-center font-headline font-bold", isNotice ? "text-primary" : "text-foreground group-hover:text-primary transition-colors")}>
              {post.isPinned && <Pin className="h-4 w-4 mr-2 text-accent" />}
              {isNotice && <ScrollText className="h-4 w-4 mr-2 text-primary" />}
              {post.title}
              {post.isEdited && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(수정됨)</span>}
            </h3>
            {currentUser?.id === post.author.id && (
              <div className="flex gap-1 absolute top-2 right-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={(e) => {e.preventDefault(); router.push(`/tavern/${post.id}/edit`); }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={(e) => {e.preventDefault(); alert('Delete clicked (not implemented)'); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground space-x-1.5 mt-1">
            <Avatar className="h-4 w-4 border border-border shrink-0">
              <AvatarImage src={post.author.avatar || `https://placehold.co/40x40.png?text=${post.author.nickname.substring(0,1)}`} />
              <AvatarFallback className="text-[10px]">{post.author.nickname.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground font-normal">{post.author.nickname}</span>
            <span>·</span>
            <span className="text-xs">{formattedDate}</span>
            <span>·</span>
            <span className="capitalize text-xs">{post.type}</span>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-start items-center text-xs text-muted-foreground px-3 py-1 mt-1">
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleRecommendClick}
              className={cn(
                "p-0 h-auto text-[10px] flex items-center gap-0.5 hover:bg-accent/10",
                isRecommended ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-accent-foreground"
              )}
              aria-pressed={isRecommended}
            >
              <ThumbsUp className={cn("h-2.5 w-2.5", isRecommended && "fill-primary")} />
              {post.upvotes}
            </Button>
            <span className="flex items-center text-[10px]"><MessageSquare className="h-2.5 w-2.5 mr-0.5" /> {post.commentCount}</span>
            <span className="flex items-center text-[10px]"><Eye className="h-2.5 w-2.5 mr-0.5" /> {post.views}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

interface SubTabInfo {
  value: PostType | 'popular' | 'all';
  label: string;
  icon?: ElementType;
}

const engineSubTabs: SubTabInfo[] = [
  { value: 'all', label: '전체 글', icon: ListChecks },
  { value: 'QnA', label: 'Q&A', icon: HelpCircle },
  { value: 'Knowledge', label: '지식', icon: BookOpen },
  { value: 'DevLog', label: '개발 일지', icon: ClipboardList },
  { value: 'popular', label: '인기 글', icon: Flame },
];

const generalSubTabs: SubTabInfo[] = [
  { value: 'all', label: '전체 글', icon: ListChecks },
  { value: 'GeneralPost', label: '일반 글', icon: MessageSquare },
  { value: 'Humor', label: '유머 글', icon: Smile },
  { value: 'Notice', label: '공지', icon: ScrollText},
  { value: 'popular', label: '인기 글', icon: Flame },
];

interface PostListProps {
  initialPosts: Post[];
  initialMainCategory: PostMainCategory;
  initialSearchTerm: string;
}

const PostList: FC<PostListProps> = ({ initialPosts, initialMainCategory, initialSearchTerm }) => {
  const [subCategory, setSubCategory] = useState<PostType | 'popular' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [userRecommendations, setUserRecommendations] = useState<{ [postId: string]: boolean }>({});

  useEffect(() => {
    setCurrentPage(1);
  }, [initialMainCategory, initialSearchTerm]);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts.filter(p => p.mainCategory === initialMainCategory);

    if (initialSearchTerm) {
      const lowercasedTerm = initialSearchTerm.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(lowercasedTerm) ||
        p.author.nickname.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Notice posts are always at the top for their category
    const notices = posts.filter(p => p.type === 'Notice');
    let otherPosts = posts.filter(p => p.type !== 'Notice');

    if (subCategory === 'popular') {
        otherPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (subCategory !== 'all') {
        otherPosts = otherPosts.filter(p => p.type === subCategory);
        otherPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
        otherPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    // Pinned posts come after notices
    const pinnedPosts = otherPosts.filter(p => p.isPinned);
    const regularPosts = otherPosts.filter(p => !p.isPinned);

    return [...notices, ...pinnedPosts, ...regularPosts];

  }, [initialMainCategory, subCategory, initialSearchTerm, initialPosts]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPostsToDisplay = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
    
  const handleToggleRecommend = (postId: string) => {
    if (!user) {
        toast({ title: "로그인 필요", description: "추천하시려면 로그인이 필요합니다.", variant: "destructive" });
        return;
    }
    // This should be an API call
    console.log(`Toggled recommendation for post ${postId}`);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    if (totalPages === 0) return null;

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
            <Button key={i} variant={currentPage === i ? 'default' : 'outline'} size="sm" onClick={() => paginate(i)} className={cn("h-8 w-8 p-0")}>{i}</Button>
        );
    }
    return pageNumbers;
  };

  const currentSubTabs = initialMainCategory === 'General' ? generalSubTabs : engineSubTabs;
  
  // Reset sub-category if it's not valid for the current main category
  useEffect(() => {
    if (!currentSubTabs.some(tab => tab.value === subCategory)) {
        setSubCategory('all');
    }
  }, [initialMainCategory, subCategory, currentSubTabs]);

  return (
    <>
      <Tabs value={subCategory} onValueChange={(value) => setSubCategory(value as PostType | 'popular' | 'all')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-none lg:flex items-center">
              {currentSubTabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex-1 lg:flex-none">
                      {tab.icon && <tab.icon className="mr-1.5 h-4 w-4" />}
                      {tab.label}
                  </TabsTrigger>
              ))}
          </TabsList>
      </Tabs>

      {currentPostsToDisplay.length > 0 ? (
        <div className="space-y-3">
          {currentPostsToDisplay.map((post) => (
            <PostItem key={post.id} post={post} currentUser={user} isAdmin={isAdmin} router={router} isRecommended={!!userRecommendations[post.id]} onToggleRecommend={handleToggleRecommend} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">표시할 게시글이 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">선택한 카테고리 또는 검색어에 해당하는 글이 없습니다.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="outline" size="icon" onClick={() => paginate(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4"/></Button>
                {renderPageNumbers()}
                <Button variant="outline" size="icon" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4"/></Button>
            </div>
            <p className="text-sm text-muted-foreground">총 {totalPages} 페이지 중 {currentPage} 페이지</p>
        </div>
      )}
    </>
  );
};

export default PostList;
