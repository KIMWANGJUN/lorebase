// src/app/(main)/tavern/page.tsx
"use client";
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockPosts, mockUsers } from '@/lib/mockData';
import type { Post } from '@/types';
import Link from 'next/link';
import { Search, PlusCircle, MessageSquare, ThumbsUp, ThumbsDown, Eye, Filter, ArrowUpDown, Pin, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const POSTS_PER_PAGE = 20;

const PostItem = ({ post, isAdmin, isPopularPost }: { post: Post, isAdmin: boolean, isPopularPost?: boolean }) => {
  const author = mockUsers.find(u => u.id === post.authorId);
  const authorDisplayName = author?.nickname || post.authorNickname;
  const authorAvatar = author?.avatar;
  const getInitials = (name: string) => name ? name.substring(0, 1).toUpperCase() : 'U';
  
  const postDate = new Date(post.createdAt);
  const formattedDate = `${postDate.getFullYear()}년 ${postDate.getMonth() + 1}월 ${postDate.getDate()}일 ${postDate.getHours()}시 ${postDate.getMinutes()}분`;

  const isNotice = post.type === 'Notice' || post.type === 'Announcement';

  return (
    <Card 
      className={cn(
        "shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out",
        post.isPinned && "border-t-4 border-primary dark:border-primary/80",
        isNotice && "bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700",
        isPopularPost && !isNotice && !post.isPinned && "border-2 border-yellow-400 dark:border-yellow-500"
      )}
    >
      <Link href={`/tavern/${post.id}`} className="block hover:bg-muted/20 transition-colors rounded-lg">
        <CardHeader className="pb-1 pt-2 px-3">
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-md mb-0.5 flex items-center">
              {post.isPinned && <Pin className="h-4 w-4 mr-2 text-primary" />} 
              {isNotice && <MessageSquare className="h-4 w-4 mr-2 text-sky-600 dark:text-sky-400" />}
              {post.title}
            </CardTitle>
            {isAdmin && (
              <div className="flex gap-1 absolute top-2 right-2"> {/* Position admin buttons absolutely */}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.preventDefault(); alert('Edit clicked'); /* Implement edit action */ }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => {e.preventDefault(); alert('Delete clicked'); /* Implement delete action */ }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground space-x-1.5">
            <Avatar className="h-4 w-4">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{getInitials(authorDisplayName)}</AvatarFallback>
            </Avatar>
            <span className={cn("text-xs", author?.username === 'WANGJUNLAND' && 'text-admin')}>{authorDisplayName}</span>
            <span>·</span>
            <span className="text-xs">{formattedDate}</span>
            <span>·</span>
            <span className="capitalize text-xs">{post.type}</span>
          </div>
        </CardHeader>
        {/* Post content removed from list view */}
        {/* <CardContent className="py-1 px-3">
          <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
        </CardContent> */}
        <CardFooter className="flex justify-start items-center text-xs text-muted-foreground px-3 py-1 mt-1">
          <div className="flex gap-2 items-center">
            <span className="flex items-center text-[10px]"><ThumbsUp className="h-2.5 w-2.5 mr-0.5" /> {post.upvotes}</span>
            {isAdmin && <span className="flex items-center text-[10px]"><ThumbsDown className="h-2.5 w-2.5 mr-0.5" /> {post.downvotes}</span>}
            <span className="flex items-center text-[10px]"><MessageSquare className="h-2.5 w-2.5 mr-0.5" /> {post.commentCount}</span>
            <span className="flex items-center text-[10px]"><Eye className="h-2.5 w-2.5 mr-0.5" /> {post.views}</span>
          </div>
          {/* "자세히 보기" button can be removed if the whole card is a link, or kept for explicit action */}
        </CardFooter>
      </Link>
    </Card>
  );
};


export default function TavernPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [popularFilter, setPopularFilter] = useState('weekly'); // weekly, monthly, yearly
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAdmin } = useAuth();

  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts]; // Create a mutable copy for sorting
    if (activeTab === 'notices') {
      posts = posts.filter(p => p.type === 'Notice' || p.type === 'Announcement');
    } else if (activeTab === 'popular') {
      // For popular, sort by views first, then potentially by date if needed
      // This example sorts primarily by views for the "popular" tab.
      // You might adjust logic based on popularFilter (weekly, monthly, yearly) if you have date filters.
      posts.sort((a,b) => b.views - a.views); 
    } else if (activeTab === 'qna') {
      posts = posts.filter(p => p.type === 'QnA');
    }
    // General search filter, applied after tab-specific filtering
    if (searchTerm) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // p.content.toLowerCase().includes(searchTerm.toLowerCase()) || // Content search removed
        p.authorNickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Always sort pinned posts to top, then by creation date for remaining posts
    return posts.sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTab, popularFilter, searchTerm]);
  
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPostsToDisplay = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 10; 
    
    const currentBlock = Math.ceil(currentPage / maxPagesToShow);
    let startPage = (currentBlock - 1) * maxPagesToShow + 1;
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    if (totalPages === 0) return null;

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => paginate(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  const handlePrevTenPages = () => {
    const currentBlockFirstPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
    paginate(Math.max(1, currentBlockFirstPage - 10));
  };

  const handleNextTenPages = () => {
    const currentBlockFirstPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
    paginate(Math.min(totalPages, currentBlockFirstPage + 10));
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <section className="text-center py-12 mb-10 bg-gradient-to-r from-accent-orange to-accent rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">선술집 (커뮤니티)</h1>
        <p className="text-lg text-primary-foreground/90 mt-2">개발자들과 자유롭게 소통하고 정보를 공유하세요.</p>
      </section>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="게시글 검색 (제목, 작성자)..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        {user && (
          <Button className="w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> 새 글 작성
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {setActiveTab(value); setCurrentPage(1);}} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="all">전체 글</TabsTrigger>
          <TabsTrigger value="notices">공지</TabsTrigger>
          <TabsTrigger value="qna">Q&A</TabsTrigger>
          <TabsTrigger value="popular" asChild className="data-[state=active]:bg-yellow-100 dark:data-[state=active]:bg-yellow-700/50 data-[state=active]:text-yellow-700 dark:data-[state=active]:text-yellow-300">
            <div className="flex items-center gap-1 cursor-pointer">
              인기 글
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="xs" 
                    className="p-1 h-auto"
                    onClick={(e) => { e.stopPropagation(); }} 
                  >
                    <Filter className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => {setPopularFilter('weekly'); setCurrentPage(1);}}>1주일</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {setPopularFilter('monthly'); setCurrentPage(1);}}>1개월</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {setPopularFilter('yearly'); setCurrentPage(1);}}>1년</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {currentPostsToDisplay.length > 0 ? (
        <div className="space-y-3"> {/* Reduced space between posts slightly */}
          {currentPostsToDisplay.map((post) => (
            <PostItem key={post.id} post={post} isAdmin={isAdmin} isPopularPost={activeTab === 'popular'} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">표시할 게시글이 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">검색어를 변경하거나 다른 탭을 확인해보세요.</p>
        </div>
      )}
      
      {totalPages > 0 && (
        <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevTenPages}
                    disabled={Math.ceil(currentPage / 10) <= 1}
                >
                    <ChevronsLeft className="h-4 w-4 mr-1"/> 이전 10
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1"/> 이전
                </Button>

                {renderPageNumbers()}

                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                >
                    다음 <ChevronRight className="h-4 w-4 ml-1"/>
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextTenPages}
                    disabled={Math.ceil(currentPage / 10) >= Math.ceil(totalPages / 10)}
                >
                    다음 10 <ChevronsRight className="h-4 w-4 ml-1"/>
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">
                총 {totalPages} 페이지 중 {currentPage} 페이지
            </p>
        </div>
      )}
    </div>
  );
}

