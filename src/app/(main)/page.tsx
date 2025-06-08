
// src/app/(main)/page.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star, Wand2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ThumbsUp, Trophy, Box, AppWindow, PenTool, LayoutGrid, Crown } from 'lucide-react';
import Image from 'next/image';
import { mockPosts, mockRankings, mockUsers } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { User, PostMainCategory } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const POSTS_PER_PAGE = 10;
const MAX_PAGES = 10;
const RANKERS_TO_SHOW = 5;

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

  const heroImageUrl = "https://placehold.co/1920x1080.png"; 
  const features = [
    { title: '게임 공방', description: '다양한 엔진별 스타터 프로젝트를 만나보세요.', icon: Code, href:"/game-workshop" },
    { title: '무료 에셋', description: '매주 업데이트되는 무료 에셋 정보를 확인하세요.', icon: Gift, href:"/free-assets" },
    { title: '선술집 (커뮤니티)', description: '개발자들과 소통하고 정보를 공유하세요.', icon: MessageSquare, href:"/tavern" },
  ];

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
    const users = mockUsers.filter(u => u.username !== 'WANGJUNLAND'); // Exclude admin
    if (activeRankingTab === 'Global') {
      return users.sort((a, b) => b.score - a.score).slice(0, RANKERS_TO_SHOW);
    }
    return users
      .filter(u => u.categoryStats && u.categoryStats[activeRankingTab] && u.categoryStats[activeRankingTab]!.score > 0)
      .sort((a, b) => (b.categoryStats![activeRankingTab]!.score || 0) - (a.categoryStats![activeRankingTab]!.score || 0))
      .slice(0, RANKERS_TO_SHOW);
  }, [activeRankingTab]);

  return (
    <div className="container mx-auto py-8 px-4">
      <section 
        className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-16 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
        data-ai-hint="epic fantasy landscape"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
           <h1 className="text-5xl md:text-6xl font-bold font-headline mb-6 text-primary-foreground drop-shadow-lg flex items-center justify-center">
            <Wand2 className="h-12 w-12 mr-4 text-accent animate-pulse" />
            인디 게임 개발의 모든 것
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-primary-foreground/90 drop-shadow-sm">
            스타터 프로젝트, 무료 에셋, 활발한 커뮤니티까지. 당신의 게임 개발 여정을 함께합니다.
          </p>
          <div className="mt-12 md:mt-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-primary-foreground/80 drop-shadow-sm">주요 기능</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-primary-foreground/10 border-primary-foreground/20 hover:border-primary-foreground/40 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="items-center pt-6">
                    <feature.icon className="h-10 w-10 mb-3 text-accent" />
                    <CardTitle className="font-headline text-primary-foreground text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-4 px-4">
                    <p className="text-sm text-primary-foreground/80">{feature.description}</p>
                  </CardContent>
                   <CardFooter className="justify-center pb-6">
                    <Button variant="outline" asChild className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground text-xs px-3 py-1.5 h-auto">
                      <Link href={feature.href}>
                        바로가기 <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-12 mb-16 mt-24">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline text-primary">커뮤니티 최신글</h2>
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
                        <CardTitle className="font-headline text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {post.title}
                        </CardTitle>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()} · {post.mainCategory} / {post.type}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center">
                              <ThumbsUp className="mr-1 h-3.5 w-3.5" /> {post.upvotes}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="mr-1 h-3.5 w-3.5" /> {post.commentCount}
                            </span>
                          </div>
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
                          const categoryRank = activeRankingTab !== 'Global' ? ranker.categoryStats?.[activeRankingTab]?.rank : undefined;
                          const isCategoryTop3 = categoryRank && categoryRank <= 3;

                          return (
                            <div key={ranker.id} className="flex items-center justify-between p-2.5 bg-background/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-2.5">
                                <span className={cn("font-bold text-md w-5 text-center", 
                                    isGlobalTop3 && displayRank === 1 && 'rank-1-text',
                                    isGlobalTop3 && displayRank === 2 && 'rank-2-text',
                                    isGlobalTop3 && displayRank === 3 && 'rank-3-text',
                                    !isGlobalTop3 && "text-muted-foreground"
                                )}>{displayRank}.</span>
                                <Avatar className="h-8 w-8 border-2 border-accent/70">
                                  <AvatarImage src={ranker.avatar || `https://placehold.co/40x40.png?text=${ranker.nickname.substring(0,1)}`} alt={ranker.nickname} data-ai-hint="fantasy character avatar" />
                                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{ranker.nickname.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <div className={cn("font-medium rounded-md px-2 py-0.5 text-sm flex items-center gap-1",
                                    isGlobalTop3 && displayRank === 1 && 'rank-1-badge',
                                    isGlobalTop3 && displayRank === 2 && 'rank-2-badge',
                                    isGlobalTop3 && displayRank === 3 && 'rank-3-badge',
                                    !isGlobalTop3 && isCategoryTop3 && activeRankingTab !== 'Global' && {
                                      'category-rank-unity': activeRankingTab === 'Unity',
                                      'category-rank-unreal': activeRankingTab === 'Unreal',
                                      'category-rank-godot': activeRankingTab === 'Godot',
                                      'category-rank-general': activeRankingTab === 'General',
                                    }
                                  )}
                                >
                                  {activeRankingTab !== 'Global' && isCategoryTop3 && <CategorySpecificIcon category={activeRankingTab} className="h-3.5 w-3.5" />}
                                  <span className={cn(
                                      "font-semibold",
                                      isGlobalTop3 && displayRank === 1 && 'rank-1-text',
                                      isGlobalTop3 && displayRank === 2 && 'rank-2-text',
                                      isGlobalTop3 && displayRank === 3 && 'rank-3-text',
                                      !isGlobalTop3 && isCategoryTop3 && activeRankingTab !== 'Global' && {
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
                                  {activeRankingTab === 'Global' ? ranker.score.toLocaleString() : (ranker.categoryStats?.[activeRankingTab]?.score || 0).toLocaleString()} 점
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
