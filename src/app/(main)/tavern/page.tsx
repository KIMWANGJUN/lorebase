// src/app/(main)/tavern/page.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPosts } from '@/lib/postApi';
import type { PostMainCategory } from '@/types';
import PostList from '@/components/shared/PostList';
import CategoryRankingSidebar from '@/components/shared/CategoryRankingSidebar';
import { PostListSearch } from '@/components/shared/PostListSearch'; // Changed to named import
import {
  PlusCircle, Box, AppWindow, PenTool, LayoutGrid
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default async function TavernPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. Determine the category from URL search params, default to 'Unity'
  const mainCategory = (searchParams.category as PostMainCategory) || 'Unity';
  const searchTerm = (searchParams.q as string) || '';

  // 2. Fetch initial data on the server
  const initialPosts = await getPosts(); 
  const user = await getCurrentUser();

  const bannerImageUrl = "https://placehold.co/1920x600.png";

  return (
    <div className="py-8 px-4">
      {/* Banner Section */}
      <section
        className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="fantasy tavern interior"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/70 via-primary/50 to-background/70 rounded-xl z-0 opacity-80"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground drop-shadow-lg font-headline">선술집 (커뮤니티)</h1>
          <p className="text-base md:text-lg text-primary-foreground/90 mt-2 drop-shadow-sm font-body">개발자들과 자유롭게 소통하고 정보를 공유하세요.</p>
        </div>
      </section>

      {/* Search and New Post Button */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        {/* Search input is a client component to manage its own state */}
        <PostListSearch initialSearchTerm={searchTerm} />
        {user && (
          <Link href="/tavern/new" passHref>
            <Button className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md text-sm font-headline flex-shrink-0">
              <PlusCircle className="mr-2 h-5 w-5" /> 새 글 작성
            </Button>
          </Link>
        )}
      </div>

      {/* Main Category Tabs */}
      {/* We use Links for navigation, which works perfectly with server components */}
      <Tabs defaultValue={mainCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card border-border p-1.5 rounded-lg shadow-inner items-center">
          <TabsTrigger value="Unity" asChild><Link href="?category=Unity" className="w-full flex items-center justify-center gap-1.5"><Box className="h-4 w-4" />Unity</Link></TabsTrigger>
          <TabsTrigger value="Unreal" asChild><Link href="?category=Unreal" className="w-full flex items-center justify-center gap-1.5"><AppWindow className="h-4 w-4" />Unreal</Link></TabsTrigger>
          <TabsTrigger value="Godot" asChild><Link href="?category=Godot" className="w-full flex items-center justify-center gap-1.5"><PenTool className="h-4 w-4" />Godot</Link></TabsTrigger>
          <TabsTrigger value="General" asChild><Link href="?category=General" className="w-full flex items-center justify-center gap-1.5"><LayoutGrid className="h-4 w-4" />일반 & 유머</Link></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* All client-side logic is now inside PostList */}
          <PostList 
            initialPosts={initialPosts} 
            initialMainCategory={mainCategory} 
            initialSearchTerm={searchTerm} 
          />
        </div>
        <aside className="lg:col-span-1 space-y-6 sticky top-20 self-start">
           <CategoryRankingSidebar category={mainCategory} />
        </aside>
      </div>
    </div>
  );
}
