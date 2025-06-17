
// src/components/shared/CategoryRankingSidebar.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { User, PostMainCategory } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Box, AppWindow, PenTool, LayoutGrid, Loader2 } from 'lucide-react';
import NicknameDisplay from './NicknameDisplay';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
// In a real app, you would fetch this data from an API
// import { getCategoryRankers } from '@/lib/rankingApi';

interface CategoryRankingSidebarProps {
  category: PostMainCategory;
}

const POSTS_PER_PAGE = 10;

const CategorySpecificIcon: React.FC<{ category: PostMainCategory; className?: string }> = ({ category, className }) => {
  const defaultClassName = "h-5 w-5 shrink-0";
   const iconColorClass =
    category === 'Unity' ? 'icon-unity' :
    category === 'Unreal' ? 'icon-unreal' :
    category === 'Godot' ? 'icon-godot' :
    'icon-general';

  switch (category) {
    case 'Unity': return <Box className={cn(defaultClassName, iconColorClass, className)} />;
    case 'Unreal': return <AppWindow className={cn(defaultClassName, iconColorClass, className)} />;
    case 'Godot': return <PenTool className={cn(defaultClassName, iconColorClass, className)} />;
    case 'General': return <LayoutGrid className={cn(defaultClassName, iconColorClass, className)} />;
    default: return null;
  }
};

const getCategoryDisplayName = (category: PostMainCategory): string => {
  switch (category) {
    case 'Unity': return 'Unity';
    case 'Unreal': return 'Unreal';
    case 'Godot': return 'Godot';
    case 'General': return '일반 & 유머';
    default: return category;
  }
};

export default function CategoryRankingSidebar({ category }: CategoryRankingSidebarProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { user: currentUser, isAdmin } = useAuth();
  const [rankers, setRankers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // In a real app, you would call your API here:
    // getCategoryRankers(category, 20).then(data => {
    //   setRankers(data);
    //   setIsLoading(false);
    // });
    // For now, we'll just use an empty array
    setRankers([]);
    setIsLoading(false);
  }, [category]);

  const totalPages = Math.ceil(rankers.length / POSTS_PER_PAGE);
  const currentDisplayRankers = rankers.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  if (isLoading) {
    return (
        <Card className="shadow-lg bg-card border-border">
            <CardHeader>
                <CardTitle className="font-headline text-foreground text-lg flex items-center justify-center gap-2">
                    <CategorySpecificIcon category={category} />
                    {getCategoryDisplayName(category)} 랭킹
                </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    )
  }

  if (rankers.length === 0) {
    return (
      <Card className="shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="font-headline text-foreground text-lg flex items-center justify-center gap-2">
            <CategorySpecificIcon category={category} />
            {getCategoryDisplayName(category)} 랭킹
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">아직 이 카테고리의 랭커가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="font-headline text-foreground text-lg flex items-center justify-center gap-2">
          <CategorySpecificIcon category={category} />
          {getCategoryDisplayName(category)} 랭킹 (TOP {rankers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentDisplayRankers.map((rankerUser) => {
          const rankInCate = rankerUser.categoryStats?.[category]?.rankInCate || 0;
          return (
            <div
              key={rankerUser.id}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-md shadow-sm", 
                rankerUser.id === currentUser?.id && "ring-2 ring-primary/50" 
            )}>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-md w-6 text-center shrink-0 text-muted-foreground">
                  {rankInCate > 0 ? `${rankInCate}.` : "-"}
                </span>
                <Avatar className="h-8 w-8 border-2 border-accent/50 shrink-0">
                  <AvatarImage src={rankerUser.avatar || `https://placehold.co/40x40.png?text=${rankerUser.nickname.substring(0,1)}`} alt={rankerUser.nickname} data-ai-hint="user avatar"/>
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{rankerUser.nickname.substring(0,1)}</AvatarFallback>
                </Avatar>
                <NicknameDisplay user={rankerUser} context="sidebarRanking" activeCategory={category} />
              </div>
              {isAdmin && (
                <span className="text-xs font-semibold text-accent shrink-0">
                  {(rankerUser.categoryStats?.[category]?.score || 0).toLocaleString()} 점
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent hover:text-accent font-headline"
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground font-headline">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent hover:text-accent font-headline"
          >
            다음
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
