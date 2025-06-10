
// src/components/shared/NicknameDisplay.tsx
"use client";

import type { User, PostMainCategory, AchievedRankType } from '@/types';
import { tetrisTitles } from '@/lib/mockData'; // Assuming tetrisTitles is exported from mockData
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { Box, AppWindow, PenTool, LayoutGrid, ShieldCheck } from 'lucide-react';

interface NicknameDisplayProps {
  user: User;
  context?: 'postAuthor' | 'commentAuthor' | 'rankingList' | 'sidebarRanking' | 'header';
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
  const displayInfo = useMemo(() => {
    let titleText: string | null = null;
    let titleClasses: string = "title-text-base"; // Base class for title
    let nicknameClasses: string = "text-sm font-medium text-foreground"; // Default nickname style
    let wrapperClasses: string = ""; // For background wrappers
    let showLogo: PostMainCategory | null = null;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogo, nickname: "Unknown User", isAdmin: false };

    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null,
        titleClasses: "",
        nicknameClasses: "admin-text text-sm",
        wrapperClasses: "admin-badge",
        showLogo: null,
        nickname: user.nickname,
        isAdmin: true,
      };
    }

    const currentSelectedRank = user.selectedDisplayRank || 'default';
    let appliedStyle = false;

    const applyGlobalRankStyle = (rank: number) => {
      if (rank === 1) { nicknameClasses = "text-rank-gold"; wrapperClasses = "bg-rank-gold-wrapper"; }
      else if (rank === 2) { nicknameClasses = "text-rank-silver"; wrapperClasses = "bg-rank-silver-wrapper"; }
      else if (rank === 3) { nicknameClasses = "text-rank-bronze"; wrapperClasses = "bg-rank-bronze-wrapper"; }
      titleText = null; // Global ranks don't have a prefix title by default here
      appliedStyle = true;
    };

    const applyTetrisRankStyle = (rank: number) => {
      titleText = tetrisTitles[rank] || null;
      if (rank === 1) { titleClasses = "text-rank-gold title-text-base"; nicknameClasses = "text-rank-gold"; }
      else if (rank === 2) { titleClasses = "text-rank-silver title-text-base"; nicknameClasses = "text-rank-silver"; }
      else if (rank === 3) { titleClasses = "text-rank-bronze title-text-base"; nicknameClasses = "text-rank-bronze"; }
      wrapperClasses = ""; // No wrapper for tetris ranks
      appliedStyle = true;
    };

    const applyCategoryRankStyle = (category: PostMainCategory, rank: number) => {
      showLogo = category; // Show logo for all category ranks

      if (rank >= 1 && rank <= 3) { // Top 1-3 in category
        titleText = getCategoryDisplayName(category);
        if (rank === 1) titleClasses = "text-rank-gold title-text-base";
        else if (rank === 2) titleClasses = "text-rank-silver title-text-base";
        else if (rank === 3) titleClasses = "text-rank-bronze title-text-base";
      } else {
        titleText = null; // No title for 4-20
      }

      // Nickname and Wrapper styles based on rank tier and category
      if (rank >= 1 && rank <= 10) { // Wrapper for 1-10
        if (category === 'Unity') { nicknameClasses = "text-unity-gradient"; wrapperClasses = "bg-unity-wrapper"; }
        else if (category === 'Unreal') { nicknameClasses = "text-unreal-gradient"; wrapperClasses = "bg-unreal-wrapper"; }
        else if (category === 'Godot') { nicknameClasses = "text-godot-gradient"; wrapperClasses = "bg-godot-wrapper"; }
        else if (category === 'General') { nicknameClasses = "text-general-gradient"; wrapperClasses = "bg-general-wrapper"; }
      } else if (rank >= 11 && rank <= 20) { // Text only for 11-20
        if (category === 'Unity') nicknameClasses = "text-unity-gradient";
        else if (category === 'Unreal') nicknameClasses = "text-unreal-gradient";
        else if (category === 'Godot') nicknameClasses = "text-godot-gradient";
        else if (category === 'General') nicknameClasses = "text-general-gradient";
        wrapperClasses = ""; // No wrapper for 11-20
      }
      appliedStyle = true;
    };
    
    // Priority 1: User's selected display rank
    if (currentSelectedRank !== 'default') {
      const [type, ...rest] = currentSelectedRank.split('_') as [string, string, string?];
      const rankOrCategory = rest[0];
      const rankNum = parseInt(rankOrCategory);

      if (type === 'global' && user.rank === rankNum && rankNum <=3) {
        applyGlobalRankStyle(rankNum);
      } else if (type === 'tetris' && user.tetrisRank && user.tetrisRank === rankNum && rankNum <=3) {
        applyTetrisRankStyle(rankNum);
      } else if (type === 'category') {
        const cat = rankOrCategory as PostMainCategory;
        const tier = rest[1]; // "1-3", "4-10", "11-20"
        const userCatRank = user.categoryStats?.[cat]?.rankInCate;
        if (userCatRank) {
            if ((tier === "1-3" && userCatRank >= 1 && userCatRank <= 3) ||
              (tier === "4-10" && userCatRank >= 4 && userCatRank <= 10) ||
              (tier === "11-20" && userCatRank >= 11 && userCatRank <= 20)) {
            applyCategoryRankStyle(cat, userCatRank);
          }
        }
      }
    }

    // Priority 2: Default automatic application if no valid selection or 'default'
    if (!appliedStyle) {
      if (user.rank > 0 && user.rank <= 3) {
        applyGlobalRankStyle(user.rank);
      } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) {
        applyTetrisRankStyle(user.tetrisRank);
      } else {
        // For context-sensitive category styling (e.g., in a Unity board, Unity rank styles are prioritized)
        const categoryForContext = activeCategory || postMainCategoryForAuthor;
        let styledByCategoryContext = false;

        if (categoryForContext) {
          const catRank = user.categoryStats?.[categoryForContext]?.rankInCate;
          if (catRank && catRank > 0 && catRank <= 20) {
            applyCategoryRankStyle(categoryForContext, catRank);
            styledByCategoryContext = true;
          }
        }
        
        // If not styled by specific context, try to find any other top category rank
        if (!styledByCategoryContext) {
            let bestCat: PostMainCategory | null = null;
            let bestCatRankVal = Infinity;

            (['Unity', 'Unreal', 'Godot', 'General'] as PostMainCategory[]).forEach(catKey => {
                const currentCatRank = user.categoryStats?.[catKey]?.rankInCate;
                if (currentCatRank && currentCatRank > 0 && currentCatRank <=20 && currentCatRank < bestCatRankVal) {
                    bestCatRankVal = currentCatRank;
                    bestCat = catKey;
                }
            });
            if (bestCat) {
                 applyCategoryRankStyle(bestCat, bestCatRankVal);
            }
        }
      }
    }
    
    // Simplify for header context
    if (context === 'header') {
        wrapperClasses = ""; // No wrapper in header
        if (nicknameClasses.includes("gradient") || nicknameClasses.includes("rank")) {
            if (user.rank > 0 && user.rank <=3) nicknameClasses = user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-slate-300" : "text-orange-400";
            else nicknameClasses = "text-foreground";
        }
        nicknameClasses = cn(nicknameClasses, "text-sm font-medium");
        titleText = null; 
        showLogo = null; 
    }


    // Default to base font size if no specific style applied, or merge
    if (!nicknameClasses.includes("text-sm") && !nicknameClasses.includes("text-xs")) {
        nicknameClasses = cn("text-sm font-medium", nicknameClasses);
    } else {
        nicknameClasses = cn("font-medium", nicknameClasses); // Ensure font-medium if size is already there
    }


    return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogo, nickname: user.nickname, isAdmin: false };
  }, [user, user.selectedDisplayRank, activeCategory, postMainCategoryForAuthor, context]);

  if (displayInfo.isAdmin) {
    return (
      <span className={cn(displayInfo.wrapperClasses, "inline-flex items-center gap-1")}>
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className={displayInfo.nicknameClasses}>{displayInfo.nickname}</span>
      </span>
    );
  }
  
  const finalWrapperClasses = cn(
    "inline-flex flex-col items-start leading-tight",
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

