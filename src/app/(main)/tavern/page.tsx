// src/app/(main)/tavern/page.tsx
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockPosts, mockUsers } from '@/lib/mockData';
import type { Post } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Search, PlusCircle, MessageSquare, ThumbsUp, ThumbsDown, Eye, Filter, ArrowUpDown, Pin, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const PostItem = ({ post, isAdmin }: { post: Post, isAdmin: boolean }) => {
  const author = mockUsers.find(u => u.id === post.authorId);
  const authorDisplayName = author?.nickname || post.authorNickname;
  const authorAvatar = author?.avatar;
  const getInitials = (name: string) => name.substring(0, 1).toUpperCase();
  
  const postDate = new Date(post.createdAt);
  const formattedDate = `${postDate.getFullYear()}년 ${postDate.getMonth() + 1}월 ${postDate.getDate()}일 ${postDate.getHours()}시 ${postDate.getMinutes()}분`;


  return (
    <Card id={`post-${post.id}`} className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link href={`/tavern/#post-${post.id}`} className="hover:underline">
            <CardTitle className="font-headline text-xl mb-1">{post.isPinned && <Pin className="inline-block h-5 w-5 mr-2 text-primary" />} {post.title}</CardTitle>
          </Link>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>{getInitials(authorDisplayName)}</AvatarFallback>
          </Avatar>
          <span className={cn(author?.username === 'WANGJUNLAND' && 'text-admin')}>{authorDisplayName}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          <span>·</span>
          <span className="capitalize">{post.type}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <ThumbsUp className="h-4 w-4 mr-1" /> {post.upvotes}
          </Button>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <ThumbsDown className="h-4 w-4 mr-1" /> {isAdmin ? post.downvotes : ""} {!isAdmin && "비추천"}
          </Button>
          <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {post.commentCount}</span>
          <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> {post.views}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/tavern/#post-${post.id}`}>자세히 보기</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function TavernPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [popularFilter, setPopularFilter] = useState('weekly'); // weekly, monthly, yearly
  const { user, isAdmin } = useAuth();

  const filterPosts = (posts: Post[], tab: string) => {
    let filtered = posts;
    if (tab === 'notices') {
      filtered = posts.filter(p => p.type === 'Notice' || p.type === 'Announcement');
    } else if (tab === 'popular') {
      // Popular filter logic based on `popularFilter` state (e.g., views in last week/month/year)
      // For mock, just sort by views for now
      filtered = [...posts].sort((a,b) => b.views - a.views);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorNickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };
  
  const displayedPosts = filterPosts(mockPosts, activeTab);

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="text-center py-12 mb-10 bg-gradient-to-r from-accent to-purple-700 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary-foreground">선술집 (커뮤니티)</h1>
        <p className="text-lg text-primary-foreground/90 mt-2">개발자들과 자유롭게 소통하고 정보를 공유하세요.</p>
      </section>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="게시글 검색 (제목, 내용, 작성자)..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {user && (
          <Button className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> 새 글 작성
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="all">전체 글</TabsTrigger>
          <TabsTrigger value="notices">공지</TabsTrigger>
          <TabsTrigger value="qna">Q&A</TabsTrigger> {/* Add QnA tab */}
          <TabsTrigger value="popular" className="flex items-center gap-1">
            인기 글
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="xs" className="p-1 h-auto"><Filter className="h-3 w-3" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setPopularFilter('weekly')}>1주일</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPopularFilter('monthly')}>1개월</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPopularFilter('yearly')}>1년</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* TODO: Add a specific component or filter logic for Q&A and Project Promotion */}
      {/* For now, all posts are shown under 'all' or filtered by notice/popular */}

      {displayedPosts.length > 0 ? (
        <div className="space-y-6">
          {displayedPosts.map((post) => (
            <PostItem key={post.id} post={post} isAdmin={isAdmin} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">표시할 게시글이 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">검색어를 변경하거나 다른 탭을 확인해보세요.</p>
        </div>
      )}
      {/* TODO: Pagination */}
    </div>
  );
}
