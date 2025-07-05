
// src/components/shared/PostForm.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import type { Post, PostMainCategory, PostType, User } from '@/types';
import { LayoutPanelLeft, ListFilter, PenLine, Send, Bold, Italic, Strikethrough, Image as ImageIcon, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

interface PostFormProps {
    initialData?: Partial<Post>;
    onSubmit: (data: Omit<Post, 'id' | 'author' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'views' | 'commentCount' | 'tags' | 'isPinned' | 'isEdited' | 'postScore' | 'replies'> & { authorId: string, authorNickname: string, authorAvatar?: string }) => Promise<void>;
    isLoading: boolean;
    submitButtonText?: string;
  }

  export default function PostForm({ initialData, onSubmit, isLoading, submitButtonText = "게시하기" }: PostFormProps) {
    const { toast } = useToast();
    const { user } = useAuth();
  
    const [selectedMainCategory, setSelectedMainCategory] = useState<PostMainCategory | ''>(initialData?.mainCategory || '');
    const [selectedPostType, setSelectedPostType] = useState<PostType | ''>(initialData?.type || '');
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
  
    useEffect(() => {
      if (initialData) {
        setSelectedMainCategory(initialData.mainCategory || '');
        setSelectedPostType(initialData.type || '');
        setTitle(initialData.title || '');
        setContent(initialData.content || '');
      }
    }, [initialData]);

  const availablePostTypes = selectedMainCategory
    ? postTypes.filter(pt => pt.mainCategories.includes(selectedMainCategory))
    : [];

  const handleMainCategoryChange = (value: string) => {
    setSelectedMainCategory(value as PostMainCategory);
    setSelectedPostType(''); 
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!selectedMainCategory || !selectedPostType || !title.trim() || !content.trim()) {
      toast({ title: "오류", description: "모든 필드를 입력해주세요.", variant: "destructive" });
      return;
    }

    await onSubmit({
        mainCategory: selectedMainCategory,
        type: selectedPostType,
        title: title.trim(),
        content: content.trim(),
        authorId: user.id,
        authorNickname: user.nickname,
        authorAvatar: user.avatar
      });
    };

  return (
    <CardContent className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="mainCategory" className="text-muted-foreground flex items-center mb-2"><LayoutPanelLeft className="h-4 w-4 mr-2 text-primary" />게시판 선택</Label>
            <Select value={selectedMainCategory} onValueChange={handleMainCategoryChange}>
              <SelectTrigger id="mainCategory" className="w-full bg-input border-border text-foreground focus:ring-accent"><SelectValue placeholder="게시판을 선택하세요" /></SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {mainCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postType" className="text-muted-foreground flex items-center mb-2"><ListFilter className="h-4 w-4 mr-2 text-primary" />글 종류 선택</Label>
            <Select value={selectedPostType} onValueChange={(value) => setSelectedPostType(value as PostType)} disabled={!selectedMainCategory || availablePostTypes.length === 0}>
              <SelectTrigger id="postType" className="w-full bg-input border-border text-foreground focus:ring-accent"><SelectValue placeholder={selectedMainCategory ? "글 종류를 선택하세요" : "게시판을 먼저 선택하세요"} /></SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {availablePostTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="title" className="text-muted-foreground flex items-center mb-2"><PenLine className="h-4 w-4 mr-2 text-primary" />제목</Label>
          <Input id="title" type="text" placeholder="게시글 제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} required className="text-lg bg-input border-border text-foreground focus:ring-accent"/>
        </div>
        <div>
          <Label htmlFor="content" className="text-muted-foreground flex items-center mb-2"><PenLine className="h-4 w-4 mr-2 text-primary" />본문 내용</Label>
          <div className="mb-2 p-2 border border-input rounded-md bg-background flex gap-1 flex-wrap">
              <Button variant="outline" size="icon" type="button" title="Bold" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" type="button" title="Italic" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" type="button" title="Strikethrough" className="h-8 w-8"><Strikethrough className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" type="button" title="Add Image" className="h-8 w-8"><ImageIcon className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" type="button" title="Add Video" className="h-8 w-8"><Video className="h-4 w-4" /></Button>
          </div>
          <Textarea id="content" placeholder="게시글 내용을 작성해주세요." value={content} onChange={(e) => setContent(e.target.value)} required className="min-h-[250px] text-base bg-input border-border text-foreground focus:ring-accent" rows={10}/>
        </div>
        <CardFooter className="p-0 pt-4 flex justify-end">
          <Button type="submit" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md text-base px-6 py-3" disabled={isLoading}>
            {isLoading ? '처리 중...' : <><Send className="mr-2 h-4 w-4" /> {submitButtonText}</>}
          </Button>
        </CardFooter>
      </form>
    </CardContent>
  );
}
