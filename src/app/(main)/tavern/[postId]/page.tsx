// src/app/(main)/tavern/[postId]/page.tsx
import { mockPosts, mockUsers } from '@/lib/mockData';
import type { Post } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Pin } from 'lucide-react'; 
import { cn } from '@/lib/utils';

export async function generateStaticParams() {
  return mockPosts.map((post) => ({
    postId: post.id,
  }));
}

export default function PostDetailPage({ params }: { params: { postId: string } }) {
  const post = mockPosts.find(p => p.id === params.postId);

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold">게시글을 찾을 수 없습니다.</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/tavern">목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const author = mockUsers.find(u => u.id === post.authorId);
  const authorDisplayName = author?.nickname || post.authorNickname;
  const authorAvatar = author?.avatar;
  const getInitials = (name: string) => name ? name.substring(0, 1).toUpperCase() : 'U';
  const postDate = new Date(post.createdAt);
  const formattedDate = `${postDate.getFullYear()}년 ${postDate.getMonth() + 1}월 ${postDate.getDate()}일 ${postDate.getHours()}시 ${postDate.getMinutes()}분`;
  const isNotice = post.type === 'Notice' || post.type === 'Announcement';

  const otherPosts = mockPosts
    .filter(p => p.id !== post.id) // Exclude current post
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by newest
    .slice(0, 3); // Take top 3

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/tavern">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </Button>

      {/* Post Content Section */}
      <Card className={cn(
        "mb-8 shadow-lg",
        post.isPinned && "border-t-4 border-primary",
        isNotice && "bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700"
      )}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-headline flex items-center">
              {post.isPinned && <Pin className="h-6 w-6 mr-2 text-primary" />}
              {isNotice && <MessageSquare className="h-6 w-6 mr-2 text-sky-600 dark:text-sky-400" />}
              {post.title}
            </CardTitle>
          </div>
          <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{getInitials(authorDisplayName)}</AvatarFallback>
            </Avatar>
            <div>
              <span className={cn("font-medium", author?.username === 'WANGJUNLAND' && 'text-admin')}>{authorDisplayName}</span>
              <div className="text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                <span className="mx-1">·</span>
                <span className="capitalize">{post.type}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
          <p className="whitespace-pre-wrap">{post.content}</p> 
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground border-t pt-4 mt-4">
           <div className="flex gap-4 items-center text-sm">
            <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1" /> {post.upvotes}</span>
            {/* {isAdmin && <span className="flex items-center"><ThumbsDown className="h-4 w-4 mr-1" /> {post.downvotes}</span>} */}
            <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {post.commentCount}</span>
            <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> {post.views}</span>
          </div>
           {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Comments Section (Placeholder) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>댓글 ({post.commentCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">댓글 기능은 현재 준비 중입니다.</p>
        </CardContent>
      </Card>

      {/* Mini Post List Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 font-headline">다른 게시글 보기</h2>
        <div className="space-y-4">
          {otherPosts.length > 0 ? otherPosts.map(op => (
            <Link key={op.id} href={`/tavern/${op.id}`} className="block p-4 border rounded-lg shadow-sm hover:bg-muted/50 hover:shadow-md transition-all">
              <h3 className="font-medium text-lg text-primary hover:underline">{op.title}</h3>
              <div className="text-xs text-muted-foreground mt-1">
                <span>{op.authorNickname}</span>
                <span className="mx-1.5">·</span>
                <span>{new Date(op.createdAt).toLocaleDateString()}</span>
                <span className="mx-1.5">·</span>
                <span className="capitalize">{op.type}</span>
              </div>
            </Link>
          )) : (
            <p className="text-muted-foreground">다른 게시글이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
