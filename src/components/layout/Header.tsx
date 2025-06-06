// src/components/layout/Header.tsx
"use client";
import Link from 'next/link';
import { Gamepad2, Home, Users, Store, UserCircle, LogIn, LogOut, ShieldCheck, Settings, Wand2 } from 'lucide-react'; // Added Wand2 for fantasy feel
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatarDropdown from '@/components/shared/UserAvatarDropdown';
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/game-workshop', label: '게임 공방', icon: Store },
  { href: '/tavern', label: '선술집', icon: Users },
  { href: '/free-assets', label: '무료 에셋', icon: Gamepad2 }, // Kept Gamepad2 as it's specific
];

export default function Header() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Wand2 className="h-7 w-7 text-primary group-hover:text-accent transition-colors duration-300" />
          <h1 className="text-xl font-bold font-headline text-foreground group-hover:text-primary transition-colors duration-300">인디 커뮤니티</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 text-destructive/80 transition-colors hover:text-destructive">
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
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-accent">
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
