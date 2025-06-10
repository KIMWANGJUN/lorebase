
// src/components/shared/NicknameDisplay.tsx
"use client";

import type { User, PostMainCategory, TitleIdentifier, NicknameEffectIdentifier, LogoIdentifier } from '@/types';
import { tetrisTitles } from '@/lib/mockData'; 
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
    let titleClasses: string = "title-text-base"; 
    let nicknameClasses: string = "text-sm font-medium text-foreground"; 
    let wrapperClasses: string = ""; 
    let showLogoCategory: PostMainCategory | null = null; // Changed to store category for logo
    let appliedStyle = false;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: "Unknown User", isAdmin: false };

    const selectedTitle = user.selectedTitleIdentifier || 'none';
    const selectedEffect = user.selectedNicknameEffectIdentifier || 'none';
    const selectedLogo = user.selectedLogoIdentifier || 'none';

    // 관리자 최우선
    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null, titleClasses: "", nicknameClasses: "admin-text text-sm",
        wrapperClasses: "admin-badge", showLogoCategory: null, nickname: user.nickname, isAdmin: true,
      };
    }

    // 테스트 계정: 선택된 효과를 무조건 적용
    if (user.username === 'testwang1') {
        // 1. Title from selectedTitle
        if (selectedTitle.startsWith('tetris_')) {
            const rank = parseInt(selectedTitle.split('_')[1]);
            if (rank >= 1 && rank <= 3) {
                titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
                if (rank === 1) titleClasses = "text-gradient-gold title-text-base";
                else if (rank === 2) titleClasses = "text-gradient-silver title-text-base";
                else if (rank === 3) titleClasses = "text-gradient-bronze title-text-base";
            }
        } else if (selectedTitle.startsWith('category_')) {
            const parts = selectedTitle.split('_');
            const cat = parts[1] as PostMainCategory;
            const rank = parseInt(parts[2]);
            titleText = `${getCategoryDisplayName(cat)} ${rank}위`;
            if (rank === 1) titleClasses = "text-gradient-gold title-text-base";
            else if (rank === 2) titleClasses = "text-gradient-silver title-text-base";
            else if (rank === 3) titleClasses = "text-gradient-bronze title-text-base";
        } else {
            titleText = null;
        }

        // 2. Nickname effect (text & wrapper) from selectedEffect
        if (selectedEffect.startsWith('global_')) {
            const rank = parseInt(selectedEffect.split('_')[1]);
            if (rank === 1) { nicknameClasses = "text-gradient-gold"; wrapperClasses = "bg-wrapper-gold"; }
            else if (rank === 2) { nicknameClasses = "text-gradient-silver"; wrapperClasses = "bg-wrapper-silver"; }
            else if (rank === 3) { nicknameClasses = "text-gradient-bronze"; wrapperClasses = "bg-wrapper-bronze"; }
        } else if (selectedEffect.startsWith('category_')) {
            const parts = selectedEffect.split('_');
            const cat = parts[1] as PostMainCategory;
            const tier = parts[2]; // "1-3", "4-10", "11-20"
            const isHighTier = tier === '1-3' || tier === '4-10';
            if (cat === 'Unity') { nicknameClasses = "text-gradient-unity"; if(isHighTier) wrapperClasses = "bg-wrapper-unity"; }
            else if (cat === 'Unreal') { nicknameClasses = "text-gradient-unreal"; if(isHighTier) wrapperClasses = "bg-wrapper-unreal"; }
            else if (cat === 'Godot') { nicknameClasses = "text-gradient-godot"; if(isHighTier) wrapperClasses = "bg-wrapper-godot"; }
            else if (cat === 'General') { nicknameClasses = "text-gradient-general-rainbow"; if(isHighTier) wrapperClasses = "bg-wrapper-general-rainbow"; }
        } else if (selectedEffect.startsWith('tetris_')) {
            const rank = parseInt(selectedEffect.split('_')[1]);
            if (rank === 1) nicknameClasses = "text-gradient-gold";
            else if (rank === 2) nicknameClasses = "text-gradient-silver";
            else if (rank === 3) nicknameClasses = "text-gradient-bronze";
            wrapperClasses = ""; // No wrapper for tetris effects per PRD
        } else { // 'none' or other
            nicknameClasses = "text-sm font-medium text-foreground";
            wrapperClasses = "";
        }
        
        // 3. Logo from selectedLogo
        if (selectedLogo.startsWith('logo_')) {
            showLogoCategory = selectedLogo.split('_')[1] as PostMainCategory;
        } else {
            showLogoCategory = null;
        }
        appliedStyle = true;

    } else { // 일반 사용자 로직: 실제 랭킹 기반 + 사용자가 선택한 것 중 *달성한 것만* 적용 (우선순위: 선택 > 자동 최고)
        // This part needs full implementation for regular users based on earned ranks matching selected preferences.
        // For now, let's simplify and apply a default or highest achieved single bundled rank if selected is 'none'
        // This simplified logic below is a placeholder and needs to be expanded.
        // The PRD implies that if a user selects an effect they haven't earned, it shouldn't apply.
        // This complex validation logic is deferred. For now, we can assume selections are valid or apply default.

        // Placeholder: Fallback to highest earned global rank if selections are 'none' or not yet validated
        if (selectedTitle === 'none' && selectedEffect === 'none' && selectedLogo === 'none') {
            if (user.rank > 0 && user.rank <= 3) {
                if (user.rank === 1) { nicknameClasses = "text-gradient-gold"; wrapperClasses = "bg-wrapper-gold"; }
                else if (user.rank === 2) { nicknameClasses = "text-gradient-silver"; wrapperClasses = "bg-wrapper-silver"; }
                else if (user.rank === 3) { nicknameClasses = "text-gradient-bronze"; wrapperClasses = "bg-wrapper-bronze"; }
                appliedStyle = true;
            }
            // Add more fallback logic for tetris, category ranks if global rank is not top 3
        } else {
             // If user made specific selections, attempt to apply them (validation of earned status needed)
             // Simplified: Assume testwang1 logic path for now if any selection is not 'none'
             // This is NOT correct for regular users and needs the full validation.
             // For the purpose of this change, we'll assume testwang1's selected effect application logic
             // might be (incorrectly) hit if selections are made.
             // Proper implementation needs to check if user.rank allows global_1_effect etc.

            // Simplified logic for now: If any selection is made, try to apply it like testwang1 for visual effect
            // THIS IS A TEMPORARY STAND-IN AND DOES NOT VALIDATE EARNED RANKS FOR REGULAR USERS
            if (selectedTitle !== 'none' || selectedEffect !== 'none' || selectedLogo !== 'none') {
                 if (selectedTitle.startsWith('tetris_')) { /* ... set titleText, titleClasses ... */ }
                 if (selectedEffect.startsWith('global_')) { /* ... set nicknameClasses, wrapperClasses ... */ }
                 if (selectedLogo.startsWith('logo_')) { /* ... set showLogoCategory ... */ }
                 //This is a very rough approximation and needs the full validation logic for regular users
            }
        }
    }
    
    if (context === 'header') {
        wrapperClasses = ""; 
        if (nicknameClasses.includes("gradient")) { // keep gradient text if any
             // simplified for header
        } else {
            nicknameClasses = "text-foreground"; 
        }
        nicknameClasses = cn(nicknameClasses, "text-sm font-medium");
        titleText = null; 
        showLogoCategory = null; 
    }

    if (!nicknameClasses.includes("text-sm") && !nicknameClasses.includes("text-xs")) {
        nicknameClasses = cn("text-sm font-medium", nicknameClasses);
    } else {
        nicknameClasses = cn("font-medium", nicknameClasses); 
    }

    return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: user.nickname, isAdmin: user.username === 'WANGJUNLAND' };
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
    "inline-flex flex-col items-start leading-tight",
    displayInfo.wrapperClasses 
  );

  const finalNicknameContainerClasses = cn(
    "flex items-center",
    displayInfo.showLogoCategory ? "gap-1" : "" 
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
        {displayInfo.showLogoCategory && <CategoryIcon category={displayInfo.showLogoCategory} className="h-3.5 w-3.5" />}
        <span className={cn(displayInfo.nicknameClasses)}>
          {displayInfo.nickname}
        </span>
      </div>
    </div>
  );
}
