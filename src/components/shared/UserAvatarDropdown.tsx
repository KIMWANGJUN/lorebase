
// src/components/shared/UserAvatarDropdown.tsx
"use client";
import type { User } from '@/types';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, UserCircle, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import NicknameDisplay from './NicknameDisplay'; // Import NicknameDisplay

interface UserAvatarDropdownProps {
  user: User;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function UserAvatarDropdown({ user, isAdmin, onLogout }: UserAvatarDropdownProps) {
  const getInitials = (name: string) => {
    return name.substring(0, 1).toUpperCase(); // Changed to 1 initial for consistency
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary hover:text-foreground transition-colors p-1">
          <Avatar className="h-9 w-9 border-2 border-accent/50">
            <AvatarImage src={user.avatar} alt={user.nickname} data-ai-hint="user avatar icon"/>
            <AvatarFallback className="bg-muted text-muted-foreground">{getInitials(user.nickname)}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:inline">
            <NicknameDisplay user={user} context="header" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground shadow-xl">
        <DropdownMenuLabel>
          <div className="font-medium text-foreground">{user.nickname}</div>
          {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50"/>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center text-popover-foreground">
            <UserCircle className="mr-2 h-4 w-4" />
            내 프로필
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center text-destructive/90 hover:text-destructive">
              <ShieldCheck className="mr-2 h-4 w-4" />
              관리자 페이지
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-border/50"/>
        <DropdownMenuItem onClick={onLogout} className="flex items-center cursor-pointer text-popover-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
