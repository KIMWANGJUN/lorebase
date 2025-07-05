
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
  Clock, Flame, Award, Hammer, Beer, Gift
} from 'lucide-react';

// 스켈레톤 컴포넌트들
function FeaturedPostSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function RankingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-12" />
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

const categoryColors: { [key in PostMainCategory]: string } = {
  Unity: "text-orange-500", Unreal: "text-blue-500", Godot: "text-green-500",
  General: "text-purple-500", 'game-workshop': "text-yellow-600",
  'tavern': "text-amber-800", 'free-assets': "text-emerald-500",
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
      <div className="text-center"><div className="text-destructive">{error}</div>
        <Button onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <section className="mb-12 text-center">
        <div className="p-8 md:p-12 rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LOREBASE</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">게임 개발자들을 위한 커뮤니티 플랫폼</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-6"><Star className="h-6 w-6 text-primary" /><h2 className="text-2xl font-bold">특집 게시물</h2></div>
            {loading ? <FeaturedPostSkeleton /> : featuredPost ? (
              <Card className="bg-gradient-to-tr from-primary/5 to-accent/5 border-primary/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2"><Badge variant="secondary" className="bg-primary/10 text-primary">{featuredPost.mainCategory}</Badge><Badge variant="outline">{featuredPost.type}</Badge></div>
                  <Link href={`/${getCategoryPath(featuredPost.mainCategory)}/${featuredPost.id}`} className="hover:underline">
                    <CardTitle className="text-2xl md:text-3xl font-bold line-clamp-2">{featuredPost.title}</CardTitle>
                  </Link>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarImage src={featuredPost.author.avatar} /><AvatarFallback>{featuredPost.author.nickname.charAt(0)}</AvatarFallback></Avatar>
                    <NicknameDisplay user={featuredPost.author} context="postAuthor" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{featuredPost.content.replace(/<[^>]*>/g, '').substring(0, 200)}...</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{featuredPost.views}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{featuredPost.upvotes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{featuredPost.commentCount}</span>
                    </div>
                    {featuredPost.createdAt instanceof Timestamp && <FormattedDateDisplay date={featuredPost.createdAt.toDate()} />}
                  </div>
                </CardContent>
              </Card>
            ) : <Card className="flex items-center justify-center h-48"><p className="text-muted-foreground">특집 게시물이 없습니다.</p></Card>}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6"><Flame className="h-6 w-6 text-orange-500" /><h2 className="text-2xl font-bold">인기 게시물</h2></div>
            {loading ? (
              <div className="grid gap-4">{[1, 2, 3].map(i => <Card key={i}><CardContent className="p-4"><div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded" /><div className="flex-1"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-8 w-16" /></div></CardContent></Card>)}</div>
            ) : (
              <div className="grid gap-4">{popularPosts.map((post, index) => {
                const CategoryIcon = categoryIcons[post.mainCategory];
                return (
                  <Card key={post.id} className="hover:shadow-md transition-shadow"><CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                        {CategoryIcon && <CategoryIcon className={`h-6 w-6 ${categoryColors[post.mainCategory]}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/${getCategoryPath(post.mainCategory)}/${post.id}`} className="hover:underline"><h3 className="font-semibold line-clamp-1">{post.title}</h3></Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <NicknameDisplay user={post.author} context="postAuthor" /><span>•</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.upvotes}</span>
                        </div>
                      </div><Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    </div>
                  </CardContent></Card>
                );
              })}</div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6"><Clock className="h-6 w-6 text-blue-500" /><h2 className="text-2xl font-bold">최신 게시물</h2></div>
            <PostList initialPosts={posts.slice(1, 11)} initialMainCategory={'General'} initialSearchTerm="" />
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">테트리스 랭킹</CardTitle></CardHeader>
            <CardContent>
              {loading ? <RankingSkeleton /> : tetrisRankings.length > 0 ? (
                <div className="space-y-3">{tetrisRankings.map((ranker, index) => (
                  <div key={ranker.userId} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{ranker.rank}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{ranker.nickname}</p><p className="text-xs text-muted-foreground">{ranker.score.toLocaleString()} 점</p></div>
                    {index < 3 && <Award className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`} />}
                  </div>
                ))}</div>
              ) : <p className="text-muted-foreground text-sm text-center py-4">아직 랭킹이 없습니다</p>}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-lg">전체 랭킹</CardTitle></CardHeader>
            <CardContent>
              {loading ? <RankingSkeleton /> : globalRankings.length > 0 ? (
                <div className="space-y-3">{globalRankings.map((user) => (
                  <div key={user.userId} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.rank === 1 ? 'bg-yellow-500 text-white' : user.rank === 2 ? 'bg-gray-400 text-white' : user.rank === 3 ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{user.rank}</div>
                    <Avatar className="h-8 w-8"><AvatarImage src={user.avatar} /><AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{user.nickname}</p><p className="text-xs text-muted-foreground">{user.score.toLocaleString()} 점</p></div>
                  </div>
                ))}</div>
              ) : <p className="text-muted-foreground text-sm text-center py-4">랭킹 정보가 없습니다</p>}
            </CardContent>
          </Card>

          <CategoryRankingSidebar rankings={categoryRankings} />
        </div>
      </div>
    </div>
  );
}
