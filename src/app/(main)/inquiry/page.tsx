
// src/app/(main)/inquiry/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Input } from '@/components/ui/form/input';
import { Textarea } from '@/components/ui/form/textarea';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { useToast } from '@/hooks/use-toast';
import type { Inquiry, InquiryCategory } from '@/types';
import { addInquiry, getInquiriesByUser } from '@/lib/inquiryApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/layout/accordion';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import { Timestamp } from 'firebase/firestore';

export default function InquiryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<InquiryCategory>('account');
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlTitle = searchParams.get('title');
    const urlCategory = searchParams.get('category') as InquiryCategory;
    if (urlTitle) setTitle(urlTitle);
    if (urlCategory) setCategory(urlCategory);
    
    if (user) {
      getInquiriesByUser(user.id).then(setUserInquiries);
    }
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "오류", description: "문의를 제출하려면 로그인이 필요합니다.", variant: "destructive" });
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({ title: "오류", description: "제목과 내용을 모두 입력해주세요.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addInquiry({
        userId: user.id,
        userNickname: user.nickname,
        title,
        content,
        category,
        status: 'Pending', // Add the missing status property
      });
      toast({ title: "성공", description: "문의가 성공적으로 제출되었습니다." });
      setTitle('');
      setContent('');
      getInquiriesByUser(user.id).then(setUserInquiries);
    } catch (error) {
      toast({ title: "오류", description: "문의 제출에 실패했습니다.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card>
          <CardHeader>
            <CardTitle>문의하기</CardTitle>
            <CardDescription>궁금한 점이나 불편한 점을 알려주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">문의 유형</Label>
                <Select value={category} onValueChange={(value: InquiryCategory) => setCategory(value)}>
                  <SelectTrigger id="category"><SelectValue placeholder="유형 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">계정 관련</SelectItem>
                    <SelectItem value="payment">결제 관련</SelectItem>
                    <SelectItem value="technical">기술 지원</SelectItem>
                    <SelectItem value="user-report">사용자 신고</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="문의 제목을 입력하세요." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="문의 내용을 자세하게 입력해주세요." rows={8} />
              </div>
              <Button type="submit" disabled={isSubmitting || !user} className="w-full">
                {isSubmitting ? '제출 중...' : '문의 제출'}
              </Button>
               {!user && <p className="text-sm text-center text-destructive">로그인 후 문의를 제출할 수 있습니다.</p>}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>내 문의 내역</CardTitle>
            <CardDescription>이전에 제출한 문의와 답변을 확인할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              userInquiries.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {userInquiries.map(inquiry => (
                    <AccordionItem key={inquiry.id} value={inquiry.id}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                          <span>{inquiry.title}</span>
                          <span className={inquiry.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}>{inquiry.status}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-muted/50 rounded-md">
                        <p className="font-semibold">내 문의 내용:</p>
                        <p className="mb-4 whitespace-pre-wrap">{inquiry.content}</p>
                        {inquiry.createdAt instanceof Timestamp && <p className="text-xs text-muted-foreground">문의 일자: <FormattedDateDisplay date={inquiry.createdAt.toDate()} /></p>}
                        
                        {inquiry.reply && (
                          <div className="mt-4 pt-4 border-t">
                             <p className="font-semibold text-primary">관리자 답변:</p>
                             <p className="mb-2 whitespace-pre-wrap">{inquiry.reply}</p>
                             {inquiry.repliedAt instanceof Timestamp && <p className="text-xs text-muted-foreground">답변 일자: <FormattedDateDisplay date={inquiry.repliedAt.toDate()} /></p>}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : <p className="text-center text-muted-foreground py-8">아직 제출한 문의가 없습니다.</p>
            ) : <p className="text-center text-muted-foreground py-8">문의 내역을 보려면 로그인하세요.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
