
// src/components/shared/CommentSection.tsx

"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Comment as CommentType, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import NicknameDisplay from './NicknameDisplay';
import FormattedDateDisplay from './FormattedDateDisplay';
import { addComment } from '@/lib/commentApi'; // Assuming you have this API function
import { Send, ThumbsUp, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  initialComments: CommentType[];
  currentUser: User | null; // Added this prop
}

const CommentItem = ({ comment, currentUser }: { comment: CommentType, currentUser: User | null }) => {
  return (
    <div className="flex gap-4 py-4">
      <Avatar>
        <AvatarImage src={comment.author.avatar} alt={comment.author.nickname} />
        <AvatarFallback>{comment.author.nickname.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NicknameDisplay user={comment.author} />
            <FormattedDateDisplay dateString={comment.createdAt} className="text-xs" />
          </div>
          {/* Reply and Like buttons can go here */}
        </div>
        <p className="mt-2 text-foreground/90">{comment.content}</p>
         <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <Button variant="ghost" size="xs" className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {comment.upvotes}</Button>
            <Button variant="ghost" size="xs" className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> 답글</Button>
        </div>
        {/* Render replies here if any */}
      </div>
    </div>
  );
};

export default function CommentSection({ postId, initialComments, currentUser }: CommentSectionProps) {
  const { user } = useAuth(); // Can still be used for client-side checks
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "로그인 필요", description: "댓글을 작성하려면 로그인해야 합니다.", variant: "destructive" });
      return;
    }
    if (!newComment.trim()) {
      toast({ title: "내용 필요", description: "댓글 내용을 입력해주세요.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
    // The new structure for a comment requires the full author object
      const commentData = {
        postId,
        author: user, // Pass the full user object
        content: newComment.trim(),
        upvotes: 0,
        downvotes: 0,
      };
      // @ts-ignore - a temporary ignore because `addComment` expects a simplified object for now.
      const newCommentId = await addComment(commentData);
      
      const optimisticComment: CommentType = {
        ...commentData,
        id: newCommentId,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      setComments(prev => [...prev, optimisticComment]);
      setNewComment('');

      toast({ title: "성공", description: "댓글이 등록되었습니다." });
    } catch (error) {
      toast({ title: "오류", description: "댓글 등록에 실패했습니다.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">댓글 ({comments.length})</h3>
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleCommentSubmit}>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
              className="mb-2"
              disabled={!user || isLoading}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!user || isLoading || !newComment.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? "등록 중..." : "댓글 등록"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 space-y-4 divide-y">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} currentUser={user} />
        ))}
        {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <p>아직 댓글이 없습니다.</p>
                <p>첫 번째 댓글을 남겨보세요!</p>
            </div>
        )}
      </div>
    </div>
  );
}
