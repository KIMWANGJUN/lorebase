
// src/app/(main)/tavern/page.tsx
"use client";
import React, { useState, useMemo, useEffect, type FC, type ElementType, useCallback } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPosts, mockUsers, mockTetrisRankings, tetrisTitles } from '@/lib/mockData';
import type { Post, PostMainCategory, PostType, User as UserType, DisplayRankType } from '@/types'; 
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; 
import { 
  Search, PlusCircle, MessageSquare, ThumbsUp, ThumbsDown, Eye, Pin, Edit, Trash2, Star,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ScrollText,
  Box, AppWindow, PenTool, ListChecks, HelpCircle, BookOpen, ClipboardList, Smile, LayoutGrid, Flame, Trophy
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const POSTS_PER_PAGE = 10;
const RANKERS_TO_SHOW_TAVERN = 20; 

const CategoryIcon: FC<{ category: PostMainCategory, className?: string }> = ({ category, className = "h-3.5 w-3.5 shrink-0" }) => {
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
  postMainCategory: PostMainCategory; // For context, e.g., post's category
}

const NicknameDisplay: FC<NicknameDisplayProps> = ({ author, postMainCategory }) => {
  if (!author) return <span className="text-xs">Unknown User</span>;

  let itemContainerClass = "default-rank-item-bg";
  let nicknameTextClass = "text-foreground";
  let titleText: string | null = null;
  let titleColorClass = "";
  let showCategoryIcon = true; 

  const { 
    rank: globalRank, 
    tetrisRank, 
    categoryStats, 
    selectedDisplayRank = 'default', // Default to 'default' if undefined
    username 
  } = author;

  const authorCategoryStats = categoryStats?.[postMainCategory];
  const categoryRankInContext = authorCategoryStats?.rankInCate || 0;

  // 1. Admin
  if (username === 'WANGJUNLAND') {
    itemContainerClass = "admin-badge-bg admin-badge-border px-1.5 py-0.5";
    nicknameTextClass = "text-admin";
    showCategoryIcon = false;
  }
  // 2. Global Community Rank Top 3 (Highest Priority for overall style)
  else if (globalRank <= 3) {
    itemContainerClass = cn(globalRank === 1 && 'rank-1-badge', globalRank === 2 && 'rank-2-badge', globalRank === 3 && 'rank-3-badge', "px-1.5 py-0.5");
    nicknameTextClass = globalRank === 1 ? 'text-rank-gold' : globalRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
    showCategoryIcon = true; // Can still show category icon for context
    titleText = null; // Global badge is primary title
  }
  // 3. Tetris Monthly Rank Top 3 (If not Global Top 3)
  else if (tetrisRank && tetrisRank <= 3) {
    titleText = tetrisTitles[tetrisRank - 1];
    titleColorClass = tetrisRank === 1 ? 'text-rank-gold' : tetrisRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
    nicknameTextClass = titleColorClass; // Nickname also gets gradient

    // Background: if also top in current post's category, use category highlight, else default.
    itemContainerClass = categoryRankInContext <= 3 ? cn(`highlight-${postMainCategory.toLowerCase()}`, "px-1.5 py-0.5") : "default-rank-item-bg px-1.5 py-0.5";
    showCategoryIcon = true;
  }
  // 4. Category Rank Top 3 in current post's main category (If not Global or Tetris Top 3)
  else if (categoryRankInContext <= 3) {
    titleText = postMainCategory === 'General' ? '일반 & 유머' : postMainCategory;
    titleColorClass = categoryRankInContext === 1 ? 'text-rank-gold' : categoryRankInContext === 2 ? 'text-rank-silver' : 'text-rank-bronze';
    nicknameTextClass = titleColorClass; // Nickname also gets gradient for Category Top 3
    
    itemContainerClass = cn(`highlight-${postMainCategory.toLowerCase()}`, "px-1.5 py-0.5");
    showCategoryIcon = true;
  }
  // 5. Category Rank 4-10 in current post's main category
  else if (categoryRankInContext <= 10) {
    itemContainerClass = "default-rank-item-bg px-1.5 py-0.5";
    nicknameTextClass = cn(`text-${postMainCategory.toLowerCase()}-themed`, `nickname-text-rank-${categoryRankInContext}`);
    showCategoryIcon = true;
    titleText = null;
  }
  // 6. Default
  else {
    itemContainerClass = "default-rank-item-bg px-1.5 py-0.5";
    nicknameTextClass = "text-foreground"; 
    showCategoryIcon = true; 
    titleText = null;
  }
  
  const NicknameWrapper = itemContainerClass.includes('highlight-general') && !itemContainerClass.includes('highlight-general-inner') ? 'div' : React.Fragment;
  const wrapperProps = NicknameWrapper === 'div' ? { className: 'highlight-general-inner' } : {};


  return (
    <div className="flex flex-col items-start"> {/* Changed to items-start */}
      {titleText && (
        <div className="title-container">
            <p className={cn("text-[0.65rem] leading-tight font-semibold tracking-tight", titleColorClass)}>
            {titleText}
            </p>
        </div>
      )}
      <NicknameWrapper {...wrapperProps}>
        <div className={cn(itemContainerClass, "inline-flex items-center gap-1 text-xs", titleText && "mt-0.5")}>
            {showCategoryIcon && <CategoryIcon category={postMainCategory} className="h-3 w-3" />}
            <span className={cn("nickname-text text-xs", nicknameTextClass)}>{author.nickname}</span>
        </div>
      </NicknameWrapper>
    </div>
  );
};


const PostItem = ({ post, currentUser, router }: { post: Post, currentUser: UserType | null, router: AppRouterInstance }) => {
  const author = mockUsers.find(u => u.id === post.authorId);
  
  const postDateToShow = post.isEdited && post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt);
  const formattedDate = `${postDateToShow.getFullYear()}년 ${postDateToShow.getMonth() + 1}월 ${postDateToShow.getDate()}일 ${postDateToShow.getHours()}시 ${postDateToShow.getMinutes()}분`;

  const isNotice = post.type === 'Notice' || post.type === 'Announcement';
  const isAdminPost = author?.username === 'WANGJUNLAND';

  return (
    <Card 
      className={cn(
        "shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out bg-card border-border hover:border-primary/30",
        post.isPinned && "border-t-4 border-accent dark:border-accent/80",
        isNotice && "bg-primary/10 dark:bg-primary/20 border-primary/50 dark:border-primary/70"
      )}
    >
      <Link href={`/tavern/${post.id}`} className="block hover:bg-card/5 transition-colors rounded-lg relative">
        <CardHeader className="pb-1 pt-2 px-3">
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-md mb-0.5 flex items-center text-foreground">
              {post.isPinned && <Pin className="h-4 w-4 mr-2 text-accent" />} 
              {isNotice && <ScrollText className="h-4 w-4 mr-2 text-primary" />}
              {post.title}
              {post.isEdited && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(수정됨)</span>}
            </CardTitle>
            {currentUser?.id === post.authorId && isAdminPost && ( 
              <div className="flex gap-1 absolute top-2 right-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={(e) => {e.preventDefault(); router.push(`/tavern/${post.id}/edit`); }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={(e) => {e.preventDefault(); alert('Delete clicked'); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground space-x-1.5 mt-1">
            <Avatar className="h-4 w-4 border border-border shrink-0">
              <AvatarImage src={author?.avatar} />
              <AvatarFallback className="text-[10px]">{author?.nickname.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {author && <NicknameDisplay author={author} postMainCategory={post.mainCategory} />}
            {!author && <span className="text-xs">{post.authorNickname}</span>}
            <span>·</span>
            <span className="text-xs">{formattedDate}</span>
            <span>·</span>
            <span className="capitalize text-xs">{post.type}</span>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-start items-center text-xs text-muted-foreground px-3 py-1 mt-1">
          <div className="flex gap-2 items-center">
            <span className="flex items-center text-[10px]"><ThumbsUp className="h-2.5 w-2.5 mr-0.5" /> {post.upvotes}</span>
            {isAdminPost && <span className="flex items-center text-[10px]"><ThumbsDown className="h-2.5 w-2.5 mr-0.5" /> {post.downvotes}</span>}
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
  { value: 'QnA', label: 'Q&A', icon: HelpCircle },
  { value: 'Knowledge', label: '지식', icon: BookOpen },
  { value: 'DevLog', label: '개발 일지', icon: ClipboardList },
  { value: 'popular', label: '인기 글', icon: Flame },
];

const generalSubTabs: SubTabInfo[] = [
  { value: 'GeneralPost', label: '일반 글', icon: MessageSquare },
  { value: 'Humor', label: '유머 글', icon: Smile },
  { value: 'Notice', label: '공지', icon: ScrollText},
  { value: 'popular', label: '인기 글', icon: Flame },
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
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-none lg:flex items-center">
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

const CategoryRankingCard: FC<{ category: PostMainCategory, currentUser: UserType | null }> = ({ category, currentUser }) => {
  const categoryDisplayName = category === 'General' ? '일반 & 유머' : category;

  const getTopNUsersForCategoryCard = useCallback((users: UserType[], cat: PostMainCategory, count: number): UserType[] => {
    return users
      .filter(u => u.username !== 'WANGJUNLAND' && u.categoryStats?.[cat]?.score && u.categoryStats[cat].score! > 0)
      .sort((a, b) => (b.categoryStats![cat]!.score || 0) - (a.categoryStats![cat]!.score || 0))
      .slice(0, count); // Rank is already pre-calculated in mockUsers
  }, []);
  
  const categoryRankers = useMemo(() => {
    return getTopNUsersForCategoryCard(mockUsers, category, RANKERS_TO_SHOW_TAVERN);
  }, [category, getTopNUsersForCategoryCard]);


  if (categoryRankers.length === 0) {
    return (
      <Card className="shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="font-headline text-foreground text-lg flex items-center gap-2">
            <CategoryIcon category={category} className="h-5 w-5" />
            {categoryDisplayName} 랭킹 TOP {RANKERS_TO_SHOW_TAVERN}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">아직 랭커가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="font-headline text-foreground text-lg flex items-center gap-2">
          <CategoryIcon category={category} className="h-5 w-5" />
          {categoryDisplayName} 랭킹 TOP {RANKERS_TO_SHOW_TAVERN}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categoryRankers.map((rankerUser) => {
          let itemContainerClass = "default-rank-item-bg";
          let nicknameTextClass = "text-foreground";
          let titleText: string | null = null;
          let titleColorClass = "";
          let showCategoryIconInRankItem = true;

          const { 
            rank: globalRank, 
            tetrisRank, 
            categoryStats, 
            username 
          } = rankerUser;
          const currentCategoryStats = categoryStats?.[category];
          const categoryRankInContext = currentCategoryStats?.rankInCate || 0;

          // Determine primary display style based on fixed priority
          if (globalRank <= 3) {
            itemContainerClass = cn(globalRank === 1 && 'rank-1-badge', globalRank === 2 && 'rank-2-badge', globalRank === 3 && 'rank-3-badge');
            nicknameTextClass = globalRank === 1 ? 'text-rank-gold' : globalRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
            showCategoryIconInRankItem = true; 
          } else if (tetrisRank && tetrisRank <= 3) {
            titleText = tetrisTitles[tetrisRank - 1];
            titleColorClass = tetrisRank === 1 ? 'text-rank-gold' : tetrisRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
            nicknameTextClass = titleColorClass;
            itemContainerClass = categoryRankInContext <= 3 ? cn(`highlight-${category.toLowerCase()}`) : "default-rank-item-bg";
            showCategoryIconInRankItem = true;
          } else if (categoryRankInContext <= 3) {
            titleText = category === 'General' ? '일반 & 유머' : category;
            titleColorClass = categoryRankInContext === 1 ? 'text-rank-gold' : categoryRankInContext === 2 ? 'text-rank-silver' : 'text-rank-bronze';
            nicknameTextClass = titleColorClass;
            itemContainerClass = cn(`highlight-${category.toLowerCase()}`);
            showCategoryIconInRankItem = true;
          } else if (categoryRankInContext <= 10) {
            itemContainerClass = "default-rank-item-bg";
            nicknameTextClass = cn(`text-${category.toLowerCase()}-themed`, `nickname-text-rank-${categoryRankInContext}`);
            showCategoryIconInRankItem = true;
          } else {
            itemContainerClass = "default-rank-item-bg";
            nicknameTextClass = "text-foreground";
            showCategoryIconInRankItem = true;
          }
          
          const NicknameWrapper = itemContainerClass.includes('highlight-general') && !itemContainerClass.includes('highlight-general-inner') ? 'div' : React.Fragment;
          const wrapperProps = NicknameWrapper === 'div' ? { className: 'highlight-general-inner' } : {};
          
          const displayRankNumber = categoryRankInContext || 0;
          let rankNumberColorClass = 'text-muted-foreground';
            if (globalRank <= 3) rankNumberColorClass = nicknameTextClass;
            else if (tetrisRank && tetrisRank <=3) rankNumberColorClass = titleColorClass;
            else if (categoryRankInContext <= 3) rankNumberColorClass = titleColorClass;
            else if (categoryRankInContext <= 10) rankNumberColorClass = cn(`text-${category.toLowerCase()}-themed`);


          return (
            <div key={rankerUser.id} className={cn("flex items-center justify-between p-2.5", itemContainerClass)}>
              <div className="flex items-center gap-2.5">
                <span className={cn("font-bold text-md w-5 text-center shrink-0", rankNumberColorClass)}>
                  {displayRankNumber > 0 ? `${displayRankNumber}.` : "-"}
                </span>
                <Avatar className="h-8 w-8 border-2 border-accent/70 shrink-0">
                  <AvatarImage src={rankerUser.avatar || `https://placehold.co/40x40.png?text=${rankerUser.nickname.substring(0,1)}`} alt={rankerUser.nickname} data-ai-hint="user avatar"/>
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{rankerUser.nickname.substring(0,1)}</AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-start text-left">
                   {titleText && (
                    <div className="title-container">
                        <p className={cn("text-[0.7rem] leading-tight font-semibold tracking-tight", titleColorClass)}>
                        {titleText}
                        </p>
                    </div>
                  )}
                  <NicknameWrapper {...wrapperProps}>
                    <div className={cn("flex items-center gap-1.5", NicknameWrapper === 'div' && "p-0", titleText && "mt-0.5")}>
                        {showCategoryIconInRankItem && <CategoryIcon category={category} className="h-4 w-4" />}
                        <span className={cn("text-sm nickname-text", nicknameTextClass)}>
                        {rankerUser.nickname}
                        </span>
                    </div>
                  </NicknameWrapper>
                </div>
              </div>
              {currentUser?.username === 'WANGJUNLAND' && (
                <span className="text-xs font-semibold text-accent shrink-0">
                  {(rankerUser.categoryStats?.[category]?.score || 0).toLocaleString()} 점
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};


export default function TavernPage() {
  const [mainCategory, setMainCategory] = useState<PostMainCategory>('Unity');
  const [subCategory, setSubCategory] = useState<PostType | 'popular' | 'all'>('QnA'); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAdmin } = useAuth(); 
  const router = useRouter(); 
  
  useEffect(() => { 
    const currentNewSubTabs = mainCategory === 'General' ? generalSubTabs : engineSubTabs;
    if (!currentNewSubTabs.find(tab => tab.value === subCategory)) {
       const firstSubTab = currentNewSubTabs.find(tab => tab.value !== 'popular');
       setSubCategory(firstSubTab ? firstSubTab.value : (currentNewSubTabs[0]?.value || 'all'));
    }
  }, [mainCategory, subCategory]);

  const handleMainCategoryChange = (newMainCategory: PostMainCategory) => {
    setMainCategory(newMainCategory);
    const currentNewSubTabs = newMainCategory === 'General' ? generalSubTabs : engineSubTabs;
    const firstSubTab = currentNewSubTabs.find(tab => tab.value !== 'popular');
    setSubCategory(firstSubTab ? firstSubTab.value : (currentNewSubTabs[0]?.value || 'all'));
    setCurrentPage(1);
  };

  const handleSubCategoryChange = (newSubCategoryValue: string) => {
    setSubCategory(newSubCategoryValue as PostType | 'popular'| 'all');
    setCurrentPage(1);
  }

  const currentSubTabSet = useMemo(() => {
    return mainCategory === 'General' ? generalSubTabs : engineSubTabs;
  }, [mainCategory]);

  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts].filter(p => p.mainCategory === mainCategory && p.authorId !== 'admin'); 
    
    if (searchTerm) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorNickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subCategory === 'popular') {
      posts = posts.sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.views - a.views);
    } else if (subCategory !== 'all') { 
      posts = posts.filter(p => p.type === subCategory);
      posts = posts.sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else { 
      posts = posts.sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    const notices = mockPosts.filter(p => p.mainCategory === mainCategory && p.authorId === 'admin' && (p.type === 'Notice' || p.type === 'Announcement'));
    const pinnedPosts = posts.filter(p => p.isPinned);
    const otherPosts = posts.filter(p => !p.isPinned);

    return [...notices.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), ...pinnedPosts, ...otherPosts];

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
          <Button asChild className="w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-primary-foreground hover:opacity-90 shadow-md">
            <Link href="/tavern/new">
              <PlusCircle className="mr-2 h-5 w-5" /> 새 글 작성
            </Link>
          </Button>
        )}
      </div>

      <Tabs value={mainCategory} onValueChange={(value) => handleMainCategoryChange(value as PostMainCategory)} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card border-border p-1.5 rounded-lg shadow-inner items-center">
          <TabsTrigger value="Unity" className="rounded-md px-4 py-1.5 flex items-center justify-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Box className="h-4 w-4" />Unity</TabsTrigger>
          <TabsTrigger value="Unreal" className="rounded-md px-4 py-1.5 flex items-center justify-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><AppWindow className="h-4 w-4" />Unreal</TabsTrigger>
          <TabsTrigger value="Godot" className="rounded-md px-4 py-1.5 flex items-center justify-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><PenTool className="h-4 w-4" />Godot</TabsTrigger>
          <TabsTrigger value="General" className="rounded-md px-4 py-1.5 flex items-center justify-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LayoutGrid className="h-4 w-4" />일반 & 유머</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SubTabsComponent 
            activeSubTab={subCategory}
            setActiveSubTab={handleSubCategoryChange}
            subTabs={currentSubTabSet}
            onSubTabChange={() => setCurrentPage(1)}
          />
          
          {currentPostsToDisplay.length > 0 ? (
            <div className="space-y-3"> 
              {currentPostsToDisplay.map((post) => (
                <PostItem key={post.id} post={post} currentUser={user} router={router} />
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
                    <Button variant="outline" size="icon" onClick={() => paginate(1)} disabled={currentPage === 1} className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8" aria-label="First page"><ChevronsLeft className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8" aria-label="Previous page"><ChevronLeft className="h-4 w-4"/></Button>
                    {renderPageNumbers()}
                    <Button variant="outline" size="icon" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8" aria-label="Next page"><ChevronRight className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="text-muted-foreground border-border hover:bg-muted/50 hover:border-accent/50 h-8 w-8" aria-label="Last page"><ChevronsRight className="h-4 w-4"/></Button>
                </div>
                <p className="text-sm text-muted-foreground">총 {totalPages} 페이지 중 {currentPage} 페이지</p>
            </div>
          )}
        </div>
        <aside className="lg:col-span-1 space-y-6 sticky top-20 self-start">
           <CategoryRankingCard category={mainCategory} currentUser={user} />
        </aside>
      </div>
    </div>
  );
}
    
