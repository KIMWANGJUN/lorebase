
// src/components/shared/MiniPostList.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
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
          {otherPosts.slice(0, 5).map(op => (
            <li key={op.id} className="flex justify-between items-center text-sm">
              <Link href={`/tavern/${op.id}`} className="hover:underline">
                {op.title}
              </Link>
              <div className="text-xs text-gray-500">
                <FormattedDateDisplay date={op.createdAt} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default MiniPostList;
