
// src/app/(main)/tavern/page.tsx
"use client";
import { useState, useMemo, type FC, type ElementType } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPosts, mockUsers } from '@/lib/mockData';
import type { Post, PostMainCategory, PostType } from '@/types';
import Link from 'next/link';
import { 
  Search, PlusCircle, MessageSquare, ThumbsUp, ThumbsDown, Eye, Pin, Edit, Trash2, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ScrollText,
  Box, AppWindow, PenTool, ListChecks, HelpCircle, BookOpen, ClipboardList, Smile, LayoutGrid
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const POSTS_PER_PAGE = 10; // Adjusted for potentially more views

const PostItem = ({ post, isAdmin }: { post: Post, isAdmin: boolean }) => {
  const author = mockUsers.find(u => u.id === post.authorId);
  const authorDisplayName = author?.nickname || post.authorNickname;
  const authorAvatar = author?.avatar;
  const getInitials = (name: string) => name ? name.substring(0, 1).toUpperCase() : 'U';
  
  const postDate = new Date(post.createdAt);
  const formattedDate = `${postDate.getFullYear()}년 ${postDate.getMonth() + 1}월 ${postDate.getDate()}일 ${postDate.getHours()}시 ${postDate.getMinutes()}분`;

  const isNotice = post.type === 'Notice' || post.type === 'Announcement';
  const isAuthorAdmin = author?.username === 'WANGJUNLAND';
  const isAuthorTopRanker = author && !isAuthorAdmin && author.rank > 0 && author.rank <= 3;

  return (
    <Card 
      className={cn(
        "shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out bg-card border-border hover:border-primary/30",
        post.isPinned && "border-t-4 border-accent dark:border-accent/80",
        isNotice && "bg-primary/10 dark:bg-primary/20 border-primary/50 dark:border-primary/70"
      )}
    >
      <Link href={`/tavern/${post.id}`} className="block hover:bg-card/5 transition-colors rounded-lg">
        <CardHeader className="pb-1 pt-2 px-3">
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-md mb-0.5 flex items-center text-foreground">
              {post.isPinned && <Pin className="h-4 w-4 mr-2 text-accent" />} 
              {isNotice && <ScrollText className="h-4 w-4 mr-2 text-primary" />}
              {post.title}
            </CardTitle>
            {isAdmin && (
              <div className="flex gap-1 absolute top-2 right-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={(e) => {e.preventDefault(); alert('Edit clicked'); }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={(e) => {e.preventDefault(); alert('Delete clicked'); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground space-x-1.5">
            <Avatar className="h-4 w-4 border border-border">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{getInitials(authorDisplayName)}</AvatarFallback>
            </Avatar>
             {isAuthorAdmin && author ? (
                <div className="admin-badge-bg admin-badge-border rounded-lg px-1.5 py-0.5 text-xs">
                  <span className="text-admin font-semibold">{authorDisplayName}</span>
                </div>
              ) : isAuthorTopRanker && author ? (
                 <div className={cn(
                    "rounded-lg px-1.5 py-0.5 text-xs",
                    author.rank === 1 && 'rank-1-badge',
                    author.rank === 2 && 'rank-2-badge',
                    author.rank === 3 && 'rank-3-badge'
                  )}
                >
                  <span className={cn(
                    "font-semibold",
                    author.rank === 1 && 'rank-1-text',
                    author.rank === 2 && 'rank-2-text',
                    author.rank === 3 && 'rank-3-text'
                  )}>
                    {authorDisplayName}
                  </span>
                </div>
              ) : (
              <span className="text-xs">{authorDisplayName}</span>
            )}
            <span>·</span>
            <span className="text-xs">{formattedDate}</span>
            <span>·</span>
            <span className="capitalize text-xs">{post.type}</span>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-start items-center text-xs text-muted-foreground px-3 py-1 mt-1">
          <div className="flex gap-2 items-center">
            <span className="flex items-center text-[10px]"><ThumbsUp className="h-2.5 w-2.5 mr-0.5" /> {post.upvotes}</span>
            {isAdmin && <span className="flex items-center text-[10px]"><ThumbsDown className="h-2.5 w-2.5 mr-0.5" /> {post.downvotes}</span>}
            <span className="flex items-center text-[10px]"><MessageSquare className="h-2.5 w-2.5 mr-0.5" /> {post.commentCount}</span>
            <span className="flex items-center text-[10px]"><Eye className="h-2.5 w-2.5 mr-0.5" /> {post.views}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

interface SubTabInfo {
  value: PostType | 'all'; // 'all' for sub-categories could be an option if needed
  label: string;
  icon?: ElementType;
}

const engineSubTabs: SubTabInfo[] = [
  { value: 'QnA', label: 'Q&A', icon: HelpCircle },
  { value: 'Knowledge', label: '지식', icon: BookOpen },
  { value: 'DevLog', label: '개발 일지', icon: ClipboardList },
];

const generalSubTabs: SubTabInfo[] = [
  { value: 'GeneralPost', label: '일반 글', icon: MessageSquare },
  { value: 'Humor', label: '유머 글', icon: Smile },
  { value: 'Notice', label: '공지', icon: ScrollText},
];

interface SubTabsComponentProps {
  activeSubTab: string;
  setActiveSubTab: (value: string) => void;
  subTabs: SubTabInfo[];
  onSubTabChange?: () => void;
}

const SubTabsComponent: FC<SubTabsComponentProps> = ({ activeSubTab, setActiveSubTab, subTabs, onSubTabChange }) => {
  return (
    <Tabs value={activeSubTab} onValueChange={(value) => {
        setActiveSubTab(value);
        if (onSubTabChange) onSubTabChange();
    }} className="mb-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-none lg:flex">
        {subTabs.map(tab => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value} 
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex-1 lg:flex-none"
          >
            {tab.icon && <tab.icon className="mr-1.5 h-4 w-4" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};


export default function TavernPage() {
  const [mainCategory, setMainCategory] = useState<PostMainCategory>('Unity');
  const [subCategory, setSubCategory] = useState<PostType>('QnA');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAdmin } = useAuth();

  const handleMainCategoryChange = (newMainCategory: PostMainCategory) => {
    setMainCategory(newMainCategory);
    // Set default sub-category for the new main category
    if (newMainCategory === 'General') {
      setSubCategory('GeneralPost');
    } else {
      setSubCategory('QnA'); // Default for engine categories
    }
    setCurrentPage(1);
  };

  const handleSubCategoryChange = (newSubCategory: string) => {
    setSubCategory(newSubCategory as PostType);
    setCurrentPage(1);
  }

  const currentSubTabSet = useMemo(() => {
    return mainCategory === 'General' ? generalSubTabs : engineSubTabs;
  }, [mainCategory]);

  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts].filter(p => p.mainCategory === mainCategory);
    
    posts = posts.filter(p => p.type === subCategory);

    if (searchTerm) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorNickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return posts.sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mainCategory, subCategory, searchTerm]);
  
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
    const maxPagesToShow = 5; 
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    if (totalPages === 0) return null;

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => paginate(i)}
          className={cn("h-8 w-8 p-0", currentPage === i ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50")}
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };
  
  const bannerImageUrl = "https://placehold.co/1920x600.png";

  return (
    <div className="container mx-auto py-8 px-4">
      <section 
        className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="fantasy tavern interior"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent-orange/70 via-yellow-500/50 to-black/70 rounded-xl z-0"></div>
        <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg">선술집 (커뮤니티)</h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">개발자들과 자유롭게 소통하고 정보를 공유하세요.</p>
        </div>
      </section>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="게시글 검색 (제목, 작성자)..."
            className="pl-10 w-full bg-card border-border focus:ring-accent"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        {user && (
          <Button className="w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-primary-foreground hover:opacity-90 shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" /> 새 글 작성
          </Button>
        )}
      </div>

      <Tabs value={mainCategory} onValueChange={(value) => handleMainCategoryChange(value as PostMainCategory)} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card border-border p-1.5 rounded-lg shadow-inner">
          <TabsTrigger value="Unity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 flex items-center justify-center gap-1.5"><Box className="h-4 w-4" />Unity</TabsTrigger>
          <TabsTrigger value="Unreal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 flex items-center justify-center gap-1.5"><AppWindow className="h-4 w-4" />Unreal</TabsTrigger>
          <TabsTrigger value="Godot" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 flex items-center justify-center gap-1.5"><PenTool className="h-4 w-4" />Godot</TabsTrigger>
          <TabsTrigger value="General" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 flex items-center justify-center gap-1.5"><LayoutGrid className="h-4 w-4" />일반</TabsTrigger>
        </TabsList>

        {/* Content area for sub-tabs and posts will be handled below based on mainCategory and subCategory state */}
      </Tabs>

      <SubTabsComponent 
        activeSubTab={subCategory}
        setActiveSubTab={handleSubCategoryChange}
        subTabs={currentSubTabSet}
        onSubTabChange={() => setCurrentPage(1)}
      />
      
      {currentPostsToDisplay.length > 0 ? (
        <div className="space-y-3"> 
          {currentPostsToDisplay.map((post) => (
            <PostItem key={post.id} post={post} isAdmin={!!isAdmin} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">표시할 게시글이 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">선택한 카테고리 또는 검색어에 해당하는 글이 없습니다.</p>
        </div>
      )}
      
      {totalPages > 0 && (
        <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8"
                    aria-label="First page"
                >
                    <ChevronsLeft className="h-4 w-4"/>
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4"/>
                </Button>

                {renderPageNumbers()}

                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8"
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4"/>
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8"
                    aria-label="Last page"
                >
                    <ChevronsRight className="h-4 w-4"/>
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

    