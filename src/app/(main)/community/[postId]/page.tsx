
// src/app/(main)/tavern/[postId]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/form/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/data-display/avatar";
import type { Post, Comment } from '@/types';
import CommentSection from '@/components/shared/CommentSection';
import { getPost } from '@/lib/postApi';
import { getComments } from '@/lib/commentApi';
import FormattedDateDisplay from '@/components/shared/FormattedDateDisplay';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import NicknameDisplay from '@/components/shared/NicknameDisplay';
import { getChannelByCategory } from '@/lib/communityChannels';

export default function PostPage() {
    const { postId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof postId === 'string') {
            const fetchData = async () => {
                try {
                    const fetchedPost = await getPost(postId);
                    if (fetchedPost) {
                        setPost(fetchedPost);
                        const fetchedComments = await getComments(postId);
                        setComments(fetchedComments);
                    } else {
                        router.push('/404');
                    }
                } catch (error) {
                    console.error("Failed to fetch post or comments:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [postId, router]);

    const handleCommentAdded = (newComment: Comment) => {
        setComments(prevComments => [...prevComments, newComment]);
    };

    if (loading) {
        return <div className="container mx-auto py-8 text-center">게시글을 불러오는 중...</div>;
    }

    if (!post) {
        return <div className="container mx-auto py-8 text-center">게시글을 찾을 수 없습니다.</div>;
    }

    const isAuthor = user && post && user.id === post.author.id;
    const channelSlug = getChannelByCategory(post.mainCategory)?.slug || 'general';

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={post.author.avatar} alt={post.author.nickname} />
                                <AvatarFallback>{post.author.nickname.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <NicknameDisplay user={post.author} context="postAuthor" />
                        </div>
                        {post.createdAt instanceof Timestamp && <FormattedDateDisplay date={post.createdAt.toDate()} />}
                        <span>조회수 {post.views}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                    {isAuthor && (
                         <div className="mt-4 text-right">
                            <Link href={`/community/${channelSlug}/${post.id}/edit`}>
                                <Button variant="outline">수정</Button>
                            </Link>
                         </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8">
                <CommentSection postId={post.id} initialComments={comments} />
            </div>
        </div>
    );
}
