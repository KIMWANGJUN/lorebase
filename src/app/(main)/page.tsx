
// src/app/(main)/page.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star, Wand2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ThumbsUp, Trophy, Box, AppWindow, PenTool, LayoutGrid, Crown, Gamepad2, User } from 'lucide-react';
import Image from 'next/image';
import { mockUsers, mockPosts, mockTetrisRankings, tetrisTitles } from '@/lib/mockData'; 
import { cn } from '@/lib/utils';
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { User as UserType, PostMainCategory, DisplayRankType } from '@/types'; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const POSTS_PER_PAGE = 10;
const MAX_PAGES = 10; // Max pages to fetch for "latest posts" section for performance
const RANKERS_TO_SHOW = 20; 

const CategorySpecificIcon: React.FC<{ category: PostMainCategory, className?: string }> = ({ category, className }) => {
  const defaultClassName = "h-3.5 w-3.5 shrink-0";
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
  const { user: currentUser } = useAuth(); 
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRankingTab, setActiveRankingTab] = useState<PostMainCategory | 'Global'>('Global');

  const allSortedPosts = [...mockPosts].filter(p => p.authorId !== 'admin').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  
  const getTopNUsers = useCallback((users: UserType[], category: PostMainCategory | 'Global', count: number): UserType[] => {
    const usersToRank = users.filter(u => u.username !== 'WANGJUNLAND'); 

    let sortedUsers;
    if (category === 'Global') {
      sortedUsers = [...usersToRank].sort((a, b) => b.score - a.score);
    } else {
      sortedUsers = [...usersToRank]
        .filter(u => u.categoryStats && u.categoryStats[category] && typeof u.categoryStats[category]?.score === 'number')
        .sort((a, b) => (b.categoryStats![category]!.score || 0) - (a.categoryStats![category]!.score || 0));
    }
    return sortedUsers.slice(0, count);
  }, []);

  const rankedUsersToDisplay = useMemo(() => {
    return getTopNUsers(mockUsers, activeRankingTab, RANKERS_TO_SHOW);
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
                {mockTetrisRankings.slice(0, RANKERS_TO_SHOW).map((rankerData) => {
                  const isTetrisTop3 = rankerData.rank <= 3;
                  let titleClass = "";
                  let nicknameClass = "text-foreground"; // Default
                  let rankNumberClass = "text-muted-foreground";

                  if (isTetrisTop3) {
                    if (rankerData.rank === 1) { titleClass = 'text-rank-gold'; nicknameClass = 'text-rank-gold'; rankNumberClass = 'text-rank-gold'; }
                    else if (rankerData.rank === 2) { titleClass = 'text-rank-silver'; nicknameClass = 'text-rank-silver'; rankNumberClass = 'text-rank-silver'; }
                    else if (rankerData.rank === 3) { titleClass = 'text-rank-bronze'; nicknameClass = 'text-rank-bronze'; rankNumberClass = 'text-rank-bronze'; }
                  }
                  
                  return (
                    <div key={rankerData.userId} className="flex items-center justify-between p-2.5 default-rank-item-bg">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold w-5 text-center shrink-0", rankNumberClass)}>{rankerData.rank}.</span>
                        <Avatar className="h-8 w-8 border-2 border-accent/50 shrink-0">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${rankerData.nickname.substring(0,1)}`} alt={rankerData.nickname} data-ai-hint="gamer avatar" />
                            <AvatarFallback className="text-xs bg-muted text-muted-foreground">{rankerData.nickname.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          {isTetrisTop3 && tetrisTitles[rankerData.rank - 1] && (
                             <div className="title-container">
                                <p className={cn("text-[0.7rem] leading-tight font-semibold tracking-tight", titleClass)}>
                                {tetrisTitles[rankerData.rank - 1]}
                                </p>
                            </div>
                          )}
                          <span className={cn("text-sm", nicknameClass)}>
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
                        {rankedUsersToDisplay.map((ranker, index) => {
                          const user = mockUsers.find(u => u.id === ranker.id);
                          if (!user || user.username === 'WANGJUNLAND') return null;
                          
                          let finalItemContainerClass = "default-rank-item-bg";
                          let finalNicknameTextClass = "text-foreground";
                          let finalTitleText: string | null = null;
                          let finalTitleColorClass = "";
                          let showCategoryIcon = false;
                          let displayRankNumberToShow = 0;
                          let rankNumberColorClass = 'text-muted-foreground';

                          const { rank: globalRank, tetrisRank, categoryStats } = user;
                          const currentCategory = activeRankingTab !== 'Global' ? activeRankingTab : undefined;
                          const userCatStats = currentCategory && categoryStats?.[currentCategory];
                          const rankInCurrentCategory = userCatStats?.rankInCate || 0;

                          // Determine display rank number
                          displayRankNumberToShow = tabValue === 'Global' ? globalRank : rankInCurrentCategory;
                          if (displayRankNumberToShow === 0 && tabValue !== 'Global' && globalRank > 0) { // Fallback for category tab if no cat rank but has global rank
                             // displayRankNumberToShow = globalRank; // Or keep it 0/'-' to show they are unranked in category
                          }


                          // 1. Global Rank Top 3
                          if (globalRank > 0 && globalRank <= 3) {
                            finalItemContainerClass = cn(globalRank === 1 && 'rank-1-badge', globalRank === 2 && 'rank-2-badge', globalRank === 3 && 'rank-3-badge');
                            finalNicknameTextClass = globalRank === 1 ? 'text-rank-gold' : globalRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
                            rankNumberColorClass = finalNicknameTextClass;
                            showCategoryIcon = currentCategory !== undefined; 
                          }
                          // 2. Tetris Rank Top 3 (if not Global Top 3)
                          else if (tetrisRank && tetrisRank > 0 && tetrisRank <= 3) {
                            finalTitleText = tetrisTitles[tetrisRank - 1];
                            finalTitleColorClass = tetrisRank === 1 ? 'text-rank-gold' : tetrisRank === 2 ? 'text-rank-silver' : 'text-rank-bronze';
                            finalNicknameTextClass = finalTitleColorClass;
                            rankNumberColorClass = finalTitleColorClass;
                            showCategoryIcon = currentCategory !== undefined;
                            if (currentCategory && rankInCurrentCategory > 0 && rankInCurrentCategory <= 3) {
                                finalItemContainerClass = cn(`highlight-${currentCategory.toLowerCase()}`);
                            }
                          }
                          // 3. Category Rank Top 3 (if not Global or Tetris Top 3)
                          else if (currentCategory && rankInCurrentCategory > 0 && rankInCurrentCategory <= 3) {
                            finalTitleText = currentCategory === 'General' ? '일반 & 유머' : currentCategory;
                            finalTitleColorClass = rankInCurrentCategory === 1 ? 'text-rank-gold' : rankInCurrentCategory === 2 ? 'text-rank-silver' : 'text-rank-bronze';
                            finalNicknameTextClass = finalTitleColorClass; // Category Top 3 nicknames are also gradient
                            rankNumberColorClass = finalTitleColorClass;
                            finalItemContainerClass = cn(`highlight-${currentCategory.toLowerCase()}`);
                            showCategoryIcon = true;
                          }
                          // 4. Category Rank 4-10 (if not any above)
                          else if (currentCategory && rankInCurrentCategory > 0 && rankInCurrentCategory <= 10) {
                            finalNicknameTextClass = cn(`text-${currentCategory.toLowerCase()}-themed`, `nickname-text-rank-${rankInCurrentCategory}`);
                            rankNumberColorClass = `text-${currentCategory.toLowerCase()}-themed`;
                            showCategoryIcon = true;
                          }
                           // 5. Default (if no other rank applies or on Global tab and not top 3)
                          else {
                            showCategoryIcon = currentCategory !== undefined;
                            // Nickname and rank number color remain default (text-foreground, text-muted-foreground)
                          }
                          
                          const NicknameWrapper = finalItemContainerClass.includes('highlight-general') && !finalItemContainerClass.includes('highlight-general-inner') ? 'div' : React.Fragment;
                          const wrapperProps = NicknameWrapper === 'div' ? { className: 'highlight-general-inner p-0' } : {};
                          
                          return (
                            <div key={user.id} className={cn("flex items-center justify-between p-2.5", finalItemContainerClass)}>
                               <div className="flex items-center gap-2.5">
                                <span className={cn("font-bold text-md w-5 text-center shrink-0", rankNumberColorClass)}>
                                  {displayRankNumberToShow > 0 ? `${displayRankNumberToShow}.` : "-"}
                                </span>
                                <Avatar className="h-8 w-8 border-2 border-accent/70 shrink-0">
                                  <AvatarImage src={user.avatar || `https://placehold.co/40x40.png?text=${user.nickname.substring(0,1)}`} alt={user.nickname} data-ai-hint="fantasy character avatar" />
                                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{user.nickname.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                
                                <div className="flex flex-col items-start text-left">
                                  {finalTitleText && (
                                    <div className="title-container">
                                      <p className={cn("text-[0.7rem] leading-tight font-semibold tracking-tight", finalTitleColorClass)}>
                                        {finalTitleText}
                                      </p>
                                    </div>
                                  )}
                                   <NicknameWrapper {...wrapperProps}>
                                    <div className={cn("flex items-center gap-1.5", NicknameWrapper === 'div' && "p-0", finalTitleText && "mt-0.5")}>
                                        {showCategoryIcon && activeRankingTab !== 'Global' && (
                                          <CategorySpecificIcon category={activeRankingTab} className="h-4 w-4" />
                                        )}
                                        <span className={cn("text-sm nickname-text", finalNicknameTextClass)}>
                                        {user.nickname}
                                        </span>
                                    </div>
                                   </NicknameWrapper>
                                </div>
                              </div>
                              {currentUser?.username === 'WANGJUNLAND' && ( 
                                <span className="text-xs font-semibold text-accent shrink-0">
                                  {activeRankingTab === 'Global' ? user.score.toLocaleString() : (userCatStats?.score || 0).toLocaleString()} 점
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
