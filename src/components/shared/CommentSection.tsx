
// src/components/shared/CommentSection.tsx
"use client";

import type { Comment as CommentType, User as UserType, PostMainCategory, DisplayRankType } from '@/types'; 
import { mockUsers, tetrisTitles, mockTetrisRankings } from '@/lib/mockData'; 
import React, { useState, useEffect, type FC } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageSquare, CornerDownRight, Send, Edit3, Save, XCircle, Box, AppWindow, PenTool, LayoutGrid, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const generateId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const MAX_REPLY_DEPTH = 3; 

const CategoryIcon: FC<{ category: PostMainCategory, className?: string }> = ({ category, className = "h-3.5 w-3.5 shrink-0" }) => {
   let iconColorClass = "";
  switch (category) {
    case 'Unity': iconColorClass = "text-unity-icon"; break;
    case 'Unreal': iconColorClass = "text-unreal-icon"; break;
    case 'Godot': iconColorClass = "text-godot-icon"; break;
    case 'General': iconColorClass = "text-general-icon"; break;
    default: iconColorClass = "text-muted-foreground"; break;
  }
  switch (category) {
    case 'Unity': return <Box className={cn(iconColorClass, className)} />;
    case 'Unreal': return <AppWindow className={cn(iconColorClass, className)} />;
    case 'Godot': return <PenTool className={cn(iconColorClass, className)} />;
    case 'General': return <LayoutGrid className={cn(iconColorClass, className)} />;
    default: return null;
  }
};

interface NicknameDisplayForCommentProps {
  author: UserType;
  postMainCategory: PostMainCategory; 
}

const NicknameDisplayForComment: FC<NicknameDisplayForCommentProps> = ({ author, postMainCategory }) => {
  if (!author) return <p className="text-sm font-medium text-foreground">Unknown User</p>;
  
  let finalContainerClass = "default-rank-item-bg";
  let titleText: string | null = null;
  let nicknameBaseClasses = "text-sm";
  
  let finalNicknameTextClass = "";
  let finalTitleTextClass = "title-text";

  const { 
    rank: globalRank, 
    tetrisRank, 
    categoryStats, 
    username,
    selectedDisplayRank 
  } = author;

  const authorCategoryStats = categoryStats?.[postMainCategory];
  const rankInCurrentCategory = authorCategoryStats?.rankInCate || 0;
  const displayPreference = selectedDisplayRank || 'default';


  if (username === 'WANGJUNLAND') {
    finalContainerClass = "admin-badge-bg admin-badge-border px-1.5 py-0.5";
    finalNicknameTextClass = "text-admin";
  } else if ((displayPreference === 'default' || displayPreference === 'global') && globalRank > 0 && globalRank <= 3) {
    finalContainerClass = cn(globalRank === 1 && 'rank-1-badge', globalRank === 2 && 'rank-2-badge', globalRank === 3 && 'rank-3-badge', "px-1.5 py-0.5");
    finalNicknameTextClass = globalRank === 1 ? "text-rank-gold" : globalRank === 2 ? "text-rank-silver" : "text-rank-bronze";
  } else if ((displayPreference === 'default' || displayPreference === 'tetris') && tetrisRank && tetrisRank > 0 && tetrisRank <= 3) {
    const gradientClass = tetrisRank === 1 ? "text-rank-gold" : tetrisRank === 2 ? "text-rank-silver" : "text-rank-bronze";
    titleText = tetrisTitles[tetrisRank - 1];
    finalTitleTextClass = cn(finalTitleTextClass, gradientClass);
    finalNicknameTextClass = gradientClass;
     if ((displayPreference === 'default' || displayPreference === `category_${postMainCategory}`) && rankInCurrentCategory > 0 && rankInCurrentCategory <= 3) {
        finalContainerClass = cn(`highlight-${postMainCategory.toLowerCase()}`, "px-1.5 py-0.5");
    } else {
      finalContainerClass = "default-rank-item-bg px-1.5 py-0.5";
    }
  } else if ((displayPreference === 'default' || displayPreference === `category_${postMainCategory}`) && rankInCurrentCategory > 0 && rankInCurrentCategory <= 3) {
    const gradientClass = rankInCurrentCategory === 1 ? "text-rank-gold" : rankInCurrentCategory === 2 ? "text-rank-silver" : "text-rank-bronze";
    titleText = postMainCategory === 'General' ? '일반 & 유머' : postMainCategory;
    finalTitleTextClass = cn(finalTitleTextClass, gradientClass);
    finalNicknameTextClass = gradientClass;
    finalContainerClass = cn(`highlight-${postMainCategory.toLowerCase()}`, "px-1.5 py-0.5");
  } else if (displayPreference === 'default' && rankInCurrentCategory > 0 && rankInCurrentCategory <= 10) {
    finalNicknameTextClass = `text-${postMainCategory.toLowerCase()}-themed nickname-text-rank-${rankInCurrentCategory}`;
    finalContainerClass = "default-rank-item-bg px-1.5 py-0.5";
  } else {
    finalNicknameTextClass = "text-foreground";
  }
  
  const showCategoryIconInNickname = !(username === 'WANGJUNLAND' || ((displayPreference === 'default' || displayPreference === 'global') && globalRank > 0 && globalRank <= 3));
  const NicknameWrapper = finalContainerClass.includes('highlight-general') && !finalContainerClass.includes('highlight-general-inner') ? 'div' : React.Fragment;
  const wrapperProps = NicknameWrapper === 'div' ? { className: 'highlight-general-inner p-0' } : {};

  return (
    <div className="flex flex-col items-start">
      {titleText && <div className="title-container"><p className={finalTitleTextClass}>{titleText}</p></div>}
      <NicknameWrapper {...wrapperProps}>
        <div className={cn(finalContainerClass, "inline-flex items-center gap-1", titleText && "mt-0.5", NicknameWrapper === 'div' && "p-0")}>
            {showCategoryIconInNickname && postMainCategory && <CategoryIcon category={postMainCategory} className="h-3.5 w-3.5" />}
            <span className={cn(nicknameBaseClasses, finalNicknameTextClass, NicknameWrapper === 'div' ? 'text-content-inside-gradient' : '')}>
              {author.nickname}
            </span>
        </div>
      </NicknameWrapper>
    </div>
  );
};


