// src/app/(main)/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star } from 'lucide-react';
import Image from 'next/image';
import { mockPosts, mockRankings, mockUsers } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const popularPosts = mockPosts.sort((a, b) => b.views - a.views).slice(0, 3);
  const topRankers = mockRankings.filter(r => r.rank > 0 && r.rank <=3).slice(0, 3); 

  const getRankTextClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  };
  
  const getRankWrapperClass = (rank: number) => {
    if (rank === 1) return 'rank-1-border rank-1-badge-bg';
    if (rank === 2) return 'rank-2-border rank-2-badge-bg';
    if (rank === 3) return 'rank-3-border rank-3-badge-bg';
    return 'border-transparent';
  };


  const heroImageUrl = "https://placehold.co/1920x1080.png"; 

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <section 
        className="text-center py-32 md:py-48 rounded-xl shadow-xl mb-16 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
        data-ai-hint="epic fantasy landscape"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div> {/* Overlay for text readability */}
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold font-headline mb-6 text-primary-foreground drop-shadow-lg">인디 게임 개발의 모든 것</h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 drop-shadow-sm">
            스타터 프로젝트, 무료 에셋, 활발한 커뮤니티까지. 당신의 게임 개발 여정을 함께합니다.
          </p>
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Link href="/game-workshop">
              지금 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline text-primary">주요 기능</h2>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { title: '게임 공방', description: '다양한 엔진별 스타터 프로젝트를 만나보세요.', icon: Code, href:"/game-workshop" },
            { title: '무료 에셋', description: '매주 업데이트되는 무료 에셋 정보를 확인하세요.', icon: Gift, href:"/free-assets" },
            { title: '선술집 (커뮤니티)', description: '개발자들과 소통하고 정보를 공유하세요.', icon: MessageSquare, href:"/tavern" },
          ].map((feature) => (
            <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card border-border hover:border-primary/50">
              <CardHeader className="items-center">
                <feature.icon className="h-12 w-12 mb-4 text-accent" />
                <CardTitle className="font-headline text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
               <CardFooter className="justify-center">
                <Button variant="outline" asChild className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
                  <Link href={feature.href}>
                    바로가기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Community Highlights & Ranking */}
      <section className="grid lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline text-primary">커뮤니티 인기글</h2>
            <Button variant="outline" asChild className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/tavern">더 보기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-6">
            {popularPosts.map((post) => (
              <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card border-border hover:border-secondary/50">
                <CardHeader>
                  <CardTitle className="font-headline text-lg text-foreground">{post.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {post.authorNickname} · {new Date(post.createdAt).toLocaleDateString()} · 조회 {post.views}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                </CardContent>
                <CardFooter>
                   <Button variant="ghost" asChild size="sm" className="text-secondary hover:bg-secondary/10 hover:text-secondary/90">
                     <Link href={`/tavern/${post.id}`}>읽어보기</Link>
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
                    <span className={cn("font-bold text-lg w-6 text-center", getRankTextClass(ranker.rank))}>{ranker.rank}.</span>
                    <Image src={ranker.avatar || `https://placehold.co/40x40.png`} alt={ranker.nickname} width={40} height={40} className="rounded-full border-2 border-accent" data-ai-hint="fantasy character avatar" />
                    <div className={cn(
                        "font-medium rounded-lg px-3 py-1 border", // Changed from rounded-full
                        getRankWrapperClass(ranker.rank)
                      )}
                    >
                      <span className={getRankTextClass(ranker.rank)}>
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
