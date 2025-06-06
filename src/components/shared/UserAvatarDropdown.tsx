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

interface UserAvatarDropdownProps {
  user: User;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function UserAvatarDropdown({ user, isAdmin, onLogout }: UserAvatarDropdownProps) {
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.nickname} />
            <AvatarFallback>{getInitials(user.nickname)}</AvatarFallback>
          </Avatar>
           <span className={cn("text-sm font-medium hidden sm:inline", isAdmin && "text-admin")}>{user.nickname}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-medium">{user.nickname}</div>
          {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            내 프로필
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center"> // Settings page not requested yet
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Link>
        </DropdownMenuItem> */}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center text-destructive">
              <ShieldCheck className="mr-2 h-4 w-4" />
              관리자 페이지
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="flex items-center cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
