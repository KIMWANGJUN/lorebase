// src/app/(main)/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post, PostMainCategory, TetrisRanker, RankEntry, Ranking } from '@/types';
import PostList from '@/components/shared/PostList';
import CategoryRankingSidebar from '@/components/shared/CategoryRankingSidebar';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import { getPosts } from '@/lib/postApi';
import { getRankings, getTetrisRankers } from '@/lib/rankingApi';
import { 
  Gamepad2, TrendingUp, Crown, Star, 
  ThumbsUp, Eye, MessageSquare, Play, Trophy,
  Box, AppWindow, PenTool, LayoutGrid,
  Clock, Flame, Award, Hammer, Beer, Gift, Sparkles
} from 'lucide-react';

// 수채화 스켈레톤 컴포넌트들
function FeaturedPostSkeleton() {
  return (
    <Card className="mb-8 watercolor-card animate-watercolor-pulse">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2 bg-gradient-to-r from-watercolor-primary/20 to-watercolor-secondary/20" />
        <Skeleton className="h-4 w-1/4 bg-watercolor-accent/20" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-watercolor-primary/10" />
          <Skeleton className="h-4 w-full bg-watercolor-secondary/10" />
          <Skeleton className="h-4 w-5/6 bg-watercolor-accent/10" />
        </div>
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-5 w-20 bg-watercolor-primary/15" />
          <Skeleton className="h-5 w-24 bg-watercolor-secondary/15" />
        </div>
      </CardContent>
    </Card>
  );
}

