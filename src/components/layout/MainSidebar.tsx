// src/components/layout/MainSidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, Package, User, MessageSquare, 
  GamepadIcon, Trophy, Settings, HelpCircle,
  Flame, Star, TrendingUp
} from 'lucide-react';

const MainSidebar = () => {
  const pathname = usePathname();

  const mainMenuItems = [
    { 
      href: '/community/channels/general', 
      label: '커뮤니티', 
      icon: Users,
      active: pathname.startsWith('/community')
    },
    { 
      href: '/free-assets', 
      label: '무료 에셋', 
      icon: Package,
      active: pathname === '/free-assets'
    },
    { 
      href: '/whisper', 
      label: '위스퍼', 
      icon: MessageSquare,
      active: pathname.startsWith('/whisper')
    },
    { 
      href: '/profile', 
      label: '프로필', 
      icon: User,
      active: pathname === '/profile'
    }
  ];

  const gameMenuItems = [
    { 
      href: '/games/tetris', 
      label: '테트리스', 
      icon: GamepadIcon,
      active: pathname.startsWith('/games/tetris')
    },
    { 
      href: '/rankings', 
      label: '랭킹', 
      icon: Trophy,
      active: pathname === '/rankings'
    }
  ];

  const quickLinks = [
    { href: '/trending', label: '인기 게시물', icon: Flame },
    { href: '/featured', label: '특집', icon: Star },
    { href: '/latest', label: '최신', icon: TrendingUp }
  ];

  return (
    <aside className="hidden w-64 flex-shrink-0 lg:block">
      <div className="sticky top-20 space-y-4">
        {/* 메인 메뉴 */}
        <Card className="watercolor-card">
          <CardContent className="p-4">
            <h3 className="font-semibold text-watercolor-text mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-watercolor-primary" />
              메인 메뉴
            </h3>
            <nav className="space-y-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active
                        ? 'bg-watercolor-primary/20 text-watercolor-primary border border-watercolor-primary/30'
                        : 'text-watercolor-muted hover:text-watercolor-text hover:bg-watercolor-surface'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* 게임 메뉴 */}
        <Card className="watercolor-card">
          <CardContent className="p-4">
            <h3 className="font-semibold text-watercolor-text mb-3 flex items-center gap-2">
              <GamepadIcon className="h-4 w-4 text-watercolor-secondary" />
              게임
            </h3>
            <nav className="space-y-1">
              {gameMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active
                        ? 'bg-watercolor-secondary/20 text-watercolor-secondary border border-watercolor-secondary/30'
                        : 'text-watercolor-muted hover:text-watercolor-text hover:bg-watercolor-surface'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* 빠른 링크 */}
        <Card className="watercolor-card">
          <CardContent className="p-4">
            <h3 className="font-semibold text-watercolor-text mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-watercolor-accent" />
              빠른 링크
            </h3>
            <nav className="space-y-1">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-watercolor-muted hover:text-watercolor-text hover:bg-watercolor-surface transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* 설정 및 도움말 */}
        <Card className="watercolor-card">
          <CardContent className="p-4">
            <nav className="space-y-1">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-watercolor-muted hover:text-watercolor-text hover:bg-watercolor-surface transition-colors"
              >
                <Settings className="h-4 w-4" />
                설정
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-watercolor-muted hover:text-watercolor-text hover:bg-watercolor-surface transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                도움말
              </Link>
            </nav>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default MainSidebar;
