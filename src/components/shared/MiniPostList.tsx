// src/components/shared/MiniPostList.tsx
"use client";

import { useState, useMemo } from 'react';
import type { Post, PostMainCategory } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListFilter, LayoutGrid, Box, AppWindow, PenTool, ThumbsUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiniPostListProps {
  allPosts: Post[];
  currentPostId: string;
}

const POSTS_PER_PAGE = 5; // Number of posts per page for the mini list

const mainCategoryTabs: { value: PostMainCategory | 'all'; label: string; icon?: React.ElementType }[] = [
  { value: 'all', label: '전체', icon: ListFilter },
  { value: 'Unity', label: 'Unity', icon: Box },
  { value: 'Unreal', label: 'Unreal', icon: AppWindow },
  { value: 'Godot', label: 'Godot', icon: PenTool },
  { value: 'General', label: '일반', icon: LayoutGrid },
];

export default function MiniPostList({ allPosts, currentPostId }: MiniPostListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMainCategory, setSelectedMainCategory] = useState<PostMainCategory | 'all'>('all');

  const filteredAndSortedPosts = useMemo(() => {
    let posts = allPosts.filter(p => p.id !== currentPostId);
    if (selectedMainCategory !== 'all') {
      posts = posts.filter(p => p.mainCategory === selectedMainCategory);
    }
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPosts, currentPostId, selectedMainCategory]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return filteredAndSortedPosts.slice(startIndex, endIndex);
  }, [filteredAndSortedPosts, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleCategoryChange = (category: PostMainCategory | 'all') => {
    setSelectedMainCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  return (
    <section className="mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold font-headline text-foreground">다른 게시글 보기</h2>
        <Tabs value={selectedMainCategory} onValueChange={(value) => handleCategoryChange(value as PostMainCategory | 'all')} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 md:flex bg-card border-border p-1 rounded-lg shadow-sm">
            {mainCategoryTabs.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className={cn(
                  "font-headline text-xs px-2 py-1.5 sm:px-3 sm:py-2 sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 md:flex-none",
                )}
              >
                {tab.icon && <tab.icon className="h-3.5 w-3.5 mr-0 sm:mr-1.5 inline-block" />}
                <span className={cn(tab.icon && "hidden sm:inline")}>{tab.label}</span>
                 <span className={cn(!tab.icon && "inline") || (tab.icon && "inline sm:hidden")}>{tab.label}</span>

              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {paginatedPosts.length === 0 ? (
         <div className="text-center py-10">
            <ListFilter className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg text-muted-foreground">
              {selectedMainCategory === 'all' ? '다른 게시글이 없습니다.' : `${mainCategoryTabs.find(t => t.value === selectedMainCategory)?.label || ''} 카테고리에 다른 게시글이 없습니다.`}
            </p>
         </div>
      ) : (
        <div className="space-y-3">
          {paginatedPosts.map(op => (
            <Card key={op.id} className="shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out bg-card border-border hover:border-primary/50 transform hover:-translate-y-0.5">
              <Link href={`/tavern/${op.id}`} className="block p-3 hover:bg-muted/30 rounded-lg transition-colors">
                <CardHeader className="p-0">
                  <CardTitle className="font-medium text-md text-foreground hover:text-primary transition-colors line-clamp-1">{op.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center flex-wrap gap-x-1.5">
                        <span>{op.authorNickname}</span>
                        <span className="hidden sm:inline">·</span>
                        <span>{new Date(op.createdAt).toLocaleDateString()}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="capitalize bg-secondary/20 px-1.5 py-0.5 rounded-sm text-secondary-foreground/80 text-[10px]">{op.mainCategory} / {op.type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center">
                          <ThumbsUp className="mr-1 h-3.5 w-3.5" /> {op.upvotes}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="mr-1 h-3.5 w-3.5" /> {op.commentCount}
                        </span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent hover:text-accent">
            이전
          </Button>
          <p className="text-sm text-muted-foreground font-headline">
            페이지 {currentPage} / {totalPages}
          </p>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent hover:text-accent">
            다음
          </Button>
        </div>
      )}
    </section>
  );
}

