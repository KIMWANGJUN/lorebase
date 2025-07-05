
// src/components/shared/CreateButton.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface CreateButtonProps {
  href: string;
  text: string;
  icon: LucideIcon;
}

const CreateButton = ({ href, text, icon: Icon }: CreateButtonProps) => {
  return (
    <Link href={href} passHref>
      <Button className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md text-sm font-headline flex-shrink-0">
        <Icon className="mr-2 h-5 w-5" />
        {text}
      </Button>
    </Link>
  );
};

export default CreateButton;
