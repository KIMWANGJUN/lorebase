
// src/components/shared/NicknameDisplay.tsx
"use client";
import type { User, PostMainCategory } from '@/types';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/overlay/dropdown-menu";
import { Button } from '@/components/ui/form/button';
import {
  MessageSquare, User as UserIcon, ShieldAlert, Ban, Box, AppWindow, PenTool, LayoutGrid, ShieldCheck
} from 'lucide-react';

// This data was in mockData.ts, it's better to have it here or in a config file.
const tetrisTitles: { [key: number]: string } = {
    1: "테트리스 신",
    2: "테트리스 고수",
    3: "테트리스 중수",
};

interface NicknameDisplayProps {
  user: User;
  context?: 'postAuthor' | 'commentAuthor' | 'rankingList' | 'sidebarRanking' | 'header' | 'profileCard';
  activeCategory?: PostMainCategory; 
  postMainCategoryForAuthor?: PostMainCategory;
}

const CategoryIcon: React.FC<{ category: PostMainCategory; className?: string }> = ({ category, className }) => {
    const defaultClassName = "h-3.5 w-3.5 shrink-0";
     const iconColorClass =
      category === 'Unity' ? 'icon-unity' :
      category === 'Unreal' ? 'icon-unreal' :
      category === 'Godot' ? 'icon-godot' :
      'icon-general';
  
    switch (category) {
      case 'Unity': return <Box className={cn(defaultClassName, iconColorClass, className)} />;
      case 'Unreal': return <AppWindow className={cn(defaultClassName, iconColorClass, className)} />;
      case 'Godot': return <PenTool className={cn(defaultClassName, iconColorClass, className)} />;
      case 'General': return <LayoutGrid className={cn(defaultClassName, iconColorClass, className)} />;
      default: return null;
    }
  };
  
  const getCategoryDisplayName = (category: PostMainCategory): string => {
    switch (category) {
      case 'Unity': return 'Unity';
      case 'Unreal': return 'Unreal';
      case 'Godot': return 'Godot';
      case 'General': return '일반&유머';
      default: return category;
    }
  };

  export default function NicknameDisplay({ user, context, activeCategory, postMainCategoryForAuthor }: NicknameDisplayProps) {
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const isCurrentUser = currentUser?.id === user?.id;

    const displayInfo = useMemo(() => {
        const baseNicknameClass = "text-sm font-medium"; 
        const baseTitleClass = "title-text-base"; 
    
        let titleText: string | null = null;
        let titleClasses: string = "";
        let nicknameClasses: string = cn(baseNicknameClass, "text-foreground"); 
        let wrapperClasses: string = "";
        let showLogoCategory: PostMainCategory | null = null;
    
        if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: "Unknown User", isAdmin: false };
    
        if (user.isAdmin) {
            return {
            titleText: null, 
            titleClasses: "", 
            nicknameClasses: cn(baseNicknameClass, "admin-text", "font-bold"), 
            wrapperClasses: "admin-badge", 
            showLogoCategory: null, 
            nickname: user.nickname, 
            isAdmin: true,
            };
        }
        
        const { selectedTitleIdentifier, selectedNicknameEffectIdentifier, selectedLogoIdentifier } = user;
        
        // Use new Title logic
        if (selectedTitleIdentifier && selectedTitleIdentifier !== 'none') {
            const [type, rank] = selectedTitleIdentifier.split('-');
            titleText = `${rank} ${type}`;
        }

        // Apply effects
        if (selectedNicknameEffectIdentifier && selectedNicknameEffectIdentifier !== 'none') {
            const [tier, effect] = selectedNicknameEffectIdentifier.split('-');
            nicknameClasses = cn(baseNicknameClass, `effect-${tier}-${effect}`);
        }

        if (selectedLogoIdentifier && selectedLogoIdentifier !== 'none') {
            // Logic for logos if any
        }
        
        if (context === 'header' || context === 'profileCard') {
            wrapperClasses = ""; 
            if(context === 'header') {
              titleText = null; titleClasses = ""; 
              showLogoCategory = null; 
            }
        }
        if (!titleText) titleClasses = "";
    
        return { 
            titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, 
            nickname: user.nickname, isAdmin: false 
        };
    }, [user, activeCategory, postMainCategoryForAuthor, context]);
  
    const finalWrapperClasses = cn(
      "inline-flex flex-col items-center leading-tight",
      displayInfo.wrapperClasses,
      context === 'header' && "header-text-clear"
    );
  
    const finalNicknameContainerClasses = cn(
      "flex items-center", 
      displayInfo.showLogoCategory ? "gap-1" : "",
      context === 'header' && "header-text-clear"
    );
  
    const NicknameComponent = (
        <div className={finalWrapperClasses}>
            {displayInfo.titleText && (
                <span className={cn("title-on-nickname-wrapper", context === 'header' && "header-text-clear")}> 
                    <span className={cn(displayInfo.titleClasses, context === 'header' && "header-text-clear")}>
                        {displayInfo.titleText}
                    </span>
                </span>
            )}
            <div className={finalNicknameContainerClasses}> 
                {displayInfo.showLogoCategory && <CategoryIcon category={displayInfo.showLogoCategory} className={cn("h-3.5 w-3.5", context === 'header' && "header-text-clear")} />}
                <span className={cn(displayInfo.nicknameClasses, context === 'header' && "header-text-clear")}> 
                    {displayInfo.nickname}
                </span>
            </div>
        </div>
    );
    
    if (isCurrentUser || !currentUser || context === 'profileCard') {
      return NicknameComponent;
    }

    const handleReport = () => {
        const reportTitle = `${user.nickname} 유저 신고`;
        router.push(`/inquiry?category=user-report&title=${encodeURIComponent(reportTitle)}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="link" className="p-0 h-auto hover:bg-accent/50 rounded-md">
                    {NicknameComponent}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => router.push(`/whisper/new?to=${user.nickname}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>귓속말 보내기</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>프로필 보기</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleReport} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>신고하기</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('차단 기능은 현재 준비중입니다.')} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Ban className="mr-2 h-4 w-4" />
                    <span>차단하기</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }
