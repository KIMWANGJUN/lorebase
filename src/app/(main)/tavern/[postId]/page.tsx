// src/app/(main)/tavern/[postId]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost } from '@/lib/postApi';
import { getCommentsByPost } from '@/lib/commentApi';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import CommentSection from '@/components/shared/CommentSection';
import { ArrowLeft, Edit, ThumbsUp, ThumbsDown, Eye, MessageSquare, Pin } from 'lucide-react';

export default async function PostPage({ params }: { params: { postId: string } }) {
  const { postId } = params;
  
  const [post, comments, currentUser] = await Promise.all([
    getPost(postId),
    getCommentsByPost(postId),
    getCurrentUser()
  ]);

  if (!post) {
    notFound();
  }
  
  const isAuthor = currentUser?.id === post.author.id;
  const isAdmin = currentUser?.isAdmin || false;

  // 수정된 sanitizedContent 함수
  const sanitizedContent = (htmlString: string) => {
    // 모든 종류의 줄바꿈을 <br /> 태그로 변환
    return htmlString.replace(/\r?\n/g, '<br />');
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/tavern">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
        {(isAuthor || isAdmin) && (
          <Button asChild>
            <Link href={`/tavern/${postId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              수정하기
            </Link>
          </Button>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-bold text-primary">[{post.mainCategory}]</span>
            <span className="font-semibold text-accent">[{post.type}]</span>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">
            {post.isPinned && <Pin className="inline-block h-6 w-6 mr-2 text-accent" />}
            {post.title}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.avatar} alt={post.author.nickname} />
                <AvatarFallback>{post.author.nickname.charAt(0)}</AvatarFallback>
              </Avatar>
              <NicknameDisplay user={post.author} />
            </div>
            <span>|</span>
            <FormattedDateDisplay dateString={post.createdAt} />
            {post.isEdited && (
              <>
                <span>|</span>
                <span className="text-xs italic">(수정됨)</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none mt-6 text-lg">
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent(post.content) }} />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 mt-6 border-t pt-4">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="h-5 w-5" /> {post.upvotes}
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsDown className="h-5 w-5" /> {post.downvotes}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-5 w-5" /> {post.views}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-5 w-5" /> {comments.length}
            </span>
          </div>
        </CardFooter>
      </Card>
      
      <CommentSection 
        postId={postId} 
        initialComments={comments} 
        currentUser={currentUser} 
      />
    </div>
  );
}
