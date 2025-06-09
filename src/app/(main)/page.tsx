
// src/app/(main)/page.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star, Wand2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ThumbsUp, Trophy, Box, AppWindow, PenTool, LayoutGrid, Crown, Gamepad2, User } from 'lucide-react';
import Image from 'next/image';
import { mockPosts, mockUsers, mockTetrisRankings, tetrisTitles } from '@/lib/mockData'; 
import { cn } from '@/lib/utils';
import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { User as UserType, PostMainCategory } from '@/types'; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const POSTS_PER_PAGE = 10;
const MAX_PAGES = 10;
const RANKERS_TO_SHOW = 20; 

const CategorySpecificIcon: React.FC<{ category: PostMainCategory, className?: string }> = ({ category, className }) => {
  const defaultClassName = "h-4 w-4 shrink-0";
  let iconColorClass = "";
  switch (category) {
    case 'Unity': iconColorClass = "text-unity-icon"; break;
    case 'Unreal': iconColorClass = "text-unreal-icon"; break;
    case 'Godot': iconColorClass = "text-godot-icon"; break;
    case 'General': iconColorClass = "text-general-icon"; break;
    default: iconColorClass = "text-muted-foreground"; break;
  }

  switch (category) {
    case 'Unity': return <Box className={cn(defaultClassName, iconColorClass, className)} />;
    case 'Unreal': return <AppWindow className={cn(defaultClassName, iconColorClass, className)} />;
    case 'Godot': return <PenTool className={cn(defaultClassName, iconColorClass, className)} />;
    case 'General': return <LayoutGrid className={cn(defaultClassName, iconColorClass, className)} />;
    default: return null;
  }
};


