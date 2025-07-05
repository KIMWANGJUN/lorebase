"use client";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface TavernSearchProps {
  initialSearchTerm?: string;
}

export default function TavernSearch({ initialSearchTerm = '' }: TavernSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    router.push(`/tavern?${params.toString()}`);
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="글 제목이나 내용으로 검색..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 bg-background border-border focus:ring-accent"
      />
    </div>
  );
}
