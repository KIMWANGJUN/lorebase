
// src/components/shared/NicknameDisplay.tsx
"use client";

import type { User, PostMainCategory, AchievedRankType } from '@/types';
import { mockUsers, tetrisTitles } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { Box, AppWindow, PenTool, LayoutGrid, ShieldCheck } from 'lucide-react';

interface NicknameDisplayProps {
  user: User;
  context?: 'postAuthor' | 'commentAuthor' | 'rankingList' | 'sidebarRanking' | 'header'; // Context where it's displayed
  activeCategory?: PostMainCategory; // Relevant for category-specific views
  postMainCategoryForAuthor?: PostMainCategory; // For post/comment author context
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
  const displayInfo = useMemo(() => {
    let titleText: string | null = null;
    let titleClasses: string = "title-text-base";
    let nicknameClasses: string = "text-sm font-medium text-foreground"; // Default
    let wrapperClasses: string = "";
    let showLogo: PostMainCategory | null = null;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogo, nickname: "Unknown User" };

    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null,
        titleClasses: "",
        nicknameClasses: "admin-text text-sm", // Uses .admin-text from globals.css
        wrapperClasses: "admin-badge", // Uses .admin-badge from globals.css
        showLogo: null,
        nickname: user.nickname,
        isAdmin: true,
      };
    }

    const selectedRank = user.selectedDisplayRank || 'default';
    let appliedStyle = false;

    const applyStyles = (type: 'global' | 'tetris' | 'category', rank: number, categoryName?: PostMainCategory) => {
      appliedStyle = true;
      if (type === 'global') {
        if (rank === 1) { titleClasses = "title-text-base text-gradient-gold"; nicknameClasses = "text-sm text-gradient-gold"; wrapperClasses = "bg-wrapper-gold"; }
        else if (rank === 2) { titleClasses = "title-text-base text-gradient-silver"; nicknameClasses = "text-sm text-gradient-silver"; wrapperClasses = "bg-wrapper-silver"; }
        else if (rank === 3) { titleClasses = "title-text-base text-gradient-bronze"; nicknameClasses = "text-sm text-gradient-bronze"; wrapperClasses = "bg-wrapper-bronze"; }
      } else if (type === 'tetris') {
        titleText = tetrisTitles[rank] || null;
        if (rank === 1) { titleClasses = "title-text-base text-gradient-gold"; nicknameClasses = "text-sm text-gradient-gold"; }
        else if (rank === 2) { titleClasses = "title-text-base text-gradient-silver"; nicknameClasses = "text-sm text-gradient-silver"; }
        else if (rank === 3) { titleClasses = "title-text-base text-gradient-bronze"; nicknameClasses = "text-sm text-gradient-bronze"; }
        // No wrapper for tetris
      } else if (type === 'category' && categoryName) {
        const catRank = user.categoryStats?.[categoryName]?.rankInCate;
        if (catRank) {
          showLogo = categoryName;
          if (catRank >= 1 && catRank <= 3) {
            titleText = getCategoryDisplayName(categoryName);
            if (catRank === 1) { titleClasses = "title-text-base text-gradient-gold"; }
            else if (catRank === 2) { titleClasses = "title-text-base text-gradient-silver"; }
            else if (catRank === 3) { titleClasses = "title-text-base text-gradient-bronze"; }
          }
          // Category specific gradients for nickname and wrapper (1-10)
          if (catRank >= 1 && catRank <= 10) {
            if (categoryName === 'Unity') { nicknameClasses = "text-sm text-gradient-unity"; wrapperClasses = "bg-wrapper-unity"; }
            else if (categoryName === 'Unreal') { nicknameClasses = "text-sm text-gradient-unreal"; wrapperClasses = "bg-wrapper-unreal"; }
            else if (categoryName === 'Godot') { nicknameClasses = "text-sm text-gradient-godot"; wrapperClasses = "bg-wrapper-godot"; }
            else if (categoryName === 'General') { nicknameClasses = "text-sm text-gradient-general-rainbow"; wrapperClasses = "bg-wrapper-general-rainbow"; }
          } else if (catRank >= 11 && catRank <= 20) { // Only text gradient for 11-20
            if (categoryName === 'Unity') { nicknameClasses = "text-sm text-gradient-unity"; }
            else if (categoryName === 'Unreal') { nicknameClasses = "text-sm text-gradient-unreal"; }
            else if (categoryName === 'Godot') { nicknameClasses = "text-sm text-gradient-godot"; }
            else if (categoryName === 'General') { nicknameClasses = "text-sm text-gradient-general-rainbow"; }
            wrapperClasses = ""; // No wrapper for 11-20
          }
        }
      }
    };
    
    // 1. Apply selected rank if valid and achieved
    if (selectedRank !== 'default') {
      if (selectedRank.startsWith('global_') && user.rank === parseInt(selectedRank.split('_')[1])) {
        applyStyles('global', user.rank);
      } else if (selectedRank.startsWith('tetris_') && user.tetrisRank && user.tetrisRank === parseInt(selectedRank.split('_')[1])) {
        applyStyles('tetris', user.tetrisRank);
      } else if (selectedRank.startsWith('category_')) {
        const parts = selectedRank.split('_');
        const cat = parts[1] as PostMainCategory;
        const tier = parts[2]; // "1-3", "4-10", "11-20"
        const userCatRank = user.categoryStats?.[cat]?.rankInCate;
        if (userCatRank) {
          if ((tier === "1-3" && userCatRank >= 1 && userCatRank <= 3) ||
              (tier === "4-10" && userCatRank >= 4 && userCatRank <= 10) ||
              (tier === "11-20" && userCatRank >= 11 && userCatRank <= 20)) {
            applyStyles('category', userCatRank, cat);
          }
        }
      }
    }

    // 2. Default priority if no selected rank applied or 'default' is chosen
    if (!appliedStyle) {
      if (user.rank > 0 && user.rank <= 3) {
        applyStyles('global', user.rank);
      } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) {
        applyStyles('tetris', user.tetrisRank);
      } else {
        // Determine primary category for styling if not global/tetris top
        const categoryToConsider = activeCategory || postMainCategoryForAuthor;
        if (categoryToConsider) {
            const catRank = user.categoryStats?.[categoryToConsider]?.rankInCate;
            if (catRank && catRank > 0 && catRank <= 20) {
                 applyStyles('category', catRank, categoryToConsider);
            }
        }
        // If still no style, look for any other best category rank
        if (!appliedStyle) {
            let bestCatRank = Infinity;
            let bestCat: PostMainCategory | null = null;
            (['Unity', 'Unreal', 'Godot', 'General'] as PostMainCategory[]).forEach(cKey => {
                const r = user.categoryStats?.[cKey]?.rankInCate;
                if (r && r > 0 && r <= 20 && r < bestCatRank) {
                    bestCatRank = r;
                    bestCat = cKey;
                }
            });
            if (bestCat) {
                applyStyles('category', bestCatRank, bestCat);
            }
        }
      }
    }
    
    // Header context specific simplification for UserAvatarDropdown
    if (context === 'header') {
        wrapperClasses = ""; // No wrapper in header
        // Use simpler text color if complex gradients are too much for header
        if (nicknameClasses.includes("gradient")) {
            // Potentially simplify for header e.g., just use primary color or a rank color
             if (user.rank > 0 && user.rank <=3) nicknameClasses = user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-slate-400" : "text-orange-400";
             else nicknameClasses = "text-foreground";
             nicknameClasses += " text-sm font-medium";

        }
        titleText = null; // No title in header
        showLogo = null; // No logo in header
    }


    return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogo, nickname: user.nickname, isAdmin: false };
  }, [user, selectedRank, activeCategory, postMainCategoryForAuthor, context]);

  if (displayInfo.isAdmin) {
    return (
      <span className={cn(displayInfo.wrapperClasses, "inline-flex items-center gap-1")}>
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className={displayInfo.nicknameClasses}>{displayInfo.nickname}</span>
      </span>
    );
  }
  
  const finalWrapperClasses = cn(
    "inline-flex flex-col items-start leading-tight", // Base for vertical alignment
    displayInfo.wrapperClasses // This will add padding and background if present
  );

  const finalNicknameContainerClasses = cn(
    "flex items-center",
    displayInfo.showLogo ? "gap-1" : "" // Add gap if logo is present
  );

  return (
    <div className={finalWrapperClasses}>
      {displayInfo.titleText && (
        <span className={cn("title-on-nickname-wrapper")}>
            <span className={cn(displayInfo.titleClasses)}>
                {displayInfo.titleText}
            </span>
        </span>
      )}
      <div className={finalNicknameContainerClasses}>
        {displayInfo.showLogo && <CategoryIcon category={displayInfo.showLogo} className="h-3.5 w-3.5" />}
        <span className={cn(displayInfo.nicknameClasses)}>
          {displayInfo.nickname}
        </span>
      </div>
    </div>
  );
}
