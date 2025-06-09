
// src/app/(main)/tavern/[postId]/edit/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import type { Post, PostMainCategory, PostType } from '@/types';
import { mockPosts } from '@/lib/mockData'; 
import { ArrowLeft, Edit3, LayoutPanelLeft, PenLine, Send, ListFilter, Bold, Italic, Strikethrough, Image as ImageIcon, Video } from 'lucide-react';

const mainCategories: { value: PostMainCategory; label: string }[] = [
  { value: 'Unity', label: 'Unity 게시판' },
  { value: 'Unreal', label: 'Unreal 게시판' },
  { value: 'Godot', label: 'Godot 게시판' },
  { value: 'General', label: '일반 게시판' },
];

const postTypes: { value: PostType; label: string; mainCategories: PostMainCategory[] }[] = [
  { value: 'QnA', label: '질문/답변', mainCategories: ['Unity', 'Unreal', 'Godot'] },
  { value: 'Knowledge', label: '정보/지식공유', mainCategories: ['Unity', 'Unreal', 'Godot'] },
  { value: 'DevLog', label: '개발일지/프로젝트', mainCategories: ['Unity', 'Unreal', 'Godot'] },
  { value: 'GeneralPost', label: '자유글', mainCategories: ['General'] },
  { value: 'Humor', label: '유머/일상', mainCategories: ['General'] },
  { value: 'Notice', label: '공지사항', mainCategories: ['General'] },
];


export default function EditPostPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const postId = typeof params.postId === 'string' ? params.postId : undefined;

  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<PostMainCategory | ''>('');
  const [selectedPostType, setSelectedPostType] = useState<PostType | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast({ title: "오류", description: "로그인이 필요합니다.", variant: "destructive" });
      router.push('/login');
      return;
    }

    if (postId) {
      const foundPost = mockPosts.find(p => p.id === postId);
      if (foundPost) {
        if (foundPost.authorId !== user.id && !isAdmin) {
            toast({ title: "권한 없음", description: "이 게시글을 수정할 권한이 없습니다.", variant: "destructive" });
            router.push(`/tavern/${postId}`);
            return;
        }
        setPostToEdit(foundPost);
        setTitle(foundPost.title);
        setContent(foundPost.content);
        setSelectedMainCategory(foundPost.mainCategory);
        setSelectedPostType(foundPost.type);
      } else {
        toast({ title: "오류", description: "게시글을 찾을 수 없습니다.", variant: "destructive" });
        router.push('/tavern');
      }
    } else {
        toast({ title: "오류", description: "잘못된 접근입니다.", variant: "destructive" });
        router.push('/tavern');
    }
    setPageLoading(false);
  }, [postId, user, isAdmin, authLoading, router, toast]);

  const availablePostTypes = selectedMainCategory
    ? postTypes.filter(pt => pt.mainCategories.includes(selectedMainCategory))
    : [];

  const handleMainCategoryChange = (value: string) => {
    setSelectedMainCategory(value as PostMainCategory);
    setSelectedPostType(''); 
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !postToEdit) {
      toast({ title: "오류", description: "사용자 또는 게시글 정보가 없습니다.", variant: "destructive" });
      return;
    }
     if (!selectedMainCategory) {
      toast({ title: "오류", description: "게시판을 선택해주세요.", variant: "destructive" });
      return;
    }
    if (!selectedPostType) {
      toast({ title: "오류", description: "글 종류를 선택해주세요.", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "오류", description: "제목을 입력해주세요.", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "오류", description: "내용을 입력해주세요.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300)); 

    const postIndex = mockPosts.findIndex(p => p.id === postToEdit.id);
    if (postIndex !== -1) {
      mockPosts[postIndex] = {
        ...mockPosts[postIndex],
        title: title.trim(),
        content: content.trim(),
        mainCategory: selectedMainCategory as PostMainCategory,
        type: selectedPostType as PostType,
        updatedAt: new Date().toISOString(),
        isEdited: true,
      };
    }

    setIsLoading(false);
    toast({ title: "성공!", description: "게시글이 수정되었습니다." });
    router.push(`/tavern/${postToEdit.id}`); 
  };

  if (authLoading || pageLoading || !postToEdit) {
    return <div className="container mx-auto py-8 px-4 text-center">페이지를 불러오는 중...</div>;
  }
  
  const bannerImageUrl = "https://placehold.co/1920x600.png";

  return (
    <div className="container mx-auto py-8 px-4">
       <section 
        className="text-center py-16 md:py-24 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="editing scroll magic"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg flex items-center justify-center">
            <Edit3 className="h-10 w-10 mr-3 text-accent" />
            게시글 수정
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">게시글 내용을 수정합니다.</p>
        </div>
      </section>

      <Button asChild variant="outline" className="mb-6 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
        <Link href={`/tavern/${postId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          게시글로 돌아가기
        </Link>
      </Button>

      <Card className="shadow-xl bg-card border-border">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="mainCategory" className="text-muted-foreground flex items-center mb-2">
                  <LayoutPanelLeft className="h-4 w-4 mr-2 text-primary" />
                  게시판 선택
                </Label>
                <Select value={selectedMainCategory} onValueChange={handleMainCategoryChange}>
                  <SelectTrigger id="mainCategory" className="w-full bg-input border-border text-foreground focus:ring-accent">
                    <SelectValue placeholder="게시판을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {mainCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="postType" className="text-muted-foreground flex items-center mb-2">
                  <ListFilter className="h-4 w-4 mr-2 text-primary" />
                  글 종류 선택
                </Label>
                <Select 
                  value={selectedPostType} 
                  onValueChange={(value) => setSelectedPostType(value as PostType)}
                  disabled={!selectedMainCategory || availablePostTypes.length === 0}
                >
                  <SelectTrigger id="postType" className="w-full bg-input border-border text-foreground focus:ring-accent">
                    <SelectValue placeholder={selectedMainCategory ? "글 종류를 선택하세요" : "게시판을 먼저 선택하세요"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {availablePostTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-muted-foreground flex items-center mb-2">
                <PenLine className="h-4 w-4 mr-2 text-primary" />
                제목
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="게시글 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-lg bg-input border-border text-foreground focus:ring-accent"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-muted-foreground flex items-center mb-2">
                <PenLine className="h-4 w-4 mr-2 text-primary" />
                본문 내용
              </Label>
              <div className="mb-2 p-2 border border-input rounded-md bg-background flex gap-1 flex-wrap">
                <Button variant="outline" size="icon" type="button" title="Bold" className="h-8 w-8">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" type="button" title="Italic" className="h-8 w-8">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" type="button" title="Strikethrough" className="h-8 w-8">
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" type="button" title="Add Image" className="h-8 w-8">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" type="button" title="Add Video" className="h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="content"
                placeholder="게시글 내용을 작성해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[250px] text-base bg-input border-border text-foreground focus:ring-accent"
                rows={10}
              />
            </div>

            <CardFooter className="p-0 pt-4 flex justify-end">
              <Button type="submit" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md text-base px-6 py-3" disabled={isLoading}>
                {isLoading ? '수정 중...' : <><Send className="mr-2 h-4 w-4" /> 수정 완료</>}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
