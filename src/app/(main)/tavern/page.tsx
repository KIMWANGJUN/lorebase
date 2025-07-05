
// src/app/(main)/tavern/page.tsx
"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPosts } from '@/lib/postApi';
import { getRankings } from '@/lib/rankingApi';
import type { Post, PostMainCategory, Ranking } from '@/types';
import PostList from '@/components/shared/PostList';
import CategoryRankingSidebar from '@/components/shared/CategoryRankingSidebar';
import DynamicTavernSearch from '@/components/shared/DynamicTavernSearch';
import CreateButton from '@/components/shared/CreateButton';
import { PlusCircle, Box, AppWindow, PenTool, LayoutGrid, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

function TavernContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [initialPosts, setInitialPosts] = useState<Post[]>([]);
  const [categoryRankings, setCategoryRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  const mainCategory = (searchParams.get('category') as PostMainCategory) || 'Unity';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    Promise.all([getPosts(), getRankings()]).then(([allPosts, allRankings]) => {
      const filteredPosts = allPosts.filter(post => {
        const categoryMatch = post.mainCategory === mainCategory;
        const searchMatch = !searchTerm || 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
      });
      setInitialPosts(filteredPosts);
      setCategoryRankings(allRankings.filter((r: Ranking) => r.category !== 'Overall'));
    }).finally(() => setLoading(false));
  }, [mainCategory, searchTerm]);

  if (loading) {
    return <TavernPageSkeleton />;
  }
  
  const bannerImageUrl = "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div className="py-8 px-4">
      <section className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-10 relative bg-cover bg-center" style={{ backgroundImage: `url('${bannerImageUrl}')` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-accent/70 via-primary/50 to-background/70 rounded-xl z-0 opacity-80"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground drop-shadow-lg font-headline">Tavern (Community)</h1>
          <p className="text-base md:text-lg text-primary-foreground/90 mt-2 drop-shadow-sm font-body">Connect and share with fellow developers.</p>
        </div>
      </section>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <DynamicTavernSearch initialSearchTerm={searchTerm} />
        {user && <CreateButton href="/tavern/new" text="새 게시글 작성" icon={PlusCircle} />}
      </div>

      <Tabs defaultValue={mainCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card border-border p-1.5 rounded-lg shadow-inner items-center">
          <TabsTrigger value="Unity" asChild><Link href="?category=Unity" className="w-full flex items-center justify-center gap-1.5"><Box className="h-4 w-4" />Unity</Link></TabsTrigger>
          <TabsTrigger value="Unreal" asChild><Link href="?category=Unreal" className="w-full flex items-center justify-center gap-1.5"><AppWindow className="h-4 w-4" />Unreal</Link></TabsTrigger>
          <TabsTrigger value="Godot" asChild><Link href="?category=Godot" className="w-full flex items-center justify-center gap-1.5"><PenTool className="h-4 w-4" />Godot</Link></TabsTrigger>
          <TabsTrigger value="General" asChild><Link href="?category=General" className="w-full flex items-center justify-center gap-1.5"><LayoutGrid className="h-4 w-4" />General & Humor</Link></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PostList key={mainCategory + searchTerm} initialPosts={initialPosts} initialMainCategory={mainCategory} initialSearchTerm={searchTerm} />
        </div>
        <aside className="lg:col-span-1 space-y-6 sticky top-20 self-start">
           <CategoryRankingSidebar rankings={categoryRankings} />
        </aside>
      </div>
    </div>
  );
}

function TavernPageSkeleton() {
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

export default function TavernPage() {
  return (
    <Suspense fallback={<TavernPageSkeleton />}>
      <TavernContent />
    </Suspense>
  );
}
