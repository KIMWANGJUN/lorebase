import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Post, PostMainCategory } from '@/types';
import FormattedDateDisplay from './FormattedDateDisplay';
import { toDate } from '@/lib/dateUtils';

interface MiniPostListProps {
  title: string;
  posts: Post[];
  category: PostMainCategory;
}

const MiniPostList: React.FC<MiniPostListProps> = ({ title, posts, category }) => {
  const sortedPosts = (posts: Post[]): Post[] => {
    // Use toDate to convert Timestamp/FieldValue to Date for sorting
    return posts.sort((a, b) => {
      const dateA = toDate(a.createdAt);
      const dateB = toDate(b.createdAt);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  };

  const otherPosts = sortedPosts(posts.filter(p => p.mainCategory === category));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {otherPosts.slice(0, 5).map(op => {
            // 안전하게 Date로 변환
            const postDate = toDate(op.createdAt);
            
            return (
              <li key={op.id} className="flex justify-between items-center text-sm">
                <Link 
                  href={`/community/posts/${op.id}`} 
                  className="hover:underline truncate flex-1 mr-2"
                >
                  {op.title}
                </Link>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {postDate ? (
                    <FormattedDateDisplay date={postDate} />
                  ) : (
                    <span>날짜 없음</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {otherPosts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            게시글이 없습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniPostList;
