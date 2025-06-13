
// src/components/shared/CategoryRankingSidebar.tsx
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { User, PostMainCategory } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Box, AppWindow, PenTool, LayoutGrid, Trophy } from 'lucide-react';
import NicknameDisplay from './NicknameDisplay'; // Make sure this path is correct
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

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

  const categoryRankers = useMemo(() => {
    return mockUsers
      .filter(u => u.username !== 'WANGJUNLAND' && u.categoryStats?.[category]?.rankInCate && u.categoryStats[category]!.rankInCate! > 0 && u.categoryStats[category]!.rankInCate! <= 20)
      .sort((a, b) => (a.categoryStats![category]!.rankInCate!) - (b.categoryStats![category]!.rankInCate!))
      .slice(0, 20); 
  }, [category]);

  const totalPages = Math.ceil(categoryRankers.length / POSTS_PER_PAGE);
  const currentDisplayRankers = categoryRankers.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  if (categoryRankers.length === 0) {
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
          {getCategoryDisplayName(category)} 랭킹 (TOP 20)
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
