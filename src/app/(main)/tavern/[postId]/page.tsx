// src/app/(main)/tavern/[postId]/page.tsx
import { mockPosts, mockUsers } from '@/lib/mockData';
import type { Post } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Pin, Edit, Trash2 } from 'lucide-react'; // Assuming useAuth is not directly needed here for view
import { cn } from '@/lib/utils';
// We cannot use useAuth hook directly in Server Components. 
// For admin-specific actions like edit/delete on this page, it would typically involve:
// 1. Making this a client component OR
// 2. Passing admin status from a parent client component OR
// 3. Server-side check if available (e.g. through session management, not applicable here)
// For now, admin buttons will be shown statically for demonstration if needed, or omitted for simplicity.

export async function generateStaticParams() {
  // For SSG, generate paths for existing mock posts
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
  // const isAdmin = false; // Placeholder for admin status logic if needed for edit/delete on this page

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
            {/* 
            // Admin buttons - would require client component logic or server session check
            {isAdmin && ( 
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> 수정</Button>
                <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> 삭제</Button>
              </div>
            )}
            */}
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
          {/* Using whitespace-pre-wrap to respect newlines in mock data */}
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
          {/* TODO: Implement actual comments loading and display */}
          <p className="text-muted-foreground">댓글 기능은 현재 준비 중입니다.</p>
          {/* 
          Example structure for future comments:
          <div className="space-y-4">
            {mockComments.filter(c => c.postId === post.id).map(comment => (
              <div key={comment.id} className="p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={mockUsers.find(u=>u.id === comment.authorId)?.avatar} />
                    <AvatarFallback>{getInitials(comment.authorNickname)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">{comment.authorNickname}</span>
                  <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
             <Textarea placeholder="댓글을 입력하세요..." className="mt-4" />
            <Button className="mt-2">댓글 작성</Button>
          </div> 
          */}
        </CardContent>
      </Card>

      {/* Back to List Button / Other Posts Section (Simplified) */}
      <div className="text-center">
        <Button asChild variant="default" size="lg">
          <Link href="/tavern">
            <ArrowLeft className="mr-2 h-5 w-5" />
            커뮤니티 목록으로 돌아가기
          </Link>
        </Button>
      </div>
    </div>
  );
}
