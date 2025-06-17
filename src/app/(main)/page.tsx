
// src/app/(main)/page.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star, Wand2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ThumbsUp, Trophy, Box, AppWindow, PenTool, LayoutGrid, Crown, Gamepad2, User, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { User as UserType, PostMainCategory, AchievedRankType, Post, TetrisRanker } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import { getPosts } from '@/lib/postApi'; // Assuming you have these API functions
import { getCommunityRankers, getTetrisRankers } from '@/lib/rankingApi'; // Assuming you have these

const POSTS_PER_PAGE = 10;
const RANKERS_TO_SHOW_TETRIS = 20;
const COMMUNITY_RANKERS_PER_PAGE = 10;

const CategorySpecificIcon: React.FC<{ category: PostMainCategory, className?: string }> = ({ category, className }) => {
  const defaultClassName = "h-3.5 w-3.5 shrink-0";
  const iconColorClass =
    category === 'Unity' ? 'icon-unity' :
    category === 'Unreal' ? 'icon-unreal' :
    category === 'Godot' ? 'icon-godot' :
    'icon-general';

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
  const [communityRankingCurrentPage, setCommunityRankingCurrentPage] = useState(1);
  const [isGameSectionOpen, setIsGameSectionOpen] = useState(false);

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [postsForDisplay, setPostsForDisplay] = useState<Post[]>([]);
  const [totalPagesForPosts, setTotalPagesForPosts] = useState(0);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const [communityRankers, setCommunityRankers] = useState<UserType[]>([]);
  const [isLoadingCommunityRankers, setIsLoadingCommunityRankers] = useState(true);
  const [tetrisRankersDisplay, setTetrisRankersDisplay] = useState<TetrisRanker[]>([]);
  const [isLoadingTetrisRankers, setIsLoadingTetrisRankers] = useState(true);

  const toggleGameSection = useCallback(() => setIsGameSectionOpen(prev => !prev), []);

  useEffect(() => {
    // This would be an API call in a real app
    const fetchPosts = async () => {
        setIsLoadingPosts(true);
        // Replace with actual API call: const fetchedPosts = await getPosts({ limit: 50, sortBy: 'createdAt' });
        const fetchedPosts:Post[] = [];
        setAllPosts(fetchedPosts);
        setIsLoadingPosts(false);
    }
    fetchPosts();
  }, []);
  
  useEffect(() => {
    const indexOfLastPost = currentPage * POSTS_PER_PAGE;
    const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
    setPostsForDisplay(allPosts.slice(indexOfFirstPost, indexOfLastPost));
    setTotalPagesForPosts(Math.ceil(allPosts.length / POSTS_PER_PAGE));
  }, [currentPage, allPosts]);

  useEffect(() => {
    const fetchTetrisRankers = async () => {
        setIsLoadingTetrisRankers(true);
        // Replace with: const fetchedRankers = await getTetrisRankers({ limit: RANKERS_TO_SHOW_TETRIS });
        const fetchedRankers:TetrisRanker[] = [];
        setTetrisRankersDisplay(fetchedRankers);
        setIsLoadingTetrisRankers(false);
    }
    fetchTetrisRankers();
  }, []);

  useEffect(() => {
    const fetchCommunityRankers = async () => {
        setIsLoadingCommunityRankers(true);
        // Replace with: const fetchedRankers = await getCommunityRankers({ category: activeRankingTab, limit: 20 });
        const fetchedRankers:UserType[] = [];
        setCommunityRankers(fetchedRankers);
        setIsLoadingCommunityRankers(false);
    }
    fetchCommunityRankers();
  }, [activeRankingTab]);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPagesForPosts) {
      setCurrentPage(pageNumber);
    }
  };
    const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPagesForPosts, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    if (totalPagesForPosts === 0) return null;
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => paginate(i)}
          className={cn("h-8 w-8 p-0 font-headline", currentPage === i ? "bg-primary text-primary-foreground border-primary" : "border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90")}
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };
  
  const totalCommunityRankingPages = useMemo(() => {
    if (activeRankingTab === 'Global') return 1; 
    return Math.ceil(communityRankers.length / COMMUNITY_RANKERS_PER_PAGE);
  }, [activeRankingTab, communityRankers]);

  const currentCommunityRankersToDisplay = useMemo(() => {
    if (activeRankingTab === 'Global') return communityRankers.slice(0, 10);
    const startIndex = (communityRankingCurrentPage - 1) * COMMUNITY_RANKERS_PER_PAGE;
    const endIndex = startIndex + COMMUNITY_RANKERS_PER_PAGE;
    return communityRankers.slice(startIndex, endIndex);
  }, [communityRankers, communityRankingCurrentPage, activeRankingTab]);

  const handleRankingTabChange = (value: PostMainCategory | 'Global') => {
    setActiveRankingTab(value);
    setCommunityRankingCurrentPage(1);
  };

  return (
    <div className="py-8 px-4">
      <div className="flex justify-center mb-6">
        <Button 
          onClick={toggleGameSection}
          variant="outline"
          size="lg"
          className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90 font-headline transition-all duration-300"
        >
          <Gamepad2 className="mr-2 h-5 w-5" />
          {isGameSectionOpen ? '게임 섹션 닫기' : '게임 섹션 열기'}
          {isGameSectionOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>

      <section 
        className={cn(
          "game-section-container overflow-hidden transition-all duration-500 ease-in-out mb-16 mt-8",
          isGameSectionOpen 
            ? "max-h-[1000px] opacity-100" 
            : "max-h-0 opacity-0"
        )}
      >
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl bg-card border-border h-full">
              <CardHeader>
                <CardTitle className="font-headline text-center text-xl lg:text-2xl font-bold text-primary flex items-center justify-center">
                  <Gamepad2 className="inline-block h-6 w-6 lg:h-7 lg:w-7 mr-2 text-accent" />
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
                <Button className="mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg text-lg px-8 py-3">
                  <Gamepad2 className="mr-2 h-5 w-5" /> 게임 시작
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="shadow-xl bg-card border-border h-full">
              <CardHeader>
                <CardTitle className="font-headline text-center text-lg lg:text-xl font-bold text-foreground flex items-center justify-center">
                  <Trophy className="inline-block h-5 w-5 lg:h-6 lg:w-6 mr-2 text-accent" />
                  테트리스 월간 랭킹
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingTetrisRankers ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : tetrisRankersDisplay.length > 0 ? (
                  <div className="space-y-3">
                    {tetrisRankersDisplay.map((rankerData) => {
                      // This needs a way to get user info from rankerData.userId
                      return (
                        <div key={rankerData.userId} className="flex items-center justify-between p-2.5 bg-card/50 border-border/70 rounded-md shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-5 text-center shrink-0 text-muted-foreground text-sm">{rankerData.rank}.</span>
                             <Avatar className="h-8 w-8 border-2 border-accent/50 shrink-0">
                                <AvatarImage src={`https://placehold.co/40x40.png?text=${rankerData.nickname.substring(0,1)}`} alt={rankerData.nickname} />
                                <AvatarFallback className="text-xs bg-muted text-muted-foreground">{rankerData.nickname.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground text-sm">{rankerData.nickname}</span>
                          </div>
                          {isAdmin && (
                            <span className="text-xs font-semibold text-accent shrink-0">{rankerData.score.toLocaleString()} 점</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">테트리스 랭킹 정보가 없습니다.</p>
                )}
              </CardContent>
               <CardFooter className="justify-center pt-2">
                <Button variant="outline" size="sm" className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90">
                  전체 테트리스 순위 보기
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-12 mb-16 mt-12">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-2xl lg:text-3xl font-bold text-primary">최신 인기 글</h2>
            <Button variant="outline" size="sm" asChild className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90 text-sm">
              <Link href="/tavern">모든 글 보기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {isLoadingPosts ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-xl text-muted-foreground">게시글을 불러오는 중...</p>
            </div>
          ) : postsForDisplay.length > 0 ? (
            <>
              <div className="space-y-4">
                {postsForDisplay.map((post) => (
                  <Link href={`/tavern/${post.id}`} key={post.id} className="block no-underline hover:no-underline group">
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card border-border group-hover:border-primary/50 cursor-pointer">
                      <CardHeader className="py-3 px-4">
                       <div className="flex justify-between items-center">
                          <CardTitle className="text-base lg:text-lg font-headline font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
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
                           <FormattedDateDisplay dateString={post.createdAt} />
                           <span className="mx-1">·</span>
                           <span className="capitalize">{post.mainCategory} / {post.type}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
              {totalPagesForPosts > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="outline" size="icon" onClick={() => paginate(1)} disabled={currentPage === 1} className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90 h-8 w-8 font-headline" aria-label="First page"><ChevronsLeft className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90 h-8 w-8 font-headline" aria-label="Previous page"><ChevronLeft className="h-4 w-4"/></Button>
                        {renderPageNumbers()}
                        <Button variant="outline" size="icon" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPagesForPosts} className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90 h-8 w-8 font-headline" aria-label="Next page"><ChevronRight className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon" onClick={() => paginate(totalPagesForPosts)} disabled={currentPage === totalPagesForPosts} className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90 h-8 w-8 font-headline" aria-label="Last page"><ChevronsRight className="h-4 w-4"/></Button>
                    </div>
                    <p className="text-sm text-muted-foreground font-headline">총 {totalPagesForPosts} 페이지 중 {currentPage} 페이지</p>
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
              <CardTitle className="font-headline text-center text-lg lg:text-xl font-bold text-foreground">
                <Trophy className="inline-block h-5 w-5 lg:h-6 lg:w-6 mr-2 text-accent" />
                커뮤니티 랭킹
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs value={activeRankingTab} onValueChange={(value) => handleRankingTabChange(value as PostMainCategory | 'Global')} className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4 bg-card border-border p-1 rounded-lg shadow-inner">
                  <TabsTrigger value="Global">종합</TabsTrigger>
                  <TabsTrigger value="Unity"><Box className="h-3.5 w-3.5 mr-1"/>Unity</TabsTrigger>
                  <TabsTrigger value="Unreal"><AppWindow className="h-3.5 w-3.5 mr-1"/>Unreal</TabsTrigger>
                  <TabsTrigger value="Godot"><PenTool className="h-3.5 w-3.5 mr-1"/>Godot</TabsTrigger>
                  <TabsTrigger value="General"><LayoutGrid className="h-3.5 w-3.5 mr-1"/>일반</TabsTrigger>
                </TabsList>
                 <TabsContent value={activeRankingTab}>
                    {isLoadingCommunityRankers ? (
                       <div className="flex justify-center items-center h-40">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                       </div>
                    ) : currentCommunityRankersToDisplay.length > 0 ? (
                      <div className="space-y-3">
                        {currentCommunityRankersToDisplay.map((user) => {
                          const displayRank = activeRankingTab === 'Global' ? user.rank : user.categoryStats?.[activeRankingTab as PostMainCategory]?.rankInCate;
                          return (
                            <div key={user.id} className="flex items-center justify-between p-2.5 bg-card/50 border-border/70 rounded-md shadow-sm">
                               <div className="flex items-center gap-2.5">
                                <span className="font-bold text-sm w-5 text-center shrink-0 text-muted-foreground">
                                  {displayRank ? `${displayRank}.` : "-"}
                                </span>
                                <Avatar className="h-8 w-8 border-2 border-accent/70 shrink-0">
                                  <AvatarImage src={user.avatar} alt={user.nickname} />
                                  <AvatarFallback>{user.nickname.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <NicknameDisplay user={user} context="rankingList" activeCategory={activeRankingTab !== 'Global' ? activeRankingTab : undefined} />
                              </div>
                              {isAdmin && (
                                <span className="text-xs font-semibold text-accent shrink-0">
                                  {activeRankingTab === 'Global' ? user.score.toLocaleString() : (user.categoryStats?.[activeRankingTab as PostMainCategory]?.score || 0).toLocaleString()} 점
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">랭킹 정보가 없습니다.</p>
                    )}
                  </TabsContent>
              </Tabs>
               {totalCommunityRankingPages > 1 && activeRankingTab !== 'Global' && !isLoadingCommunityRankers && (
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm" onClick={() => setCommunityRankingCurrentPage(p => Math.max(1, p - 1))} disabled={communityRankingCurrentPage === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> 이전
                  </Button>
                  <span>{communityRankingCurrentPage} / {totalCommunityRankingPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCommunityRankingCurrentPage(p => Math.min(totalCommunityRankingPages, p + 1))} disabled={communityRankingCurrentPage === totalCommunityRankingPages}>
                    다음 <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <Button variant="outline" asChild>
                <Link href="/profile#ranking">전체 순위표 보기</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
