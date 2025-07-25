
// src/components/shared/PostList.tsx
"use client";

import React, { useState, useMemo, FC, ElementType, useEffect } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Card, CardHeader, CardFooter } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/form/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/overlay/alert-dialog";
import type { Post, PostMainCategory, PostType, User as UserType } from '@/types';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { deletePost } from '@/lib/postApi';
import { MessageSquare, ThumbsUp, Eye, Pin, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ScrollText, ListChecks, HelpCircle, BookOpen, ClipboardList, Smile, Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/data-display/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import { useToast } from '@/hooks/use-toast';
import { COMMUNITY_CHANNELS, getChannelBySlug } from '@/lib/communityChannels';

const POSTS_PER_PAGE = 10;

const postTypes: { value: PostType; label: string; mainCategories: PostMainCategory[] }[] = [
    { value: 'QnA', label: 'Q&A', mainCategories: ['Unity', 'Unreal', 'Godot'] },
    { value: 'Knowledge', label: '지식공유', mainCategories: ['Unity', 'Unreal', 'Godot'] },
    { value: 'DevLog', label: '개발일지', mainCategories: ['Unity', 'Unreal', 'Godot'] },
    { value: 'GeneralPost', label: '자유글', mainCategories: ['General'] },
    { value: 'Humor', label: '유머', mainCategories: ['General'] },
    { value: 'Notice', label: '공지', mainCategories: ['General'] },
];

const PostItem = ({ post, currentUser, isAdmin, router, onDelete }: { post: Post; currentUser: UserType | null; isAdmin: boolean; router: AppRouterInstance; onDelete: (postId: string) => void; }) => {
    const { toast } = useToast();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await deletePost(post.id);
            toast({ title: "성공", description: "게시글이 삭제되었습니다." });
            onDelete(post.id);
        } catch (error) {
            toast({ title: "오류", description: "게시글 삭제에 실패했습니다.", variant: "destructive" });
        }
    };
    
    const getCategoryLabel = (mainCategory: PostMainCategory, type: PostType) => {
        const typeLabel = postTypes.find(pt => pt.value === type)?.label || type;
        if (mainCategory === 'General') {
            return typeLabel;
        }
        return `${mainCategory} - ${typeLabel}`;
    }

    return (
        <Card className={cn("shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out bg-card border-border hover:border-primary/30", post.isPinned && "border-t-4 border-accent", post.type === 'Notice' && "bg-primary/10 border-primary/50")}>
            <Link href={`/tavern/${post.id}`} className="block hover:bg-card/5 transition-colors rounded-lg relative group">
                <CardHeader className="pb-1 pt-2 px-3">
                    <div className="flex justify-between items-start">
                        <h3 className={cn("text-base mb-0.5 flex items-center font-headline font-bold", post.type === 'Notice' ? "text-primary" : "text-foreground group-hover:text-primary transition-colors")}>
                            {post.isPinned && <Pin className="h-4 w-4 mr-2 text-accent" />}
                            {post.type === 'Notice' && <ScrollText className="h-4 w-4 mr-2 text-primary" />}
                            {post.title}
                            {post.isEdited && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(수정됨)</span>}
                        </h3>
                        {(currentUser?.id === post.author.id || isAdmin) && (
                            <div className="flex gap-1 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={(e) => { e.preventDefault(); router.push(`/tavern/${post.id}/edit`); }}><Edit className="h-3 w-3" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={(e) => e.preventDefault()}><Trash2 className="h-3 w-3" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>게시글 삭제 확인</AlertDialogTitle><AlertDialogDescription>"{post.title}" 게시글을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel onClick={e => e.stopPropagation()}>아니오</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>예, 삭제합니다</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground space-x-1.5 mt-1">
                        <Avatar className="h-4 w-4 border border-border shrink-0"><AvatarImage src={post.author.avatar} /><AvatarFallback>{post.author.nickname.substring(0, 1).toUpperCase()}</AvatarFallback></Avatar>
                        <NicknameDisplay user={post.author} context="postAuthor" postMainCategoryForAuthor={post.mainCategory} />
                        <span>·</span>
                        {post.createdAt instanceof Timestamp ? <FormattedDateDisplay date={post.createdAt.toDate()} /> : <span>날짜 정보 없음</span>}
                        <span>·</span>
                        <span className="capitalize text-xs font-semibold">{getCategoryLabel(post.mainCategory, post.type)}</span>
                    </div>
                </CardHeader>
                <CardFooter className="flex justify-start items-center text-xs text-muted-foreground px-3 py-1 mt-1">
                    <div className="flex gap-2 items-center">
                        <span className="flex items-center text-[10px] gap-0.5 text-muted-foreground"><ThumbsUp className="h-2.5 w-2.5" />{post.upvotes}</span>
                        <span className="flex items-center text-[10px] gap-0.5"><MessageSquare className="h-2.5 w-2.5" />{post.commentCount}</span>
                        <span className="flex items-center text-[10px] gap-0.5"><Eye className="h-2.5 w-2.5" />{post.views}</span>
                    </div>
                </CardFooter>
            </Link>
        </Card>
    );
};

interface SubTabInfo { value: PostType | 'popular' | 'all'; label: string; icon?: ElementType; }
const engineSubTabs: SubTabInfo[] = [ { value: 'all', label: '전체 글', icon: ListChecks }, { value: 'QnA', label: 'Q&A', icon: HelpCircle }, { value: 'Knowledge', label: '지식', icon: BookOpen }, { value: 'DevLog', label: '개발 일지', icon: ClipboardList }, { value: 'popular', label: '인기 글', icon: Flame }, ];
const generalSubTabs: SubTabInfo[] = [ { value: 'all', label: '전체 글', icon: ListChecks }, { value: 'GeneralPost', label: '자유글', icon: MessageSquare }, { value: 'Humor', label: '유머', icon: Smile }, { value: 'Notice', label: '공지', icon: ScrollText}, { value: 'popular', label: '인기 글', icon: Flame }, ];

interface PostListProps { initialPosts: Post[]; channelSlug: string; initialSearchTerm: string; }

const PostList: FC<PostListProps> = ({ initialPosts, channelSlug, initialSearchTerm }) => {
  const [posts, setPosts] = useState(initialPosts);
  useEffect(() => { setPosts(initialPosts); }, [initialPosts]);

  const [subCategory, setSubCategory] = useState<PostType | 'popular' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const currentChannel = getChannelBySlug(channelSlug) || COMMUNITY_CHANNELS[0];

  useEffect(() => { setCurrentPage(1); }, [channelSlug, initialSearchTerm]);

  const handleDeletePost = (postId: string) => { setPosts(currentPosts => currentPosts.filter(p => p.id !== postId)); };

  const filteredPosts = useMemo(() => {
    let currentPosts = posts.filter(p => currentChannel.categories.includes(p.mainCategory));
    if (initialSearchTerm) {
      const lowercasedTerm = initialSearchTerm.toLowerCase();
      currentPosts = currentPosts.filter(p => p.title.toLowerCase().includes(lowercasedTerm) || p.author.nickname.toLowerCase().includes(lowercasedTerm));
    }
    const notices = currentPosts.filter(p => p.type === 'Notice');
    let otherPosts = currentPosts.filter(p => p.type !== 'Notice');
    const sortByDate = (a: Post, b: Post) => {
      const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    };
    if (subCategory === 'popular') {
      otherPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (subCategory !== 'all') {
      otherPosts = otherPosts.filter(p => p.type === subCategory);
      otherPosts.sort(sortByDate);
    } else {
      otherPosts.sort(sortByDate);
    }
    const pinnedPosts = otherPosts.filter(p => p.isPinned);
    const regularPosts = otherPosts.filter(p => !p.isPinned);
    return [...notices.sort(sortByDate), ...pinnedPosts, ...regularPosts];
  }, [posts, currentChannel, subCategory, initialSearchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPostsToDisplay = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const paginate = (pageNumber: number) => { if (pageNumber > 0 && pageNumber <= totalPages) { setCurrentPage(pageNumber); } };
  const renderPageNumbers = () => {
    const pageNumbers = []; const maxPagesToShow = 5; let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
    if (totalPages === 0) return null;
    for (let i = startPage; i <= endPage; i++) { pageNumbers.push(<Button key={i} variant={currentPage === i ? 'default' : 'outline'} size="sm" onClick={() => paginate(i)} className="h-8 w-8 p-0">{i}</Button>); }
    return pageNumbers;
  };
  const currentSubTabs = currentChannel.slug === 'general' ? generalSubTabs : engineSubTabs;
  useEffect(() => { if (!currentSubTabs.some(tab => tab.value === subCategory)) setSubCategory('all'); }, [currentChannel, subCategory, currentSubTabs]);

  return (
    <>
      <Tabs value={subCategory} onValueChange={(value) => setSubCategory(value as PostType | 'popular' | 'all')} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:flex items-center">
            {currentSubTabs.map(tab => <TabsTrigger key={tab.value} value={tab.value} className="flex-1 lg:flex-none">{tab.icon && <tab.icon className="mr-1.5 h-4 w-4" />} {tab.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {currentPostsToDisplay.length > 0 ? (
        <div className="space-y-3">{currentPostsToDisplay.map((post) => <PostItem key={post.id} post={post} currentUser={user} isAdmin={!!isAdmin} router={router} onDelete={handleDeletePost} />)}</div>
      ) : (
        <div className="text-center py-12"><MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><p className="text-lg text-muted-foreground">표시할 게시글이 없습니다.</p></div>
      )}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="outline" size="icon" onClick={() => paginate(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4"/></Button>
                {renderPageNumbers()}
                <Button variant="outline" size="icon" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4"/></Button>
            </div>
            <p className="text-sm text-muted-foreground">총 {totalPages} 페이지 중 {currentPage} 페이지</p>
        </div>
      )}
    </>
  );
};

export default PostList;
