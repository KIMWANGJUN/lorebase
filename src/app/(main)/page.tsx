
// src/app/(main)/page.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star, Wand2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ThumbsUp, Trophy, Box, AppWindow, PenTool, LayoutGrid, Crown, Gamepad2 } from 'lucide-react';
import Image from 'next/image';
import { mockPosts, mockRankings, mockUsers } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { User, PostMainCategory } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const POSTS_PER_PAGE = 10;
const MAX_PAGES = 10;
const RANKERS_TO_SHOW = 10; 

const CategorySpecificIcon: React.FC<{ category: PostMainCategory, className?: string }> = ({ category, className }) => {
  const defaultClassName = "h-4 w-4";
  switch (category) {
    case 'Unity': return <Box className={cn(defaultClassName, "text-purple-400", className)} />;
    case 'Unreal': return <AppWindow className={cn(defaultClassName, "text-sky-400", className)} />;
    case 'Godot': return <PenTool className={cn(defaultClassName, "text-emerald-400", className)} />;
    case 'General': return <LayoutGrid className={cn(defaultClassName, "text-orange-400", className)} />;
    default: return null;
  }
};

const mockTetrisRankings = {
  monthly: [ // 주간 랭킹은 제거되었으므로 월간만 남깁니다.
    { id: 'trm1', nickname: 'TetrisGod', score: 2500000 },
    { id: 'trm2', nickname: 'ConsistentPlayer', score: 2200000 },
    { id: 'trm3', nickname: 'BlockMaster', score: 1900000 },
    { id: 'trm4', nickname: 'Marathoner', score: 1600000 },
    { id: 'trm5', nickname: 'TopTier', score: 1400000 },
    { id: 'trm6', nickname: 'StackerPro', score: 1350000 },
    { id: 'trm7', nickname: 'ComboKing', score: 1200000 },
  ]
};

const tetrisTitles = [
  '"테트리스" 그 자체',
  '"테트리스" 그랜드 마스터',
  '"테트리스" 마스터',
];


