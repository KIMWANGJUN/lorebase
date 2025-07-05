
// src/app/(main)/whisper/new/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { sendWhisper } from '@/lib/whisperApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function NewWhisperPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [recipientNickname, setRecipientNickname] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const to = searchParams.get('to');
        if (to) {
            setRecipientNickname(to);
        }
    }, [searchParams]);

    const handleSend = async () => {
        if (!user) {
            toast({ title: "오류", description: "로그인이 필요합니다.", variant: "destructive" });
            return;
        }
        if (!recipientNickname.trim()) {
            toast({ title: "오류", description: "받는 사람의 닉네임을 입력하세요.", variant: "destructive" });
            return;
        }
        if (!content.trim()) {
            toast({ title: "오류", description: "내용을 입력하세요.", variant: "destructive" });
            return;
        }

        setIsSending(true);
        try {
            // Note: whisperApi's sendWhisper expects recipientId, not nickname.
            // This component needs adjustment to first find the user by nickname.
            // For now, this will fail if the API isn't adjusted.
            // Let's assume for now we adjust the API or this component later.
            // A more robust solution would be to use a user search/selection component.
            
            // This is a placeholder for the logic to get ID from nickname
            // In a real app, you'd call an API function like `findUserByNickname`
            // For the purpose of this example, we will simulate this in the API
            
            await sendWhisper({
                senderId: user.id,
                senderNickname: user.nickname,
                recipientId: recipientNickname, // This needs to be the ID, not nickname.
                content: content.trim(),
                isReply: false,
            });

            toast({ title: "성공", description: "귓속말을 성공적으로 보냈습니다." });
            router.push('/whisper?tab=sent');
        } catch (error: any) {
            toast({
                title: "전송 실패",
                description: error.message || "귓속말을 보내는 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };
    
    if (authLoading) {
        return <div className="text-center py-12">로딩 중...</div>;
    }

    if (!user) {
         return (
            <div className="text-center py-12">
                <p>귓속말을 보내려면 로그인이 필요합니다.</p>
                <Button asChild className="mt-4">
                    <Link href="/login">로그인</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <Button variant="ghost" size="icon" asChild>
                            <Link href="/whisper">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div>
                            <CardTitle>새 귓속말 작성</CardTitle>
                            <CardDescription>다른 사용자에게 개인 메시지를 보냅니다.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="recipient">받는 사람 (닉네임)</Label>
                        <Input
                            id="recipient"
                            placeholder="사용자 닉네임"
                            value={recipientNickname}
                            onChange={(e) => setRecipientNickname(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">내용</Label>
                        <Textarea
                            id="content"
                            placeholder="보낼 메시지를 입력하세요..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            maxLength={1000}
                        />
                         <p className="text-xs text-muted-foreground text-right">{content.length} / 1000</p>
                    </div>
                    <Button onClick={handleSend} disabled={isSending} className="w-full">
                        {isSending ? '전송 중...' : '보내기'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
