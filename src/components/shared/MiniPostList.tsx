// src/components/shared/MiniPostList.tsx
"use client";

import { useState, useMemo } from 'react';
import type { Post } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniPostListProps {
  allPosts: Post[];
  currentPostId: string;
}

const POSTS_PER_PAGE = 10;

export default function MiniPostList({ allPosts, currentPostId }: MiniPostListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const otherPosts = useMemo(() => {
    return allPosts
      .filter(p => p.id !== currentPostId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPosts, currentPostId]);

  const totalPages = Math.ceil(otherPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return otherPosts.slice(startIndex, endIndex);
  }, [otherPosts, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  if (paginatedPosts.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 font-headline">다른 게시글 보기</h2>
        <p className="text-muted-foreground">다른 게시글이 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 font-headline">다른 게시글 보기</h2>
      <div className="space-y-4">
        {paginatedPosts.map(op => (
          <Card key={op.id} className="shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/tavern/${op.id}`} className="block p-4 hover:bg-muted/50 rounded-lg">
              <CardHeader className="p-0">
                <CardTitle className="font-medium text-lg text-primary hover:underline">{op.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  <span>{op.authorNickname}</span>
                  <span className="mx-1.5">·</span>
                  <span>{new Date(op.createdAt).toLocaleDateString()}</span>
                  <span className="mx-1.5">·</span>
                  <span className="capitalize">{op.type}</span>
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" /> 이전
          </Button>
          <p className="text-sm text-muted-foreground">
            페이지 {currentPage} / {totalPages}
          </p>
          <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
            다음 <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
