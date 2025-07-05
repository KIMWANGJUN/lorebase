
// src/app/(main)/whisper/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getWhispersByUser } from '@/lib/whisperApi';
import type { Whisper } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import CreateButton from '@/components/shared/CreateButton';
import { MailPlus, Inbox, Send, Reply, Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

function WhisperListItem({ whisper }: { whisper: Whisper }) {
  const { user } = useAuth();
  const isRead = !!whisper.readAt;
  
  const isSentByMe = whisper.senderId === user?.id;
  const partnerNickname = isSentByMe ? whisper.recipientNickname : whisper.senderNickname;

  return (
    <Link href={`/whisper/${whisper.id}`} passHref>
      <div className={`block border-b p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!isRead && !isSentByMe ? 'font-bold bg-primary/5' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10"><AvatarFallback>{partnerNickname?.charAt(0) || '?'}</AvatarFallback></Avatar>
            <div>
              <p className={`text-sm ${!isRead && !isSentByMe ? 'text-primary' : 'text-foreground'}`}>
                {isSentByMe ? `To: ${partnerNickname}` : `From: ${partnerNickname}`}
              </p>
              <p className={`text-xs truncate max-w-xs md:max-w-md ${!isRead && !isSentByMe ? 'text-muted-foreground font-semibold' : 'text-muted-foreground'}`}>
                {whisper.content}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            {whisper.createdAt instanceof Timestamp && <FormattedDateDisplay date={whisper.createdAt.toDate()} />}
            {whisper.isReply && <Reply className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />}
          </div>
        </div>
      </div>
    </Link>
  );
}

function WhisperContent() {
    const { user, loading: authLoading } = useAuth();
    const [whispers, setWhispers] = useState<{ received: Whisper[]; sent: Whisper[] }>({ received: [], sent: [] });
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'received';

    useEffect(() => {
        if (user) {
            setLoading(true);
            getWhispersByUser(user.id).then(setWhispers).finally(() => setLoading(false));
        }
    }, [user]);

    if (authLoading || loading) {
        return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!user) {
         return (
            <div className="text-center py-12">
                <p>귓속말을 보거나 보내려면 로그인이 필요합니다.</p>
                <Button asChild className="mt-4"><Link href="/login">로그인</Link></Button>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>귓속말</CardTitle>
                    <CardDescription>다른 사용자와 주고받은 개인 메시지입니다.</CardDescription>
                </div>
                <CreateButton href="/whisper/new" text="새 귓속말 작성" icon={MailPlus} />
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={defaultTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="received"><Inbox className="mr-2 h-4 w-4" />받은 편지함 ({whispers.received.length})</TabsTrigger>
                        <TabsTrigger value="sent"><Send className="mr-2 h-4 w-4" />보낸 편지함 ({whispers.sent.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="received" className="mt-4">
                        {whispers.received.length > 0 ? (
                            whispers.received.map(w => <WhisperListItem key={w.id} whisper={w} />)
                        ) : <p className="text-center text-muted-foreground py-8">받은 귓속말이 없습니다.</p>}
                    </TabsContent>
                    <TabsContent value="sent" className="mt-4">
                        {whispers.sent.length > 0 ? (
                            whispers.sent.map(w => <WhisperListItem key={w.id} whisper={w} />)
                        ) : <p className="text-center text-muted-foreground py-8">보낸 귓속말이 없습니다.</p>}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default function WhisperPage() {
    return (
        <div className="container mx-auto py-8">
            <Suspense fallback={<div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <WhisperContent />
            </Suspense>
        </div>
    );
}
