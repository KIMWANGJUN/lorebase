"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const TavernSearch = dynamic(
  () => import('@/components/shared/TavernSearch'),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-10 w-full max-w-md" /> 
  }
);

interface DynamicTavernSearchProps {
  initialSearchTerm: string;
}

export default function DynamicTavernSearch({ initialSearchTerm }: DynamicTavernSearchProps) {
  return <TavernSearch initialSearchTerm={initialSearchTerm} />;
}
