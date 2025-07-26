"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface DynamicTavernSearchProps {
  initialSearchTerm: string;
}

export default function DynamicTavernSearch({ initialSearchTerm }: DynamicTavernSearchProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (searchTerm.trim()) {
      url.searchParams.set('search', searchTerm.trim());
    } else {
      url.searchParams.delete('search');
    }
    router.push(url.pathname + url.search);
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="게시글 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
    </form>
  );
}
