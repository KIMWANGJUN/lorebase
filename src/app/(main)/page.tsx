// src/app/(main)/page.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardFooter from here if not used elsewhere, but it's a general Card component part
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star, Wand2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import { mockPosts, mockRankings, mockUsers } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const POSTS_PER_PAGE = 10;
const MAX_PAGES = 10;

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort all posts by newest first
  const allSortedPosts = [...mockPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get up to MAX_PAGES * POSTS_PER_PAGE newest posts for pagination
  const effectivePosts = allSortedPosts.slice(0, MAX_PAGES * POSTS_PER_PAGE);
  
  const totalPages = Math.ceil(effectivePosts.length / POSTS_PER_PAGE);

  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPostsToDisplay = effectivePosts.slice(indexOfFirstPost, indexOfLastPost);

  // Exclude admin (rank 0) and get top 3 actual ranked users
  const topRankers = mockRankings.filter(r => r.rank > 0 && r.rank <=3).slice(0, 3); 

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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <section 
        className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-16 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
        data-ai-hint="epic fantasy landscape"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div> {/* Overlay for text readability */}
        <div className="container mx-auto px-4 relative z-10">
           <h1 className="text-5xl md:text-6xl font-bold font-headline mb-6 text-primary-foreground drop-shadow-lg flex items-center justify-center">
            <Wand2 className="h-12 w-12 mr-4 text-accent animate-pulse" />
            인디 게임 개발의 모든 것
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-primary-foreground/90 drop-shadow-sm">
            스타터 프로젝트, 무료 에셋, 활발한 커뮤니티까지. 당신의 게임 개발 여정을 함께합니다.
          </p>
          
          {/* Moved Features Section */}
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

      {/* Community Highlights & Ranking */}
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
                      <CardHeader className="py-3 px-4"> {/* Adjusted padding for CardHeader */}
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
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">표시할 게시글이 없습니다.</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold text-center mb-8 font-headline text-primary">명예의 전당</h2>
          <Card className="shadow-xl bg-card border-border">
            <CardHeader>
              <CardTitle className="text-center font-headline text-foreground">주간 랭킹 TOP 3</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topRankers.map((ranker) => (
                <div key={ranker.userId} className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className={cn("font-bold text-lg w-6 text-center", 
                        ranker.rank === 1 && 'rank-1-text',
                        ranker.rank === 2 && 'rank-2-text',
                        ranker.rank === 3 && 'rank-3-text'
                    )}>{ranker.rank}.</span>
                    <Image src={ranker.avatar || `https://placehold.co/40x40.png`} alt={ranker.nickname} width={40} height={40} className="rounded-full border-2 border-accent" data-ai-hint="fantasy character avatar" />
                    <div className={cn(
                        "font-medium rounded-lg px-3 py-1 border",
                        ranker.rank === 1 && 'rank-1-badge',
                        ranker.rank === 2 && 'rank-2-badge',
                        ranker.rank === 3 && 'rank-3-badge'
                      )}
                    >
                      <span className={cn(
                        "font-semibold",
                        ranker.rank === 1 && 'rank-1-text',
                        ranker.rank === 2 && 'rank-2-text',
                        ranker.rank === 3 && 'rank-3-text'
                      )}>
                        {ranker.nickname}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-accent">{ranker.score.toLocaleString()} 점</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" asChild className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent/90">
                <Link href="/profile#ranking">전체 랭킹 보기</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
