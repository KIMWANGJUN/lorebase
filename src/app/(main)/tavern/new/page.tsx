
// src/app/(main)/tavern/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import type { PostMainCategory, PostType } from '@/types';
import { ArrowLeft, FilePlus2, LayoutPanelLeft, PenLine, Send, ListFilter, Bold, Italic, Strikethrough } from 'lucide-react';

const mainCategories: { value: PostMainCategory; label: string }[] = [
  { value: 'Unity', label: 'Unity 게시판' },
  { value: 'Unreal', label: 'Unreal 게시판' },
  { value: 'Godot', label: 'Godot 게시판' },
  { value: 'General', label: '일반 게시판' },
];

// Basic post types, can be expanded based on main category selection if needed
const postTypes: { value: PostType; label: string; mainCategories: PostMainCategory[] }[] = [
  { value: 'QnA', label: '질문/답변', mainCategories: ['Unity', 'Unreal', 'Godot'] },
  { value: 'Knowledge', label: '정보/지식공유', mainCategories: ['Unity', 'Unreal', 'Godot'] },
  { value: 'DevLog', label: '개발일지/프로젝트', mainCategories: ['Unity', 'Unreal', 'Godot'] },
  { value: 'GeneralPost', label: '자유글', mainCategories: ['General'] },
  { value: 'Humor', label: '유머/일상', mainCategories: ['General'] },
  { value: 'Notice', label: '공지사항', mainCategories: ['General'] }, // Admin only potentially
];


export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedMainCategory, setSelectedMainCategory] = useState<PostMainCategory | ''>('');
  const [selectedPostType, setSelectedPostType] = useState<PostType | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "로그인 필요", description: "글을 작성하려면 먼저 로그인해주세요.", variant: "destructive" });
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  const availablePostTypes = selectedMainCategory
    ? postTypes.filter(pt => pt.mainCategories.includes(selectedMainCategory))
    : [];

  const handleMainCategoryChange = (value: string) => {
    setSelectedMainCategory(value as PostMainCategory);
    setSelectedPostType(''); // Reset post type when main category changes
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log({
      mainCategory: selectedMainCategory,
      postType: selectedPostType,
      title,
      content,
      authorId: user?.id,
      authorNickname: user?.nickname,
    });
    setIsLoading(false);
    toast({ title: "성공!", description: "게시글이 성공적으로 등록되었습니다. (실제 저장되지는 않습니다)" });
    router.push('/tavern'); // Or to the newly created post page: /tavern/[new_post_id]
  };

  if (authLoading || !user) {
    return <div className="container mx-auto py-8 px-4 text-center">페이지를 불러오는 중...</div>;
  }
  
  const bannerImageUrl = "https://placehold.co/1920x600.png";

  return (
    <div className="container mx-auto py-8 px-4">
       <section 
        className="text-center py-16 md:py-24 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="writing desk quill"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg flex items-center justify-center">
            <FilePlus2 className="h-10 w-10 mr-3 text-accent" />
            새 게시글 작성
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">커뮤니티에 새로운 이야기를 공유하세요.</p>
        </div>
      </section>

      <Button asChild variant="outline" className="mb-6 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
        <Link href="/tavern">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
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
              <div className="mb-2 p-2 border border-input rounded-md bg-background flex gap-1">
                <Button variant="outline" size="icon" type="button" title="Bold" className="h-8 w-8">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" type="button" title="Italic" className="h-8 w-8">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" type="button" title="Strikethrough" className="h-8 w-8">
                  <Strikethrough className="h-4 w-4" />
                </Button>
                {/* TODO: Add more formatting buttons here (font size, color etc.) 
                    These buttons are currently placeholders. 
                    Full functionality requires a Rich Text Editor component. */}
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
                {isLoading ? '게시 중...' : <><Send className="mr-2 h-4 w-4" /> 게시하기</>}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

