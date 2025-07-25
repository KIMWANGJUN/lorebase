"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation'; // useParams 추가
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import { getPosts } from '@/lib/postApi';
import { getRankings } from '@/lib/rankingApi';
import type { Post, PostMainCategory, Ranking } from '@/types';
import PostList from '@/components/shared/PostList';
import CategoryRankingSidebar from '@/components/shared/CategoryRankingSidebar';
import DynamicCommunitySearch from '@/components/shared/DynamicCommunitySearch';
import CreateButton from '@/components/shared/CreateButton';
import { PlusCircle, Box, AppWindow, PenTool, LayoutGrid, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { COMMUNITY_CHANNELS, getChannelBySlug, CommunityChannel } from '@/lib/communityChannels'; // 채널 정보 import

function CommunityContent() {
  const { user } = useAuth();
  const params = useParams(); // useParams 훅 사용
  const searchParams = useSearchParams();
  const [initialPosts, setInitialPosts] = useState<Post[]>([]);
  const [categoryRankings, setCategoryRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  const channelSlug = params.channelSlug as string; // URL 파라미터에서 channelSlug 가져오기
  const currentChannel = getChannelBySlug(channelSlug) || COMMUNITY_CHANNELS[0]; // 채널 정보 가져오기, 없으면 첫 번째 채널로 기본값 설정
  const mainCategory = currentChannel.categories[0] as PostMainCategory; // 채널의 첫 번째 카테고리를 기본으로 사용
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    Promise.all([getPosts(currentChannel.categories), getRankings(currentChannel.categories)]).then(([allPosts, allRankings]) => {
      const filteredPosts = allPosts.filter(post => {
        // 채널의 카테고리에 포함되는 게시물만 필터링
        const categoryMatch = currentChannel.categories.includes(post.mainCategory);
        const searchMatch = !searchTerm || 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
      });
      setInitialPosts(filteredPosts);
      setCategoryRankings(allRankings.filter((r: Ranking) => currentChannel.categories.includes(r.category))); // 채널 카테고리에 맞는 랭킹만 표시
    }).finally(() => setLoading(false));
  }, [channelSlug, searchTerm, currentChannel]); // 의존성 배열에 channelSlug와 currentChannel 추가

  if (loading) {
    return <CommunityPageSkeleton />;
  }
  
  const bannerImageUrl = "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div className="py-8 px-4">
      <section className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-10 relative bg-cover bg-center" style={{ backgroundImage: `url('${bannerImageUrl}')` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-accent/70 via-primary/50 to-background/70 rounded-xl z-0 opacity-80"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground drop-shadow-lg font-headline">{currentChannel.name}</h1>
          <p className="text-base md:text-lg text-primary-foreground/90 mt-2 drop-shadow-sm font-body">{currentChannel.description}</p>
        </div>
      </section>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <DynamicTavernSearch initialSearchTerm={searchTerm} />
        {user && <CreateButton href={`/community/new?channel=${channelSlug}`} text="새 게시글 작성" icon={PlusCircle} />}
      </div>

      <Tabs defaultValue={mainCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card border-border p-1.5 rounded-lg shadow-inner items-center">
          {COMMUNITY_CHANNELS.map((channel) => (
            <TabsTrigger key={channel.slug} value={channel.categories[0]} asChild>
              <Link href={`/community/${channel.slug}`} className="w-full flex items-center justify-center gap-1.5">
                {channel.icon === 'icon-unity' && <Box className="h-4 w-4" />}
                {channel.icon === 'icon-unreal' && <AppWindow className="h-4 w-4" />}
                {channel.icon === 'icon-godot' && <PenTool className="h-4 w-4" />}
                {channel.icon === 'icon-general' && <LayoutGrid className="h-4 w-4" />}
                {channel.name}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PostList key={channelSlug + searchTerm} initialPosts={initialPosts} initialMainCategory={mainCategory} initialSearchTerm={searchTerm} />
        </div>
        <aside className="lg:col-span-1 space-y-6 sticky top-20 self-start">
           <CategoryRankingSidebar rankings={categoryRankings} />
        </aside>
      </div>
    </div>
  );
}

function CommunityPageSkeleton() {
  return (
    <div className="py-8 px-4">
      <Skeleton className="h-[200px] md:h-[300px] rounded-xl shadow-xl mb-10" />
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-40 flex-shrink-0" /></div>
      <Skeleton className="h-12 w-full mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
        <aside className="lg:col-span-1 space-y-6"><Skeleton className="h-64 w-full" /></aside>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<CommunityPageSkeleton />}>
      <CommunityContent />
    </Suspense>
  );
}
