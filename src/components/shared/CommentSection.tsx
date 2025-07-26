"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/form/button';
import { Textarea } from '@/components/ui/form/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import type { Comment as CommentType, User, Post, PostMainCategory, PostType } from '@/types';
import FormattedDateDisplay from './FormattedDateDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { addComment, AddCommentData } from '@/lib/commentApi';
import { Timestamp, FieldValue } from 'firebase/firestore';
import NicknameDisplay from './NicknameDisplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { 
  MessageSquare, CornerDownRight, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Eye, ThumbsUp, MessageCircle, Box, AppWindow, PenTool, LayoutGrid
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Extand CommentType for local state management
interface HierarchicalComment extends CommentType {
  replies: HierarchicalComment[];
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentType[];
  currentPost?: Post;
  relatedPosts?: Post[];
}

const categoryIcons: Record<PostMainCategory, React.ElementType> = {
  unity: Box,
  unreal: AppWindow,
  godot: PenTool,
  general: LayoutGrid
};

const getDateFromTimestamp = (ts: Timestamp | FieldValue | Date | undefined): Date => {
    if (ts instanceof Timestamp) return ts.toDate();
    if (ts instanceof Date) return ts;
    return new Date();
};

const CommentForm = ({
  postId,
  parentId = null,
  onCommentAdded,
  user,
  onCancel,
  placeholder = "댓글을 입력하세요..."
}: {
  postId: string;
  parentId?: string | null;
  onCommentAdded: (newComment: CommentType) => void;
  user: User;
  onCancel?: () => void;
  placeholder?: string;
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const trimmedContent = content.trim();
      const commentDataForApi: AddCommentData = {
        postId,
        authorId: user.id,
        content: trimmedContent,
        parentId,
      };
      const newId = await addComment(commentDataForApi);
      const newComment: CommentType = {
        id: newId,
        postId,
        authorId: user.id,
        author: user,
        content: trimmedContent,
        parentId,
        upvotes: 0,
        downvotes: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      onCommentAdded(newComment);
      setContent('');
      if (onCancel) onCancel();
      toast({ title: "성공", description: "댓글이 성공적으로 등록되었습니다." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류 발생";
      toast({ title: "오류", description: `댓글 등록 실패: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 bg-card/50 p-4 rounded-lg border">
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={placeholder} rows={3} className="resize-none bg-background" maxLength={1000} />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{content.length}/1000자</span>
        <div className="flex gap-2">
          {onCancel && <Button variant="ghost" onClick={onCancel} disabled={isSubmitting} size="sm">취소</Button>}
          <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()} size="sm" className="min-w-20">
            {isSubmitting ? '등록 중...' : (parentId ? '답글 등록' : '댓글 등록')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  onCommentAdded,
  user,
  level = 0
}: {
  comment: HierarchicalComment;
  onCommentAdded: (newComment: CommentType) => void;
  user: User | null;
  level?: number;
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [areRepliesVisible, setAreRepliesVisible] = useState(level < 1); // Auto-expand first-level replies
  const [visibleRepliesCount, setVisibleRepliesCount] = useState(10);

  const indentStyle = { marginLeft: level > 0 ? `${Math.min(level, 10) * 1.5}rem` : '0' };
  const commentDate = getDateFromTimestamp(comment.createdAt);

  const loadMoreReplies = () => setVisibleRepliesCount(prev => prev + 10);

  return (
    <div className="space-y-4" style={indentStyle}>
      <div className="bg-card/30 rounded-lg p-4 border">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10 flex-shrink-0"><AvatarImage src={comment.author?.avatar} /><AvatarFallback>{comment.author?.nickname?.charAt(0) || '?'}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <NicknameDisplay user={comment.author} context="commentAuthor" />
              <span className="text-muted-foreground">•</span>
              <FormattedDateDisplay date={commentDate} className="text-sm text-muted-foreground" />
            </div>
            <p className="text-foreground leading-relaxed break-words mb-3">{comment.content}</p>
            <div className="flex items-center gap-2">
              {user && <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setIsReplying(p => !p)}><CornerDownRight className="h-3 w-3 mr-1" />{isReplying ? '취소' : '답글'}</Button>}
              {comment.replies.length > 0 && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setAreRepliesVisible(p => !p)}>
                  {areRepliesVisible ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                  답글 {comment.replies.length}개 {areRepliesVisible ? '숨기기' : '보기'}
                </Button>
              )}
            </div>
            {isReplying && user && (
              <div className="mt-4">
                <CommentForm postId={comment.postId} parentId={comment.id} onCommentAdded={onCommentAdded} user={user} onCancel={() => setIsReplying(false)} placeholder="답글을 입력하세요..." />
              </div>
            )}
          </div>
        </div>
      </div>
      {areRepliesVisible && comment.replies.length > 0 && (
        <div className="space-y-3 pt-2">
          {comment.replies.slice(0, visibleRepliesCount).map(reply => (
            <CommentItem key={reply.id} comment={reply} onCommentAdded={onCommentAdded} user={user} level={level + 1} />
          ))}
          {comment.replies.length > visibleRepliesCount && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={loadMoreReplies} className="text-xs">답글 더보기 ({comment.replies.length - visibleRepliesCount}개 남음)</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, currentPage + 5);

    if (endPage - startPage + 1 < 10) {
      if (currentPage < 5) {
        endPage = Math.min(totalPages, 10);
      } else {
        startPage = Math.max(1, totalPages - 9);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button key={i} variant={currentPage === i ? "default" : "outline"} size="sm" onClick={() => handlePageChange(i)} className="h-8 w-8 p-0">{i}</Button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
      <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 5)} disabled={currentPage <= 5}><ChevronLeft className="h-4 w-4" /></Button>
      {renderPageNumbers()}
      <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 5)} disabled={currentPage > totalPages - 5}><ChevronRight className="h-4 w-4" /></Button>
      <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
    </div>
  );
};

const RelatedPosts = ({ posts, currentCategory }: { posts: Post[], currentCategory: PostMainCategory }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<PostType | 'all' | 'popular'>('all');
  const postsPerPage = 5;

  const filteredPosts = useMemo(() => {
    let basePosts = posts.filter(post => post.mainCategory === currentCategory);
    if (selectedType === 'popular') return [...basePosts].sort((a, b) => (b.postScore ?? 0) - (a.postScore ?? 0));
    if (selectedType !== 'all') return basePosts.filter(post => post.type === selectedType);
    return basePosts.sort((a,b) => getDateFromTimestamp(b.createdAt).getTime() - getDateFromTimestamp(a.createdAt).getTime());
  }, [posts, currentCategory, selectedType]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  const CategoryIcon = categoryIcons[currentCategory] || LayoutGrid;

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><CategoryIcon className="h-5 w-5 text-primary" />{currentCategory} 카테고리 다른 글</CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          {(['all', 'QnA', 'Knowledge', 'DevLog', 'popular'] as const).map(type => (
            <Button key={type} variant={selectedType === type ? 'default' : 'outline'} size="sm" onClick={() => { setSelectedType(type); setCurrentPage(1); }}>
              { {all: '전체', QnA: '질문&답변', Knowledge: '지식', DevLog: '개발일지', popular: '인기글'}[type] }
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {currentPosts.length > 0 ? (
          <div className="space-y-3">
            {currentPosts.map((post) => (
              <Link key={post.id} href={`/tavern/${post.id}`} className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1 text-foreground hover:text-primary">{post.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{post.author.nickname}</span> • <span>{post.type}</span> • <FormattedDateDisplay date={getDateFromTimestamp(post.createdAt)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.upvotes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.commentCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : <div className="text-center py-8 text-muted-foreground"><p>해당 조건의 게시글이 없습니다.</p></div>}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </CardContent>
    </Card>
  );
};

export default function CommentSection({ postId, initialComments, currentPost, relatedPosts = [] }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 15;

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const onCommentAdded = useCallback((newComment: CommentType) => {
    setComments(prev => [...prev, newComment]);
  }, []);
  
  const hierarchicalComments = useMemo((): HierarchicalComment[] => {
    const commentMap: Record<string, HierarchicalComment> = {};
    const rootComments: HierarchicalComment[] = [];

    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    Object.values(commentMap).forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    const sortFn = (a: HierarchicalComment, b: HierarchicalComment) => {
      const timeA = getDateFromTimestamp(a.createdAt).getTime();
      const timeB = getDateFromTimestamp(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    };
    
    // Sort replies at all levels
    Object.values(commentMap).forEach(comment => {
      comment.replies.sort(sortFn);
    });

    return rootComments.sort(sortFn);
  }, [comments, sortOrder]);

  const totalPages = Math.ceil(hierarchicalComments.length / commentsPerPage);
  const currentRootComments = hierarchicalComments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage);
  
  return (
    <div className="space-y-8 mt-12">
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-2xl font-bold flex items-center gap-3"><MessageSquare className="h-6 w-6 text-primary" />댓글 ({comments.length})</h3>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          <Button variant={sortOrder === 'newest' ? 'default' : 'ghost'} size="sm" onClick={() => setSortOrder('newest')} className="h-8 px-3 text-xs"><ArrowDown className="h-3 w-3 mr-1" />최신순</Button>
          <Button variant={sortOrder === 'oldest' ? 'default' : 'ghost'} size="sm" onClick={() => setSortOrder('oldest')} className="h-8 px-3 text-xs"><ArrowUp className="h-3 w-3 mr-1" />오래된순</Button>
        </div>
      </div>
      
      {user ? <CommentForm postId={postId} onCommentAdded={onCommentAdded} user={user} /> : <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed"><MessageSquare className="h-12 w-12 mx-auto mb-4" /><p>댓글을 작성하려면 로그인이 필요합니다.</p></div>}
      
      <div className="space-y-6">
        {currentRootComments.length > 0 ? (
          currentRootComments.map(comment => <CommentItem key={comment.id} comment={comment} onCommentAdded={onCommentAdded} user={user} level={0} />)
        ) : <div className="text-center py-16"><MessageSquare className="h-16 w-16 mx-auto mb-6" /><p>아직 댓글이 없습니다</p><p>첫 번째 댓글을 작성해보세요!</p></div>}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      {currentPost && relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} currentCategory={currentPost.mainCategory} />}
    </div>
  );
}
