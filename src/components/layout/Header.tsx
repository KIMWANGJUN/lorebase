// src/components/layout/Header.tsx
"use client";
import Link from 'next/link';
import { Gamepad2, Home, Users, Store, UserCircle, LogIn, LogOut, ShieldCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatarDropdown from '@/components/shared/UserAvatarDropdown';
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/game-workshop', label: '게임 공방', icon: Store },
  { href: '/tavern', label: '선술집', icon: Users },
  { href: '/free-assets', label: '무료 에셋', icon: Gamepad2 },
];

export default function Header() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold font-headline text-foreground">인디 커뮤니티</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 text-destructive transition-colors hover:text-destructive/80">
              <ShieldCheck className="h-4 w-4" />
              관리자
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          {user ? (
            <UserAvatarDropdown user={user} isAdmin={isAdmin} onLogout={logout} />
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
