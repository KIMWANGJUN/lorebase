// src/components/shared/PostListSearch.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PostListSearchProps {
  initialSearchTerm?: string;
}

export default function PostListSearch({ initialSearchTerm = '' }: PostListSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // URL 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    router.push(`/tavern?${params.toString()}`);
  };

  useEffect(() => {
    // URL 쿼리 파라미터가 변경될 때 컴포넌트의 상태를 업데이트
    const currentSearch = searchParams.get('search') || '';
    if (currentSearch !== searchTerm) {
      setSearchTerm(currentSearch);
    }
  }, [searchParams]);

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // This function is intentionally left blank as search happens on input change
    // but form submission should not reload the page.
  };

  return (
    <form onSubmit={onSearchSubmit} className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="글 제목이나 내용으로 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
                handleSearch(searchTerm);
            }
        }}
        className="pl-10 bg-background border-border focus:ring-accent"
      />
    </form>
  );
}
