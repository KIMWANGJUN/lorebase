
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Users, Store, ShieldCheck, Wand2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatarDropdown from '@/components/shared/UserAvatarDropdown';
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton';
import LoginModal from '@/components/Auth/LoginModal';

const navItems = [
  { href: '/game-workshop', label: '게임 공방', icon: Store },
  { href: '/tavern', label: '선술집', icon: Users },
  { href: '/free-assets', label: '무료 에셋', icon: Gamepad2 },
];

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Group */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <Wand2 className="h-7 w-7 text-primary group-hover:text-accent transition-colors duration-300" />
              <h1 className="font-logo text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">LOREBASE</h1>
            </Link>
          </div>

          {/* Nav Items Group */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent font-headline text-lg hover:font-bold active:font-bold"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-destructive/80 transition-colors hover:text-destructive font-headline text-lg hover:font-bold active:font-bold"
              >
                <ShieldCheck className="h-4 w-4" />
                관리자
              </Link>
            )}
          </nav>

          {/* User Actions Group */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <ThemeToggleButton />
            {user ? (
              <UserAvatarDropdown user={user} isAdmin={isAdmin} onLogout={logout} />
            ) : (
              <Button
                variant="ghost"
                className="text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} /> {/* LoginModal is a sibling to header, within the fragment */}
    </>
  );
}
