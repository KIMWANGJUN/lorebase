
// src/components/shared/NicknameDisplay.tsx
"use client";

import type { User, PostMainCategory, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import { tetrisTitles } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { Box, AppWindow, PenTool, LayoutGrid, ShieldCheck } from 'lucide-react';

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
  const displayInfo = useMemo(() => {
    let titleText: string | null = null;
    let titleClasses: string = "title-text-base";
    let nicknameClasses: string = "text-sm font-medium text-foreground";
    let wrapperClasses: string = "";
    let showLogoCategory: PostMainCategory | null = null;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: "Unknown User", isAdmin: false };

    const selectedTitle = user.selectedTitleIdentifier || 'none';
    const selectedNicknameEffect = user.selectedNicknameEffectIdentifier || 'none';
    const selectedLogo = user.selectedLogoIdentifier || 'none';

    // Default styles
    const baseNicknameClass = "text-sm font-medium";
    const defaultNicknameClass = `${baseNicknameClass} text-foreground`;
    const defaultWrapperClass = "";

    const applyStyles = (
        title: string | null, tClasses: string,
        nnClasses: string, wClasses: string,
        logoCat: PostMainCategory | null
    ) => {
        titleText = title;
        titleClasses = cn("title-text-base", tClasses);
        nicknameClasses = cn(baseNicknameClass, nnClasses);
        wrapperClasses = wClasses;
        showLogoCategory = logoCat;
    };

    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null, titleClasses: "", nicknameClasses: "admin-text text-sm",
        wrapperClasses: "admin-badge", showLogoCategory: null, nickname: user.nickname, isAdmin: true,
      };
    }
    
    if (user.username === 'testwang1') {
        let tempTitleText: string | null = null;
        let tempTitleClasses: string = "";
        let tempNicknameClasses: string = defaultNicknameClass;
        let tempWrapperClasses: string = defaultWrapperClass;
        let tempLogoCategory: PostMainCategory | null = null;

        // 1. Apply selected title for testwang1
        if (selectedTitle.startsWith('tetris_')) {
            const rank = parseInt(selectedTitle.split('_')[1]);
            if (rank >= 1 && rank <= 3) {
                tempTitleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
                if (rank === 1) tempTitleClasses = "text-gradient-gold";
                else if (rank === 2) tempTitleClasses = "text-gradient-silver";
                else if (rank === 3) tempTitleClasses = "text-gradient-bronze";
            }
        } else if (selectedTitle.startsWith('category_')) {
            const parts = selectedTitle.split('_');
            const cat = parts[1] as PostMainCategory;
            const rank = parseInt(parts[2]);
            tempTitleText = `${getCategoryDisplayName(cat)} ${rank}위`;
            if (rank === 1) tempTitleClasses = "text-gradient-gold";
            else if (rank === 2) tempTitleClasses = "text-gradient-silver";
            else if (rank === 3) tempTitleClasses = "text-gradient-bronze";
        }

        // 2. Apply selected nickname effect for testwang1
        if (selectedNicknameEffect.startsWith('global_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
            if (rank === 1) { tempNicknameClasses = "text-gradient-gold"; tempWrapperClasses = "bg-wrapper-gold"; }
            else if (rank === 2) { tempNicknameClasses = "text-gradient-silver"; tempWrapperClasses = "bg-wrapper-silver"; }
            else if (rank === 3) { tempNicknameClasses = "text-gradient-bronze"; tempWrapperClasses = "bg-wrapper-bronze"; }
        } else if (selectedNicknameEffect.startsWith('category_')) {
            const parts = selectedNicknameEffect.split('_');
            const cat = parts[1] as PostMainCategory;
            const tier = parts[2]; // "1-3", "4-10", "11-20"
            const isHighTier = tier === '1-3' || tier === '4-10';
            if (cat === 'Unity') { tempNicknameClasses = "text-gradient-unity"; if(isHighTier) tempWrapperClasses = "bg-wrapper-unity"; }
            else if (cat === 'Unreal') { tempNicknameClasses = "text-gradient-unreal"; if(isHighTier) tempWrapperClasses = "bg-wrapper-unreal"; }
            else if (cat === 'Godot') { tempNicknameClasses = "text-gradient-godot"; if(isHighTier) tempWrapperClasses = "bg-wrapper-godot"; }
            else if (cat === 'General') { tempNicknameClasses = "text-gradient-general-rainbow"; if(isHighTier) tempWrapperClasses = "bg-wrapper-general-rainbow"; }
        } else if (selectedNicknameEffect.startsWith('tetris_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
            if (rank === 1) tempNicknameClasses = "text-gradient-gold";
            else if (rank === 2) tempNicknameClasses = "text-gradient-silver";
            else if (rank === 3) tempNicknameClasses = "text-gradient-bronze";
            // No wrapper for tetris effects
        }

        // 3. Apply selected logo for testwang1
        if (selectedLogo.startsWith('logo_')) {
            tempLogoCategory = selectedLogo.split('_')[1] as PostMainCategory;
        }
        
        applyStyles(tempTitleText, tempTitleClasses, tempNicknameClasses, tempWrapperClasses, tempLogoCategory);
         return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: user.nickname, isAdmin: false };
    }

    // Regular user logic (simplified for now, needs validation of earned ranks)
    // This part is complex and should ideally check earned ranks against selected preferences.
    // For now, it will behave like testwang1 if any specific preference is set.
    // Otherwise, it will try to apply highest earned default style.

    if (selectedTitle !== 'none' || selectedNicknameEffect !== 'none' || selectedLogo !== 'none') {
        let tempTitleText: string | null = null;
        let tempTitleClasses: string = "";
        let tempNicknameClasses: string = defaultNicknameClass;
        let tempWrapperClasses: string = defaultWrapperClass;
        let tempLogoCategory: PostMainCategory | null = null;

         if (selectedTitle.startsWith('tetris_')) {
            const rank = parseInt(selectedTitle.split('_')[1]);
            if (rank >= 1 && rank <= 3 && user.tetrisRank === rank) { // Basic check if earned
                tempTitleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
                if (rank === 1) tempTitleClasses = "text-gradient-gold";
                else if (rank === 2) tempTitleClasses = "text-gradient-silver";
                else if (rank === 3) tempTitleClasses = "text-gradient-bronze";
            }
        } else if (selectedTitle.startsWith('category_')) {
            const parts = selectedTitle.split('_');
            const cat = parts[1] as PostMainCategory;
            const rank = parseInt(parts[2]);
            if (user.categoryStats?.[cat]?.rankInCate === rank && rank <=3) { // Basic check
                tempTitleText = `${getCategoryDisplayName(cat)} ${rank}위`;
                if (rank === 1) tempTitleClasses = "text-gradient-gold";
                else if (rank === 2) tempTitleClasses = "text-gradient-silver";
                else if (rank === 3) tempTitleClasses = "text-gradient-bronze";
            }
        }

        if (selectedNicknameEffect.startsWith('global_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
             if (user.rank === rank && rank <= 3) { // Basic check
                if (rank === 1) { tempNicknameClasses = "text-gradient-gold"; tempWrapperClasses = "bg-wrapper-gold"; }
                else if (rank === 2) { tempNicknameClasses = "text-gradient-silver"; tempWrapperClasses = "bg-wrapper-silver"; }
                else if (rank === 3) { tempNicknameClasses = "text-gradient-bronze"; tempWrapperClasses = "bg-wrapper-bronze"; }
            }
        } else if (selectedNicknameEffect.startsWith('category_')) {
             const parts = selectedNicknameEffect.split('_');
            const cat = parts[1] as PostMainCategory;
            const tier = parts[2]; // "1-3", "4-10", "11-20"
            const userCatRank = user.categoryStats?.[cat]?.rankInCate;
            let effectApplies = false;
            if (userCatRank && userCatRank > 0) {
                if (tier === '1-3' && userCatRank <= 3) effectApplies = true;
                else if (tier === '4-10' && userCatRank >= 4 && userCatRank <= 10) effectApplies = true;
                else if (tier === '11-20' && userCatRank >= 11 && userCatRank <= 20) effectApplies = true;
            }
            if (effectApplies) {
                const isHighTier = tier === '1-3' || tier === '4-10';
                if (cat === 'Unity') { tempNicknameClasses = "text-gradient-unity"; if(isHighTier) tempWrapperClasses = "bg-wrapper-unity"; }
                else if (cat === 'Unreal') { tempNicknameClasses = "text-gradient-unreal"; if(isHighTier) tempWrapperClasses = "bg-wrapper-unreal"; }
                else if (cat === 'Godot') { tempNicknameClasses = "text-gradient-godot"; if(isHighTier) tempWrapperClasses = "bg-wrapper-godot"; }
                else if (cat === 'General') { tempNicknameClasses = "text-gradient-general-rainbow"; if(isHighTier) tempWrapperClasses = "bg-wrapper-general-rainbow"; }
            }
        } else if (selectedNicknameEffect.startsWith('tetris_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
            if (user.tetrisRank === rank && rank <= 3) { // Basic check
                if (rank === 1) tempNicknameClasses = "text-gradient-gold";
                else if (rank === 2) tempNicknameClasses = "text-gradient-silver";
                else if (rank === 3) tempNicknameClasses = "text-gradient-bronze";
            }
        }
        
        if (selectedLogo.startsWith('logo_')) {
            const cat = selectedLogo.split('_')[1] as PostMainCategory;
            // Basic check: Does user have any rank in this category for logo?
            if (user.categoryStats?.[cat]?.rankInCate && user.categoryStats[cat]!.rankInCate! > 0) {
                 tempLogoCategory = cat;
            }
        }
        applyStyles(tempTitleText, tempTitleClasses, tempNicknameClasses, tempWrapperClasses, tempLogoCategory);

    } else { // 'default' selected or no specific selection, apply highest earned priority
        if (user.rank > 0 && user.rank <= 3) {
            if (user.rank === 1) applyStyles(null, "", "text-gradient-gold", "bg-wrapper-gold", null);
            else if (user.rank === 2) applyStyles(null, "", "text-gradient-silver", "bg-wrapper-silver", null);
            else if (user.rank === 3) applyStyles(null, "", "text-gradient-bronze", "bg-wrapper-bronze", null);
        } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) {
            const rank = user.tetrisRank;
            let title = tetrisTitles[rank] || `테트리스 ${rank}위`;
            if (rank === 1) applyStyles(title, "text-gradient-gold", "text-gradient-gold", "", null);
            else if (rank === 2) applyStyles(title, "text-gradient-silver", "text-gradient-silver", "", null);
            else if (rank === 3) applyStyles(title, "text-gradient-bronze", "text-gradient-bronze", "", null);
        } else if (activeCategory && user.categoryStats?.[activeCategory]?.rankInCate && user.categoryStats[activeCategory]!.rankInCate! > 0) {
            // Apply active category style if present
            const catRank = user.categoryStats[activeCategory]!.rankInCate!;
            const cat = activeCategory;
            let title: string | null = null;
            let tClasses = "";
            let nnClasses = defaultNicknameClass;
            let wClasses = defaultWrapperClass;

            if (catRank <= 3) {
                title = `${getCategoryDisplayName(cat)} ${catRank}위`;
                if (catRank === 1) tClasses = "text-gradient-gold";
                else if (catRank === 2) tClasses = "text-gradient-silver";
                else if (catRank === 3) tClasses = "text-gradient-bronze";
            }
            if (catRank <= 10) { // Includes 1-3 for wrapper
                 if (cat === 'Unity') { nnClasses = "text-gradient-unity"; wClasses = "bg-wrapper-unity"; }
                else if (cat === 'Unreal') { nnClasses = "text-gradient-unreal"; wClasses = "bg-wrapper-unreal"; }
                else if (cat === 'Godot') { nnClasses = "text-gradient-godot"; wClasses = "bg-wrapper-godot"; }
                else if (cat === 'General') { nnClasses = "text-gradient-general-rainbow"; wClasses = "bg-wrapper-general-rainbow"; }
            } else if (catRank <= 20) { // No wrapper for 11-20
                 if (cat === 'Unity') nnClasses = "text-gradient-unity";
                else if (cat === 'Unreal') nnClasses = "text-gradient-unreal";
                else if (cat === 'Godot') nnClasses = "text-gradient-godot";
                else if (cat === 'General') nnClasses = "text-gradient-general-rainbow";
            }
            applyStyles(title, tClasses, nnClasses, wClasses, cat);
        }
         // Default styles if no ranks apply
         if (titleText === null && nicknameClasses === "text-sm font-medium text-foreground" && wrapperClasses === "") {
             applyStyles(null, "", defaultNicknameClass, defaultWrapperClass, null);
         }
    }
    

    if (context === 'header' || context === 'profileCard') {
        wrapperClasses = ""; // No wrapper in header or profile card main display
        if (!nicknameClasses.includes("gradient") && !nicknameClasses.includes("admin-text")) { // keep gradient/admin text if any
             nicknameClasses = `${baseNicknameClass} text-foreground`;
        }
        if(context === 'header') {
            titleText = null; // No title in header
            showLogoCategory = null; // No logo in header
        }
    }
    
    // Ensure base font size and weight are part of nicknameClasses if not already set by a gradient class
    if (!nicknameClasses.includes("text-sm") && !nicknameClasses.includes("text-xs") && !nicknameClasses.includes("text-lg")) { // text-lg might be used by gradients
        nicknameClasses = cn(baseNicknameClass, nicknameClasses);
    } else if (!nicknameClasses.includes("font-medium") && !nicknameClasses.includes("font-semibold")){
         nicknameClasses = cn("font-medium", nicknameClasses);
    }


    return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: user.nickname, isAdmin: false };
  }, [user, user.selectedTitleIdentifier, user.selectedNicknameEffectIdentifier, user.selectedLogoIdentifier, activeCategory, postMainCategoryForAuthor, context]);

  if (displayInfo.isAdmin) {
    return (
      <span className={cn(displayInfo.wrapperClasses, "inline-flex items-center gap-1")}>
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className={displayInfo.nicknameClasses}>{displayInfo.nickname}</span>
      </span>
    );
  }
  
  const finalWrapperClasses = cn(
    "inline-flex flex-col items-center leading-tight", // Changed from items-start to items-center
    displayInfo.wrapperClasses
  );

  const finalNicknameContainerClasses = cn(
    "flex items-center", // This handles vertical alignment of logo and nickname
    displayInfo.showLogoCategory ? "gap-1" : ""
  );

  return (
    <div className={finalWrapperClasses}>
      {displayInfo.titleText && (
        <span className={cn("title-on-nickname-wrapper")}> {/* CSS: block w-full text-center */}
            <span className={cn(displayInfo.titleClasses)}>
                {displayInfo.titleText}
            </span>
        </span>
      )}
      <div className={finalNicknameContainerClasses}> {/* This div is centered by parent's items-center */}
        {displayInfo.showLogoCategory && <CategoryIcon category={displayInfo.showLogoCategory} className="h-3.5 w-3.5" />}
        <span className={cn(displayInfo.nicknameClasses)}> {/* Nickname text itself */}
          {displayInfo.nickname}
        </span>
      </div>
    </div>
  );
}