export default function HomePage() {
  const { user: currentUser, isAdmin } = useAuth(); 
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRankingTab, setActiveRankingTab] = useState<PostMainCategory | 'Global'>('Global');

  const allSortedPosts = [...mockPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const effectivePosts = allSortedPosts.slice(0, MAX_PAGES * POSTS_PER_PAGE);
  const totalPages = Math.ceil(effectivePosts.length / POSTS_PER_PAGE);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPostsToDisplay = effectivePosts.slice(indexOfFirstPost, indexOfLastPost);

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
  
  const getTopNUsers = useCallback((users: UserType[], category: PostMainCategory | 'Global', count: number): (UserType & { categoryRankInList?: number })[] => {
    const usersWithValidCategoryStats = users.filter(u => {
      if (category === 'Global') return true; 
      return u.categoryStats && u.categoryStats[category] && typeof u.categoryStats[category]?.score === 'number';
    });

    const sortedUsers = [...usersWithValidCategoryStats].sort((a, b) => {
      if (category === 'Global') {
        return b.score - a.score;
      }
      const scoreA = a.categoryStats?.[category]?.score ?? -1;
      const scoreB = b.categoryStats?.[category]?.score ?? -1;
      return scoreB - scoreA;
    });

    return sortedUsers.slice(0, count).map((u, index) => ({
      ...u,
      categoryRankInList: index + 1, 
    }));
  }, []);

  const rankedUsersToDisplay = useMemo(() => {
    const usersToRank = mockUsers.filter(u => u.username !== 'WANGJUNLAND');
    return getTopNUsers(usersToRank, activeRankingTab, RANKERS_TO_SHOW);
  }, [activeRankingTab, getTopNUsers]);

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="grid lg:grid-cols-3 gap-8 mb-16 mt-8">
        <div className="lg:col-span-2">
          <Card className="shadow-xl bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-center font-headline text-2xl text-primary flex items-center justify-center">
                <Gamepad2 className="inline-block h-7 w-7 mr-2 text-accent" />
                플레이 테트리스
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Tetris Game Placeholder" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-md border border-border"
                data-ai-hint="tetris game screen"
              />
              <Button className="mt-6 bg-gradient-to-r from-green-500 to-teal-500 text-primary-foreground hover:opacity-90 shadow-lg text-lg px-8 py-3">
                <Gamepad2 className="mr-2 h-5 w-5" /> 게임 시작
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="shadow-xl bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-center font-headline text-xl text-foreground flex items-center justify-center">
                <Trophy className="inline-block h-6 w-6 mr-2 text-accent" />
                테트리스 월간 랭킹
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {mockTetrisRankings.monthly.slice(0, RANKERS_TO_SHOW).map((rankerData, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  let titleClass = "";
                  if (isTop3) {
                    if (rank === 1) titleClass = 'text-rank-gold';
                    else if (rank === 2) titleClass = 'text-rank-silver';
                    else if (rank === 3) titleClass = 'text-rank-bronze';
                  }
                  
                  return (
                    <div key={rankerData.userId || rankerData.nickname} className="flex items-center justify-between p-2.5 bg-background/30 rounded-lg border border-border/50 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold w-5 text-center shrink-0", isTop3 ? titleClass : 'text-muted-foreground')}>{rank}.</span>
                        <Avatar className="h-8 w-8 border-2 border-accent/50 shrink-0">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${rankerData.nickname.substring(0,1)}`} alt={rankerData.nickname} data-ai-hint="gamer avatar" />
                            <AvatarFallback className="text-xs bg-muted text-muted-foreground">{rankerData.nickname.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          {isTop3 && tetrisTitles[rank - 1] && (
                            <p className={cn("text-[0.7rem] leading-tight font-semibold tracking-tight mb-0.5", titleClass)}>
                              {tetrisTitles[rank - 1]}
                            </p>
                          )}
                          <span className={cn("font-medium", isTop3 ? titleClass : 'text-foreground')}>
                            {rankerData.nickname}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-accent shrink-0">{rankerData.score.toLocaleString()} 점</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
             <CardFooter className="justify-center pt-2">
              <Button variant="outline" size="sm" className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90">
                전체 테트리스 순위 보기
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-12 mb-16 mt-12">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline text-primary">최신 인기 글</h2>
            <Button variant="outline" asChild className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/tavern">모든 글 보기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {currentPostsToDisplay.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentPostsToDisplay.map((post) => (
                  <Link href={`/tavern/${post.id}`} key={post.id} className="block no-underline hover:no-underline group">
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card border-border group-hover:border-primary/50 cursor-pointer">
                      <CardHeader className="py-3 px-4">
                       <div className="flex justify-between items-center">
                          <CardTitle className="font-headline text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {post.title}
                             {post.isEdited && <span className="ml-2 text-xs font-normal text-muted-foreground">(수정됨)</span>}
                          </CardTitle>
                           <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <ThumbsUp className="mr-1 h-3.5 w-3.5" /> {post.upvotes}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="mr-1 h-3.5 w-3.5" /> {post.commentCount}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                           <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                           <span className="mx-1">·</span>
                           <span>{post.mainCategory} / {post.type}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
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
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">표시할 게시글이 없습니다.</p>
            </div>
          )}
        </div>

        <div>
          <Card className="shadow-xl bg-card border-border">
            <CardHeader>
              <CardTitle className="text-center font-headline text-xl text-foreground">
                <Trophy className="inline-block h-6 w-6 mr-2 text-accent" />
                커뮤니티 랭킹
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs value={activeRankingTab} onValueChange={(value) => setActiveRankingTab(value as PostMainCategory | 'Global')} className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4 bg-card border-border p-1 rounded-lg shadow-inner">
                  <TabsTrigger value="Global" className="text-xs px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">종합</TabsTrigger>
                  <TabsTrigger value="Unity" className="text-xs px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"><Box className="h-3.5 w-3.5"/>Unity</TabsTrigger>
                  <TabsTrigger value="Unreal" className="text-xs px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"><AppWindow className="h-3.5 w-3.5"/>Unreal</TabsTrigger>
                  <TabsTrigger value="Godot" className="text-xs px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"><PenTool className="h-3.5 w-3.5"/>Godot</TabsTrigger>
                  <TabsTrigger value="General" className="text-xs px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"><LayoutGrid className="h-3.5 w-3.5"/>일반 & 유머</TabsTrigger>
                </TabsList>
                
                {(['Global', 'Unity', 'Unreal', 'Godot', 'General'] as (PostMainCategory | 'Global')[]).map(tabValue => (
                  <TabsContent key={tabValue} value={tabValue}>
                    {rankedUsersToDisplay.length > 0 ? (
                      <div className="space-y-3">
                        {rankedUsersToDisplay.map((ranker) => {
                          const displayRank = activeRankingTab === 'Global' ? ranker.rank : ranker.categoryRankInList || 0;
                          const isGlobalTab = activeRankingTab === 'Global';
                          const isGlobalTop3 = isGlobalTab && ranker.rank > 0 && ranker.rank <= 3;
                          const isCategoryTop3 = !isGlobalTab && displayRank > 0 && displayRank <= 3;
                          const isCategoryTop10 = !isGlobalTab && displayRank > 0 && displayRank <= 10;
                          const isCategoryTop20 = !isGlobalTab && displayRank > 0 && displayRank <= 20;
                          
                          let titleText: string | null = null;
                          let titleColorClass = "";
                          let itemContainerClass = "default-rank-item-bg p-2.5"; 
                          let nicknameTextClass = "text-foreground"; 

                          if (isGlobalTop3) {
                            if (ranker.rank === 1) itemContainerClass = 'rank-1-badge';
                            else if (ranker.rank === 2) itemContainerClass = 'rank-2-badge';
                            else if (ranker.rank === 3) itemContainerClass = 'rank-3-badge';
                            
                            if (ranker.rank === 1) nicknameTextClass = 'text-rank-gold';
                            else if (ranker.rank === 2) nicknameTextClass = 'text-rank-silver';
                            else if (ranker.rank === 3) nicknameTextClass = 'text-rank-bronze';
                          } else if (activeRankingTab !== 'Global') {
                            const currentCategory = activeRankingTab as PostMainCategory;
                            if (isCategoryTop3) {
                                titleText = currentCategory === 'General' ? '일반 & 유머' : currentCategory;
                                if (displayRank === 1) titleColorClass = 'text-rank-gold';
                                else if (displayRank === 2) titleColorClass = 'text-rank-silver';
                                else if (displayRank === 3) titleColorClass = 'text-rank-bronze';
                                
                                if (currentCategory === 'Unity') itemContainerClass = 'highlight-unity';
                                else if (currentCategory === 'Unreal') itemContainerClass = 'highlight-unreal';
                                else if (currentCategory === 'Godot') itemContainerClass = 'highlight-godot';
                                else if (currentCategory === 'General') itemContainerClass = 'highlight-general';
                            }
                            // Nickname text style for category ranks 1-10
                            if (isCategoryTop10) {
                                nicknameTextClass = `nickname-text-rank-${displayRank}`;
                                // For .highlight-general, text color is handled by its specific CSS
                                if (currentCategory !== 'General') {
                                  // Base color from highlight class, then modified by rank class
                                } else {
                                   nicknameTextClass = cn(nicknameTextClass, 'nickname-text'); // for rainbow bg
                                }
                            }
                          }
                          
                          const NicknameWrapper = activeRankingTab === 'General' && isCategoryTop3 ? 'div' : React.Fragment;
                          const wrapperProps = activeRankingTab === 'General' && isCategoryTop3 ? { className: 'p-0' } : {};


                          return (
                            <div key={ranker.id} className={cn("flex items-center justify-between", itemContainerClass)}>
                               <div className="flex items-center gap-2.5">
                                <span className={cn("font-bold text-md w-5 text-center shrink-0", 
                                    isGlobalTop3 && nicknameTextClass, // Uses gold/silver/bronze from global rank
                                    !isGlobalTop3 && isCategoryTop3 && titleColorClass, 
                                    !isGlobalTop3 && !isCategoryTop3 && "text-muted-foreground"
                                )}>{displayRank}.</span>
                                <Avatar className="h-8 w-8 border-2 border-accent/70 shrink-0">
                                  <AvatarImage src={ranker.avatar || `https://placehold.co/40x40.png?text=${ranker.nickname.substring(0,1)}`} alt={ranker.nickname} data-ai-hint="fantasy character avatar" />
                                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{ranker.nickname.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                
                                <div className="flex flex-col items-start text-left">
                                  {titleText && (
                                    <p className={cn("text-[0.7rem] leading-tight font-semibold tracking-tight mb-0.5", titleColorClass)}>
                                      {titleText}
                                    </p>
                                  )}
                                   <NicknameWrapper {...wrapperProps}>
                                    <div className={cn("flex items-center gap-1.5", activeRankingTab === 'General' && isCategoryTop3 && "p-0")}>
                                        {activeRankingTab !== 'Global' && isCategoryTop20 && (
                                        <CategorySpecificIcon category={activeRankingTab as PostMainCategory} className="h-3.5 w-3.5" />
                                        )}
                                        <span className={cn("font-medium text-sm nickname-text", nicknameTextClass)}>
                                        {ranker.nickname}
                                        </span>
                                    </div>
                                   </NicknameWrapper>
                                </div>
                              </div>
                              {isAdmin && (
                                <span className="text-xs font-semibold text-accent shrink-0">
                                  {activeRankingTab === 'Global' ? ranker.score.toLocaleString() : (ranker.categoryStats?.[activeRankingTab as PostMainCategory]?.score || 0).toLocaleString()} 점
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">해당 카테고리의 랭커 정보가 없습니다.</p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <Button variant="outline" asChild className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90">
                <Link href="/profile#ranking">전체 순위표 보기</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}

    