export default function HomePage() {
  const { isAdmin } = useAuth();
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

  const rankedUsersToDisplay = useMemo(() => {
    const users = mockUsers.filter(u => u.username !== 'WANGJUNLAND'); 
    if (activeRankingTab === 'Global') {
      return users.sort((a, b) => b.score - a.score).slice(0, RANKERS_TO_SHOW);
    }
    
    return users
      .filter(u => {
        const categoryStat = u.categoryStats?.[activeRankingTab as PostMainCategory];
        return categoryStat && categoryStat.score > 0;
      })
      .sort((a, b) => {
        const scoreA = a.categoryStats?.[activeRankingTab as PostMainCategory]?.score || 0;
        const scoreB = b.categoryStats?.[activeRankingTab as PostMainCategory]?.score || 0;
        return scoreB - scoreA;
      })
      .slice(0, RANKERS_TO_SHOW);
  }, [activeRankingTab]);

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
              <div className="space-y-2">
                {mockTetrisRankings.monthly.map((ranker, index) => (
                  <div key={ranker.id} className="flex items-center justify-between p-2.5 bg-background/30 rounded-lg border border-border/50 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold w-5 text-center shrink-0", 
                        index < 3 ? (index === 0 ? 'rank-1-text' : index === 1 ? 'rank-2-text' : 'rank-3-text') : 'text-muted-foreground'
                      )}>{index + 1}.</span>
                      <Avatar className="h-8 w-8 border-2 border-accent/50 shrink-0">
                          <AvatarImage src={`https://placehold.co/40x40.png?text=${ranker.nickname.substring(0,1)}`} alt={ranker.nickname} data-ai-hint="gamer avatar" />
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">{ranker.nickname.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        {index < 3 && tetrisTitles[index] && (
                          <p className={cn(
                            "text-[0.65rem] leading-tight font-semibold tracking-tight mb-0.5",
                            index === 0 && "text-yellow-400", // Gold
                            index === 1 && "text-slate-300",  // Silver
                            index === 2 && "text-orange-400"   // Bronze
                          )}>{tetrisTitles[index]}</p>
                        )}
                        <span className={cn("font-medium", 
                          index < 3 ? (index === 0 ? 'rank-1-text' : index === 1 ? 'rank-2-text' : 'rank-3-text') : 'text-foreground'
                        )}>{ranker.nickname}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-accent shrink-0">{ranker.score.toLocaleString()} 점</span>
                  </div>
                ))}
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
                  <TabsTrigger value="General" className="text-xs px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"><LayoutGrid className="h-3.5 w-3.5"/>일반</TabsTrigger>
                </TabsList>
                
                {(['Global', 'Unity', 'Unreal', 'Godot', 'General'] as (PostMainCategory | 'Global')[]).map(tabValue => (
                  <TabsContent key={tabValue} value={tabValue}>
                    {rankedUsersToDisplay.length > 0 ? (
                      <div className="space-y-3">
                        {rankedUsersToDisplay.map((ranker, index) => {
                          const displayRank = index + 1;
                          const isGlobalTop3 = activeRankingTab === 'Global' && displayRank <= 3;
                          // Corrected: Highlighting is based on the current displayRank (index + 1) within the filtered category list.
                          const isCategoryTop3 = activeRankingTab !== 'Global' && displayRank <= 3;


                          return (
                            <div key={ranker.id} className="flex items-center justify-between p-2.5 bg-background/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-2.5">
                                <span className={cn("font-bold text-md w-5 text-center", 
                                    isGlobalTop3 && displayRank === 1 && 'rank-1-text',
                                    isGlobalTop3 && displayRank === 2 && 'rank-2-text',
                                    isGlobalTop3 && displayRank === 3 && 'rank-3-text',
                                    isCategoryTop3 && displayRank === 1 && (activeRankingTab === 'Unity' ? 'text-unity-rank' : activeRankingTab === 'Unreal' ? 'text-unreal-rank' : activeRankingTab === 'Godot' ? 'text-godot-rank' : 'text-general-rank'),
                                    isCategoryTop3 && displayRank === 2 && (activeRankingTab === 'Unity' ? 'text-unity-rank opacity-80' : activeRankingTab === 'Unreal' ? 'text-unreal-rank opacity-80' : activeRankingTab === 'Godot' ? 'text-godot-rank opacity-80' : 'text-general-rank opacity-80'),
                                    isCategoryTop3 && displayRank === 3 && (activeRankingTab === 'Unity' ? 'text-unity-rank opacity-70' : activeRankingTab === 'Unreal' ? 'text-unreal-rank opacity-70' : activeRankingTab === 'Godot' ? 'text-godot-rank opacity-70' : 'text-general-rank opacity-70'),
                                    !isGlobalTop3 && !isCategoryTop3 && "text-muted-foreground"
                                )}>{displayRank}.</span>
                                <Avatar className="h-8 w-8 border-2 border-accent/70">
                                  <AvatarImage src={ranker.avatar || `https://placehold.co/40x40.png?text=${ranker.nickname.substring(0,1)}`} alt={ranker.nickname} data-ai-hint="fantasy character avatar" />
                                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{ranker.nickname.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <div className={cn("font-medium rounded-md px-2 py-0.5 text-sm flex items-center gap-1",
                                    isGlobalTop3 && displayRank === 1 && 'rank-1-badge',
                                    isGlobalTop3 && displayRank === 2 && 'rank-2-badge',
                                    isGlobalTop3 && displayRank === 3 && 'rank-3-badge',
                                    isCategoryTop3 && { 
                                      'category-rank-unity': activeRankingTab === 'Unity',
                                      'category-rank-unreal': activeRankingTab === 'Unreal',
                                      'category-rank-godot': activeRankingTab === 'Godot',
                                      'category-rank-general': activeRankingTab === 'General',
                                    }
                                  )}
                                >
                                  {isCategoryTop3 && <CategorySpecificIcon category={activeRankingTab as PostMainCategory} className="h-3.5 w-3.5" />}
                                  <span className={cn(
                                      "font-semibold",
                                      isGlobalTop3 && displayRank === 1 && 'rank-1-text',
                                      isGlobalTop3 && displayRank === 2 && 'rank-2-text',
                                      isGlobalTop3 && displayRank === 3 && 'rank-3-text',
                                      isCategoryTop3 && { 
                                        'text-unity-rank': activeRankingTab === 'Unity',
                                        'text-unreal-rank': activeRankingTab === 'Unreal',
                                        'text-godot-rank': activeRankingTab === 'Godot',
                                        'text-general-rank': activeRankingTab === 'General',
                                      },
                                      !isGlobalTop3 && !isCategoryTop3 && "text-foreground"
                                    )}
                                  >
                                    {ranker.nickname}
                                  </span>
                                </div>
                              </div>
                              {isAdmin && (
                                <span className="text-xs font-semibold text-accent">
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
