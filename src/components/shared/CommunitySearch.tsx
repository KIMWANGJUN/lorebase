"use client";
import { Input } from '@/components/ui/form/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { COMMUNITY_CHANNELS, getChannelBySlug } from '@/lib/communityChannels';

interface CommunitySearchProps {
  initialSearchTerm?: string;
}

export default function CommunitySearch({ initialSearchTerm = '' }: CommunitySearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const currentChannelSlug = params.channelSlug as string;

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    router.push(`/community/${currentChannelSlug}?${params.toString()}`);
  };

  const handleChannelChange = (value: string) => {
    router.push(`/community/${value}`);
  };

  return (
    <div className="flex gap-2 w-full">
      <Select onValueChange={handleChannelChange} value={currentChannelSlug}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="채널 선택" />
        </SelectTrigger>
        <SelectContent>
          {COMMUNITY_CHANNELS.map((channel) => (
            <SelectItem key={channel.slug} value={channel.slug}>
              {channel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="글 제목이나 내용으로 검색..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-background border-border focus:ring-accent"
        />
      </div>
    </div>
  );
}
