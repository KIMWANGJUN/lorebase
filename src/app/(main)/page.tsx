// src/app/(main)/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code, Compass, Gift, MessageSquare, Users, Star } from 'lucide-react';
import Image from 'next/image';
import { mockPosts, mockRankings } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const popularPosts = mockPosts.sort((a, b) => b.views - a.views).slice(0, 3);
  const topRankers = mockRankings.slice(0, 3);

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  };

  const heroImageUrl = "https://placehold.co/1920x1080.png"; // 관리자가 설정한 이미지 URL 예시

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <section 
        className="text-center py-24 rounded-xl shadow-xl mb-16 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
        data-ai-hint="community gaming landscape"
      >
        <div className="absolute inset-0 bg-black/60 rounded-xl z-0"></div> {/* Overlay for text readability */}
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-bold font-headline mb-6 text-primary-foreground">인디 게임 개발의 모든 것</h1>
          <p className="text-xl mb-8 text-primary-foreground/90">
            스타터 프로젝트, 무료 에셋, 활발한 커뮤니티까지. 당신의 게임 개발 여정을 함께합니다.
          </p>
          <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
            <Link href="/game-workshop">
              지금 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline">주요 기능</h2>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { title: '게임 공방', description: '다양한 엔진별 스타터 프로젝트를 만나보세요.', icon: Code, href:"/game-workshop" },
            { title: '무료 에셋', description: '매주 업데이트되는 무료 에셋 정보를 확인하세요.', icon: Gift, href:"/free-assets" },
            { title: '선술집 (커뮤니티)', description: '개발자들과 소통하고 정보를 공유하세요.', icon: MessageSquare, href:"/tavern" },
          ].map((feature) => (
            <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <feature.icon className="h-12 w-12 mb-4 text-primary" />
                <CardTitle className="font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
               <CardFooter className="justify-center">
                <Button variant="outline" asChild>
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
            <h2 className="text-3xl font-bold font-headline">커뮤니티 인기글</h2>
            <Button variant="outline" asChild>
              <Link href="/tavern">더 보기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-6">
            {popularPosts.map((post) => (
              <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">{post.title}</CardTitle>
                  <CardDescription>
                    {post.authorNickname} · {new Date(post.createdAt).toLocaleDateString()} · 조회 {post.views}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                </CardContent>
                <CardFooter>
                   <Button variant="ghost" asChild size="sm">
                     <Link href={`/tavern/${post.id}`}>읽어보기</Link>
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">명예의 전당</h2>
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center font-headline">주간 랭킹 TOP 3</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topRankers.map((ranker, index) => (
                <div key={ranker.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={cn("font-bold text-lg w-6 text-center", getRankClass(ranker.rank))}>{ranker.rank}.</span>
                    <Image src={ranker.avatar || `https://placehold.co/40x40.png`} alt={ranker.nickname} width={40} height={40} className="rounded-full" data-ai-hint="profile avatar" />
                    <span className={cn("font-medium", getRankClass(ranker.rank), ranker.nickname === 'WANGJUNLAND' && 'text-admin')}>{ranker.nickname}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{ranker.score.toLocaleString()} 점</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" asChild>
                <Link href="/profile#ranking">전체 랭킹 보기</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