function RankingSkeleton() {
  return (
    <Card className="watercolor-card">
      <CardHeader>
        <Skeleton className="h-6 w-32 bg-gradient-to-r from-watercolor-primary/20 to-watercolor-secondary/20" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full bg-watercolor-accent/30" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1 bg-watercolor-primary/15" />
              <Skeleton className="h-3 w-16 bg-watercolor-secondary/15" />
            </div>
            <Skeleton className="h-4 w-12 bg-watercolor-accent/20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const getCategoryPath = (category: PostMainCategory): string => {
  const paths: Record<PostMainCategory, string> = {
    'Unity': 'tavern', 'Unreal': 'tavern', 'Godot': 'tavern', 'General': 'tavern',
    'game-workshop': 'game-workshop', 'tavern': 'tavern', 'free-assets': 'free-assets'
  };
  return paths[category] || 'tavern';
}

const categoryIcons: { [key in PostMainCategory]: React.ElementType } = {
  Unity: Box, Unreal: AppWindow, Godot: PenTool, General: LayoutGrid,
  'game-workshop': Hammer, 'tavern': Beer, 'free-assets': Gift,
};

// 수채화 테마에 맞는 카테고리 색상
const categoryColors: { [key in PostMainCategory]: string } = {
  Unity: "text-watercolor-primary", 
  Unreal: "text-watercolor-secondary", 
  Godot: "text-watercolor-accent",
  General: "text-watercolor-primary", 
  'game-workshop': "text-watercolor-accent",
  'tavern': "text-watercolor-secondary", 
  'free-assets': "text-watercolor-primary",
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [globalRankings, setGlobalRankings] = useState<RankEntry[]>([]);
  const [categoryRankings, setCategoryRankings] = useState<Ranking[]>([]);
  const [tetrisRankings, setTetrisRankings] = useState<TetrisRanker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedPosts, fetchedRankings, fetchedTetrisRankers] = await Promise.all([
          getPosts(), getRankings(), getTetrisRankers({ limit: 5 }),
        ]);
        
        const sortedPosts = [...fetchedPosts].sort((a, b) => {
          if (a.createdAt instanceof Timestamp && b.createdAt instanceof Timestamp) {
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
          }
          return 0;
        });
        
        const popularPostsData = [...fetchedPosts]
          .sort((a, b) => (b.views + b.upvotes * 2) - (a.views + a.upvotes * 2))
          .slice(0, 5);
        
        const overallRanking = fetchedRankings.find((r: Ranking) => r.category === 'Overall');
        const catRankings = fetchedRankings.filter((r: Ranking) => r.category !== 'Overall');

        setPosts(sortedPosts);
        setPopularPosts(popularPostsData);
        setGlobalRankings(overallRanking ? overallRanking.entries : []);
        setCategoryRankings(catRankings);
        setTetrisRankings(fetchedTetrisRankers);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredPost = !loading && posts.length > 0 ? posts[0] : null;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] relative">
        {/* 수채화 배경 효과 (텍스처 위에 오버레이) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-watercolor-primary/10 to-transparent rounded-full blur-2xl animate-watercolor-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-watercolor-secondary/10 to-transparent rounded-full blur-2xl animate-watercolor-float" style={{animationDelay: '-2s'}}></div>
        </div>
        <Card className="watercolor-card p-8 text-center max-w-md relative z-10">
          <div className="text-destructive mb-4 text-lg font-medium">{error}</div>
          <Button 
            onClick={() => window.location.reload()}
            className="watercolor-button"
          >
            다시 시도
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* 수채화 배경 효과 (텍스처 이미지 위에 오버레이) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-watercolor-primary/8 to-transparent rounded-full blur-3xl animate-watercolor-float"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-br from-watercolor-secondary/6 to-transparent rounded-full blur-3xl animate-watercolor-float" style={{animationDelay: '-3s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-watercolor-accent/7 to-transparent rounded-full blur-3xl animate-watercolor-float" style={{animationDelay: '-6s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-watercolor-primary/5 to-transparent rounded-full blur-3xl animate-watercolor-float" style={{animationDelay: '-9s'}}></div>
      </div>

      <div className="container mx-auto py-8 relative z-10">
        {/* 수채화 히어로 섹션 */}
        <section className="mb-12 text-center relative overflow-hidden">
          <div className="relative p-8 md:p-16 rounded-3xl border border-watercolor-border bg-gradient-to-br from-watercolor-primary/5 via-watercolor-accent/3 to-watercolor-secondary/5 backdrop-blur-sm shadow-watercolor-light dark:shadow-watercolor-dark">
            {/* 수채화 배경 효과 */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-watercolor-primary/40 to-transparent rounded-full blur-2xl animate-watercolor-float"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-watercolor-secondary/30 to-transparent rounded-full blur-2xl animate-watercolor-float" style={{animationDelay: '-2s'}}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-watercolor-accent/35 to-transparent rounded-full blur-2xl animate-watercolor-float" style={{animationDelay: '-4s'}}></div>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 watercolor-text-gradient">
                LOREBASE
              </h1>
              <p className="text-lg md:text-xl text-watercolor-muted mb-6">
                게임 개발자들을 위한 수채화 커뮤니티 플랫폼
              </p>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-watercolor-primary animate-watercolor-pulse" />
                <span className="text-sm text-watercolor-muted">창의적인 아이디어가 흘러나오는 공간</span>
                <Sparkles className="h-5 w-5 text-watercolor-secondary animate-watercolor-pulse" style={{animationDelay: '0.5s'}} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* 특집 게시물 섹션 */}
            <section className="floating">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-6 w-6 text-watercolor-primary animate-watercolor-pulse" />
                <h2 className="text-2xl font-bold watercolor-text-gradient">특집 게시물</h2>
              </div>
              {loading ? <FeaturedPostSkeleton /> : featuredPost ? (
                <Card className="watercolor-card watercolor-hover bg-gradient-to-tr from-watercolor-primary/3 to-watercolor-accent/2 border-watercolor-primary/30 shadow-watercolor-glow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-watercolor-primary/20 text-watercolor-primary border-watercolor-primary/30">
                        {featuredPost.mainCategory}
                      </Badge>
                      <Badge variant="outline" className="border-watercolor-secondary/50 text-watercolor-secondary">
                        {featuredPost.type}
                      </Badge>
                    </div>
                    <Link href={`/${getCategoryPath(featuredPost.mainCategory)}/${featuredPost.id}`} className="hover:underline">
                      <CardTitle className="text-2xl md:text-3xl font-bold line-clamp-2 watercolor-text-gradient">
                        {featuredPost.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border-watercolor-border">
                        <AvatarImage src={featuredPost.author.avatar} />
                        <AvatarFallback className="bg-watercolor-accent/20 text-watercolor-text">
                          {featuredPost.author.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <NicknameDisplay user={featuredPost.author} context="postAuthor" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-watercolor-muted mb-4 line-clamp-3">
                      {featuredPost.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-watercolor-muted">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-watercolor-primary" />
                          {featuredPost.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-watercolor-secondary" />
                          {featuredPost.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-watercolor-accent" />
                          {featuredPost.commentCount}
                        </span>
                      </div>
                      {featuredPost.createdAt instanceof Timestamp && 
                        <FormattedDateDisplay date={featuredPost.createdAt.toDate()} />
                      }
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="watercolor-card flex items-center justify-center h-48">
                  <p className="text-watercolor-muted">특집 게시물이 없습니다.</p>
                </Card>
              )}
            </section>

            {/* 인기 게시물 섹션 */}
            <section className="floating" style={{animationDelay: '-2s'}}>
              <div className="flex items-center gap-2 mb-6">
                <Flame className="h-6 w-6 text-watercolor-accent animate-watercolor-pulse" />
                <h2 className="text-2xl font-bold watercolor-text-gradient">인기 게시물</h2>
              </div>
              {loading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="watercolor-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded bg-watercolor-primary/20" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2 bg-watercolor-secondary/20" />
                            <Skeleton className="h-3 w-1/2 bg-watercolor-accent/20" />
                          </div>
                          <Skeleton className="h-8 w-16 bg-watercolor-primary/15" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {popularPosts.map((post, index) => {
                    const CategoryIcon = categoryIcons[post.mainCategory];
                    return (
                      <Card key={post.id} className="watercolor-card watercolor-hover watercolor-transition">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-watercolor-primary/15 to-watercolor-accent/10 rounded-lg border border-watercolor-border/30">
                              {CategoryIcon && <CategoryIcon className={`h-6 w-6 ${categoryColors[post.mainCategory]}`} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/${getCategoryPath(post.mainCategory)}/${post.id}`} className="hover:underline">
                                <h3 className="font-semibold line-clamp-1 text-watercolor-text">{post.title}</h3>
                              </Link>
                              <div className="flex items-center gap-2 text-sm text-watercolor-muted mt-1">
                                <NicknameDisplay user={post.author} context="postAuthor" />
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-watercolor-primary" />
                                  {post.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3 text-watercolor-secondary" />
                                  {post.upvotes}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-watercolor-primary/50 text-watercolor-primary">
                              #{index + 1}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 최신 게시물 섹션 */}
            <section className="floating" style={{animationDelay: '-4s'}}>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-watercolor-secondary animate-watercolor-pulse" />
                <h2 className="text-2xl font-bold watercolor-text-gradient">최신 게시물</h2>
              </div>
              <div className="watercolor-card">
                <PostList initialPosts={posts.slice(1, 11)} initialMainCategory={'General'} initialSearchTerm="" />
              </div>
            </section>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 테트리스 랭킹 */}
            <Card className="watercolor-card watercolor-hover floating">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-watercolor-primary" />
                  <span className="watercolor-text-gradient">테트리스 랭킹</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <RankingSkeleton /> : tetrisRankings.length > 0 ? (
                  <div className="space-y-3">
                    {tetrisRankings.map((ranker, index) => (
                      <div key={ranker.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-watercolor-primary/5 watercolor-transition">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold watercolor-transition ${
                          index === 0 ? 'bg-gradient-to-r from-watercolor-primary to-watercolor-accent text-white' : 
                          index === 1 ? 'bg-gradient-to-r from-watercolor-secondary to-watercolor-primary/70 text-white' : 
                          index === 2 ? 'bg-gradient-to-r from-watercolor-accent to-watercolor-secondary/70 text-white' : 
                          'bg-watercolor-surface border border-watercolor-border text-watercolor-text'
                        }`}>
                          {ranker.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-watercolor-text">{ranker.nickname}</p>
                          <p className="text-xs text-watercolor-muted">{ranker.score.toLocaleString()} 점</p>
                        </div>
                        {index < 3 && (
                          <Award className={`h-4 w-4 ${
                            index === 0 ? 'text-watercolor-primary' : 
                            index === 1 ? 'text-watercolor-secondary' : 
                            'text-watercolor-accent'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-watercolor-muted text-sm text-center py-4">아직 랭킹이 없습니다</p>
                )}
              </CardContent>
            </Card>
            
            {/* 전체 랭킹 */}
            <Card className="watercolor-card watercolor-hover floating" style={{animationDelay: '-2s'}}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-watercolor-secondary" />
                  <span className="watercolor-text-gradient">전체 랭킹</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <RankingSkeleton /> : globalRankings.length > 0 ? (
                  <div className="space-y-3">
                    {globalRankings.map((user) => (
                      <div key={user.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-watercolor-secondary/5 watercolor-transition">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold watercolor-transition ${
                          user.rank === 1 ? 'bg-gradient-to-r from-watercolor-primary to-watercolor-accent text-white' : 
                          user.rank === 2 ? 'bg-gradient-to-r from-watercolor-secondary to-watercolor-primary/70 text-white' : 
                          user.rank === 3 ? 'bg-gradient-to-r from-watercolor-accent to-watercolor-secondary/70 text-white' : 
                          'bg-watercolor-surface border border-watercolor-border text-watercolor-text'
                        }`}>
                          {user.rank}
                        </div>
                        <Avatar className="h-8 w-8 border border-watercolor-border">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-watercolor-accent/20 text-watercolor-text">
                            {user.nickname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-watercolor-text">{user.nickname}</p>
                          <p className="text-xs text-watercolor-muted">{user.score.toLocaleString()} 점</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-watercolor-muted text-sm text-center py-4">랭킹 정보가 없습니다</p>
                )}
              </CardContent>
            </Card>

            {/* 카테고리 랭킹 */}
            <div className="floating" style={{animationDelay: '-4s'}}>
              <CategoryRankingSidebar rankings={categoryRankings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
