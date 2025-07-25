"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/data-display/skeleton';

const CommunitySearch = dynamic(
  () => import('@/components/shared/CommunitySearch'),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-10 w-full max-w-md" /> 
  }
);

interface DynamicCommunitySearchProps {
  initialSearchTerm: string;
}

export default function DynamicCommunitySearch({ initialSearchTerm }: DynamicCommunitySearchProps) {
  return <CommunitySearch initialSearchTerm={initialSearchTerm} />;
}