interface CommentEntryProps {
  comment: CommentType;
  currentUser: UserType | null;
  postMainCategory: PostMainCategory;
  onAddReply: (parentId: string, replyContent: string) => void;
  onEditComment: (commentId: string, newContent: string) => void;
  depth?: number;
  activeReplyBoxId: string | null;
  setActiveReplyBoxId: (id: string | null) => void;
}

const CommentEntry = ({ comment, currentUser, postMainCategory, onAddReply, onEditComment, depth = 0, activeReplyBoxId, setActiveReplyBoxId }: CommentEntryProps) => {
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  
  const author = mockUsers.find(u => u.id === comment.authorId); 
  const isAuthor = currentUser?.id === comment.authorId;
  const canReply = depth < MAX_REPLY_DEPTH -1; 


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
    if (replyContent.trim() && currentUser && author) { 
      onAddReply(comment.id, replyContent.trim());
      setReplyContent('');
      setActiveReplyBoxId(null); 
    }
  };

  const handleEditToggle = () => {
    if (isEditing) { 
      setEditedContent(comment.content); 
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
    <div className={cn("py-3", depth > 0 && "ml-4 pl-4 border-l md:ml-6 md:pl-6 border-border/50")}>
      <div className="flex items-start space-x-2 md:space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={author?.avatar || `https://placehold.co/40x40.png?text=${comment.authorNickname.substring(0,1)}`} alt={comment.authorNickname}/>
          <AvatarFallback className="text-xs bg-muted text-muted-foreground">{comment.authorNickname.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            {author ? <NicknameDisplayForComment author={author} postMainCategory={postMainCategory} /> : <p className="text-sm font-medium text-foreground">{comment.authorNickname}</p>}
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
                className="min-h-[60px] text-sm bg-input border-input text-foreground"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="xs" onClick={handleEditSave} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="h-3 w-3 mr-1"/> 저장</Button>
                <Button size="xs" variant="outline" onClick={handleEditToggle} className="border-border text-muted-foreground hover:bg-muted/50"><XCircle className="h-3 w-3 mr-1"/> 취소</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap text-foreground/90">{comment.content}</p>
          )}
          {!isEditing && (
            <div className="mt-1.5 flex items-center space-x-3">
              {currentUser && canReply && (
                <Button variant="ghost" size="xs" onClick={handleToggleReplyInput} className="text-xs text-muted-foreground hover:text-accent hover:bg-accent/10">
                  <CornerDownRight className="h-3 w-3 mr-1" /> {isReplyBoxOpen ? '취소' : '답글'}
                </Button>
              )}
              {isAuthor && (
                <Button variant="ghost" size="xs" onClick={handleEditToggle} className="text-xs text-muted-foreground hover:text-accent hover:bg-accent/10">
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
            className="min-h-[60px] text-sm bg-input border-input text-foreground"
            rows={2}
          />
          <Button size="sm" onClick={handleReplySubmit} className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
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
              postMainCategory={postMainCategory}
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
  postMainCategory: PostMainCategory;
  authorFull: UserType; 
}

export default function CommentSection({ postId, initialComments, postMainCategory, authorFull }: CommentSectionProps) {
  const { user: currentUser } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);

  useEffect(() => {
    const sortedInitialComments = [...initialComments].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); 
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
      setComments(prevComments => [...prevComments, newComment].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
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
    <Card className="mt-8 shadow-md bg-card border-border">
      <CardHeader>
        <h3 className="text-xl font-semibold flex items-center text-foreground">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" /> 댓글 ({totalCommentCount})
        </h3>
      </CardHeader>
      <CardContent>
        {currentUser ? (
          <div className="mb-6 pb-6 border-b border-border/50">
            <div className="flex items-start space-x-3">
              <Avatar className="h-9 w-9 mt-1">
                <AvatarImage src={currentUser.avatar || `https://placehold.co/40x40.png?text=${currentUser.nickname.substring(0,1)}`} alt={currentUser.nickname} />
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">{currentUser.nickname.substring(0,1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="따뜻한 댓글을 남겨주세요."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="min-h-[70px] bg-input border-input text-foreground"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleTopLevelCommentSubmit} disabled={!newCommentContent.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="h-4 w-4 mr-2" /> 댓글 등록
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground mb-6 pb-6 border-b border-border/50 text-sm">
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
                postMainCategory={postMainCategory}
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
