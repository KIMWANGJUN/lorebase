// src/components/shared/CommentSection.tsx
"use client";

import type { Comment as CommentType, User } from '@/types';
import { mockUsers } from '@/lib/mockData'; 
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageSquare, CornerDownRight, Send, Edit3, Save, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to generate unique IDs for new comments/replies
const generateId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const MAX_REPLY_DEPTH = 3; // 0 (top-level), 1 (reply), 2 (reply to reply)

interface CommentEntryProps {
  comment: CommentType;
  currentUser: User | null;
  onAddReply: (parentId: string, replyContent: string) => void;
  onEditComment: (commentId: string, newContent: string) => void;
  depth?: number;
  activeReplyBoxId: string | null;
  setActiveReplyBoxId: (id: string | null) => void;
}

const CommentEntry = ({ comment, currentUser, onAddReply, onEditComment, depth = 0, activeReplyBoxId, setActiveReplyBoxId }: CommentEntryProps) => {
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  
  const author = mockUsers.find(u => u.id === comment.authorId);
  const isAuthor = currentUser?.id === comment.authorId;
  const canReply = depth < MAX_REPLY_DEPTH -1; // Allow reply if current depth is 0, 1. No reply button if depth is 2.


  const isReplyBoxOpen = activeReplyBoxId === comment.id;

  const handleToggleReplyInput = () => {
    if (isReplyBoxOpen) {
      setActiveReplyBoxId(null); 
    } else {
      setActiveReplyBoxId(comment.id); 
      setReplyContent(''); 
    }
  };

  const handleReplySubmit = () => {
    if (replyContent.trim() && currentUser) {
      onAddReply(comment.id, replyContent.trim());
      setReplyContent('');
      setActiveReplyBoxId(null); 
    }
  };

  const handleEditToggle = () => {
    if (isEditing) { // If cancelling edit
      setEditedContent(comment.content); // Reset to original content
    }
    setIsEditing(!isEditing);
  };

  const handleEditSave = () => {
    if (editedContent.trim()) {
      onEditComment(comment.id, editedContent.trim());
      setIsEditing(false);
    }
  };
  
  const commentDate = comment.updatedAt ? new Date(comment.updatedAt) : new Date(comment.createdAt);
  const formattedDate = `${commentDate.toLocaleDateString()} ${commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;


  return (
    <div className={cn("py-3", depth > 0 && "ml-4 pl-4 border-l md:ml-6 md:pl-6")}>
      <div className="flex items-start space-x-2 md:space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={author?.avatar || `https://placehold.co/40x40.png?text=${comment.authorNickname.substring(0,1)}`} alt={comment.authorNickname}/>
          <AvatarFallback>{comment.authorNickname.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={cn("text-sm font-medium", author?.username === 'WANGJUNLAND' && 'text-admin')}>{comment.authorNickname}</p>
            <p className="text-xs text-muted-foreground">
              {formattedDate}
              {comment.isEdited && <span className="ml-1 text-muted-foreground/80">(수정함)</span>}
            </p>
          </div>
          {isEditing ? (
            <div className="mt-1 space-y-2">
              <Textarea 
                value={editedContent} 
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[60px] text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="xs" onClick={handleEditSave}><Save className="h-3 w-3 mr-1"/> 저장</Button>
                <Button size="xs" variant="outline" onClick={handleEditToggle}><XCircle className="h-3 w-3 mr-1"/> 취소</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          )}
          {!isEditing && (
            <div className="mt-1.5 flex items-center space-x-3">
              {currentUser && canReply && (
                <Button variant="ghost" size="xs" onClick={handleToggleReplyInput} className="text-xs text-muted-foreground">
                  <CornerDownRight className="h-3 w-3 mr-1" /> {isReplyBoxOpen ? '취소' : '답글'}
                </Button>
              )}
              {isAuthor && (
                <Button variant="ghost" size="xs" onClick={handleEditToggle} className="text-xs text-muted-foreground">
                  <Edit3 className="h-3 w-3 mr-1" /> 수정
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {isReplyBoxOpen && currentUser && canReply && (
        <div className={cn("mt-2", depth > 0 ? "ml-6" : "ml-10 md:ml-11")}>
          <Textarea
            placeholder={`${comment.authorNickname}에게 답글 작성...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px] text-sm"
            rows={2}
          />
          <Button size="sm" onClick={handleReplySubmit} className="mt-2">
            <Send className="h-3.5 w-3.5 mr-1.5" /> 답글 등록
          </Button>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => (
            <CommentEntry
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onAddReply={onAddReply}
              onEditComment={onEditComment}
              depth={depth + 1}
              activeReplyBoxId={activeReplyBoxId}
              setActiveReplyBoxId={setActiveReplyBoxId}
            />
          ))}
        </div>
      )}
    </div>
  );
};


interface CommentSectionProps {
  postId: string;
  initialComments: CommentType[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { user: currentUser } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);

  useEffect(() => {
    const sortedInitialComments = [...initialComments].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setComments(sortedInitialComments);
  }, [initialComments]);

  const handleAddCommentInternal = (content: string, parentId?: string) => {
    if (!currentUser) return; 

    const newComment: CommentType = {
      id: generateId(),
      postId,
      authorId: currentUser.id,
      authorNickname: currentUser.nickname,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      replies: [],
      isEdited: false,
      ...(parentId && { parentId }),
    };

    if (parentId) {
      setComments(prevComments => {
        const addReplyRecursive = (items: CommentType[]): CommentType[] => {
          return items.map(comment => {
            if (comment.id === parentId) {
              const updatedReplies = [...(comment.replies || []), newComment].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              return { ...comment, replies: updatedReplies };
            }
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: addReplyRecursive(comment.replies) };
            }
            return comment;
          });
        };
        return addReplyRecursive(prevComments);
      });
    } else {
      setComments(prevComments => [newComment, ...prevComments].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleTopLevelCommentSubmit = () => {
    if (newCommentContent.trim() && currentUser) {
      handleAddCommentInternal(newCommentContent.trim());
      setNewCommentContent('');
    }
  };
  
  const handleAddReplyToComment = (targetCommentId: string, replyContent: string) => {
    handleAddCommentInternal(replyContent, targetCommentId);
  };

  const handleEditCommentInternal = (commentId: string, newContent: string) => {
    const editRecursive = (items: CommentType[]): CommentType[] => {
      return items.map(comment => {
        if (comment.id === commentId) {
          return { 
            ...comment, 
            content: newContent, 
            isEdited: true, 
            updatedAt: new Date().toISOString() 
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: editRecursive(comment.replies) };
        }
        return comment;
      });
    };
    setComments(prevComments => editRecursive(prevComments));
  };

  const totalCommentCount = comments.reduce((acc, cv) => {
    const countReplies = (comment: CommentType): number => {
        return 1 + (comment.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0);
    };
    return acc + countReplies(cv);
  }, 0);


  return (
    <Card className="mt-8 shadow-md">
      <CardHeader>
        <h3 className="text-xl font-semibold flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" /> 댓글 ({totalCommentCount})
        </h3>
      </CardHeader>
      <CardContent>
        {currentUser ? (
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-start space-x-3">
              <Avatar className="h-9 w-9 mt-1">
                <AvatarImage src={currentUser.avatar || `https://placehold.co/40x40.png?text=${currentUser.nickname.substring(0,1)}`} alt={currentUser.nickname} />
                <AvatarFallback>{currentUser.nickname.substring(0,1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="따뜻한 댓글을 남겨주세요."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="min-h-[70px]"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleTopLevelCommentSubmit} disabled={!newCommentContent.trim()}>
                    <Send className="h-4 w-4 mr-2" /> 댓글 등록
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground mb-6 pb-6 border-b text-sm">
            댓글을 작성하려면 <Link href="/login" className="underline text-primary hover:text-primary/80">로그인</Link>하세요.
          </p>
        )}
        
        <div className="space-y-1">
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentEntry
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onAddReply={handleAddReplyToComment}
                onEditComment={handleEditCommentInternal}
                activeReplyBoxId={activeReplyBoxId}
                setActiveReplyBoxId={setActiveReplyBoxId}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
