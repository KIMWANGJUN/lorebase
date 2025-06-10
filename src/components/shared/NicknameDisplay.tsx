
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
  activeCategory?: PostMainCategory; // Used for ranking lists to highlight current category rank
  postMainCategoryForAuthor?: PostMainCategory; // Used for post/comment author to highlight if their post's category is special for them
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
    
    const baseNicknameClass = "text-sm font-medium"; // Base for all nicknames
    const baseTitleClass = "title-text-base"; // Base for all titles

    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null, titleClasses: "", nicknameClasses: cn(baseNicknameClass, "admin-text"),
        wrapperClasses: "admin-badge", showLogoCategory: null, nickname: user.nickname, isAdmin: true,
      };
    }
    
    if (user.username === 'testwang1') {
        // For testwang1, apply selected styles directly regardless of actual rank
        // 1. Title
        if (selectedTitle.startsWith('tetris_')) {
            const rank = parseInt(selectedTitle.split('_')[1]);
            if (rank >= 1 && rank <= 3) {
                titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
                if (rank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                else if (rank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                else if (rank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
            }
        } else if (selectedTitle.startsWith('category_')) {
            const parts = selectedTitle.split('_');
            const cat = parts[1] as PostMainCategory;
            const rank = parseInt(parts[2]);
             if (rank >= 1 && rank <= 3) {
                titleText = `${getCategoryDisplayName(cat)} ${rank}위`;
                if (rank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                else if (rank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                else if (rank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
            }
        } else {
             titleClasses = baseTitleClass; // Reset if 'none' or unrecognized
        }

        // 2. Nickname Effect (Text & Wrapper)
        nicknameClasses = baseNicknameClass; // Start with base
        if (selectedNicknameEffect.startsWith('global_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
            if (rank === 1) { nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); wrapperClasses = "bg-wrapper-gold"; }
            else if (rank === 2) { nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); wrapperClasses = "bg-wrapper-silver"; }
            else if (rank === 3) { nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); wrapperClasses = "bg-wrapper-bronze"; }
        } else if (selectedNicknameEffect.startsWith('category_')) {
            const parts = selectedNicknameEffect.split('_');
            const cat = parts[1] as PostMainCategory;
            const tier = parts[2]; // "1-3", "4-10", "11-20"
            const applyWrapper = tier === '1-3' || tier === '4-10';
            
            if (cat === 'Unity') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); if(applyWrapper) wrapperClasses = "bg-wrapper-unity"; }
            else if (cat === 'Unreal') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); if(applyWrapper) wrapperClasses = "bg-wrapper-unreal"; }
            else if (cat === 'Godot') { nicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); if(applyWrapper) wrapperClasses = "bg-wrapper-godot"; }
            else if (cat === 'General') { nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); if(applyWrapper) wrapperClasses = "bg-wrapper-general-rainbow"; }
        } else if (selectedNicknameEffect.startsWith('tetris_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
            if (rank === 1) nicknameClasses = cn(baseNicknameClass, "text-gradient-gold");
            else if (rank === 2) nicknameClasses = cn(baseNicknameClass, "text-gradient-silver");
            else if (rank === 3) nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze");
            // No wrapper for tetris effects
        } else {
            nicknameClasses = cn(baseNicknameClass, "text-foreground"); // Default if 'none' or unrecognized
        }

        // 3. Logo
        if (selectedLogo.startsWith('logo_')) {
            showLogoCategory = selectedLogo.split('_')[1] as PostMainCategory;
        }
        
        return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: user.nickname, isAdmin: false };
    }

    // Logic for Regular Users
    // Priority: Selected User Preference (if earned) > Global Rank > Tetris Rank > Active Category Rank > Post Author Category Rank > Default
    // For simplicity, if user selected something specific, we try to apply it.
    // If 'none' is selected for all, then we apply defaults based on earned ranks.

    let appliedSpecificPreference = false;

    if (selectedTitle !== 'none' || selectedNicknameEffect !== 'none' || selectedLogo !== 'none') {
        // User has specific preferences - apply them (validation if earned is complex with mock, so we'll assume testwang1 covers unearned tests)
        // This part could be expanded with actual checks for earned ranks for regular users
        
        // Apply Title
        if (selectedTitle.startsWith('tetris_')) {
            const rank = parseInt(selectedTitle.split('_')[1]);
            if (user.tetrisRank === rank && rank >= 1 && rank <= 3) {
                titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
                if (rank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                else if (rank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                else if (rank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
                appliedSpecificPreference = true;
            }
        } else if (selectedTitle.startsWith('category_')) {
            const parts = selectedTitle.split('_');
            const cat = parts[1] as PostMainCategory;
            const rank = parseInt(parts[2]);
            if (user.categoryStats?.[cat]?.rankInCate === rank && rank >= 1 && rank <= 3) {
                titleText = `${getCategoryDisplayName(cat)} ${rank}위`;
                if (rank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                else if (rank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                else if (rank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
                appliedSpecificPreference = true;
            }
        }

        // Apply Nickname Effect
        nicknameClasses = baseNicknameClass; // reset
        let tempWrapperClasses = "";
        if (selectedNicknameEffect.startsWith('global_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
            if (user.rank === rank && rank >= 1 && rank <= 3) {
                if (rank === 1) { nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); tempWrapperClasses = "bg-wrapper-gold"; }
                else if (rank === 2) { nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); tempWrapperClasses = "bg-wrapper-silver"; }
                else if (rank === 3) { nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); tempWrapperClasses = "bg-wrapper-bronze"; }
                appliedSpecificPreference = true;
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
                const applyWrapper = tier === '1-3' || tier === '4-10';
                if (cat === 'Unity') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); if(applyWrapper) tempWrapperClasses = "bg-wrapper-unity"; }
                else if (cat === 'Unreal') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); if(applyWrapper) tempWrapperClasses = "bg-wrapper-unreal"; }
                else if (cat === 'Godot') { nicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); if(applyWrapper) tempWrapperClasses = "bg-wrapper-godot"; }
                else if (cat === 'General') { nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); if(applyWrapper) tempWrapperClasses = "bg-wrapper-general-rainbow"; }
                appliedSpecificPreference = true;
            }
        } else if (selectedNicknameEffect.startsWith('tetris_')) {
            const rank = parseInt(selectedNicknameEffect.split('_')[1]);
             if (user.tetrisRank === rank && rank >= 1 && rank <= 3) {
                if (rank === 1) nicknameClasses = cn(baseNicknameClass, "text-gradient-gold");
                else if (rank === 2) nicknameClasses = cn(baseNicknameClass, "text-gradient-silver");
                else if (rank === 3) nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze");
                appliedSpecificPreference = true;
            }
        }
        if (appliedSpecificPreference) wrapperClasses = tempWrapperClasses;


        // Apply Logo
        if (selectedLogo.startsWith('logo_')) {
            const cat = selectedLogo.split('_')[1] as PostMainCategory;
            if (user.categoryStats?.[cat]?.rankInCate && user.categoryStats[cat]!.rankInCate! > 0 && user.categoryStats[cat]!.rankInCate! <= 20) { // Logo for top 20 in category
                 showLogoCategory = cat;
                 appliedSpecificPreference = true;
            }
        }
        if (!appliedSpecificPreference && selectedTitle === 'none' && selectedNicknameEffect === 'none' && selectedLogo === 'none') {
          // All prefs are 'none', proceed to default rank logic
        } else if (appliedSpecificPreference) {
            // If any specific preference was applied (and implicitly earned), return
             if(nicknameClasses === baseNicknameClass) nicknameClasses = cn(baseNicknameClass, "text-foreground"); // ensure default if no specific color set
            return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: user.nickname, isAdmin: false };
        }
    }
    
    // Default Rank-Based Styling (if no specific preference was applied or all are 'none')
    // Resetting before applying defaults
    titleText = null;
    titleClasses = baseTitleClass;
    nicknameClasses = cn(baseNicknameClass, "text-foreground");
    wrapperClasses = "";
    showLogoCategory = null;

    if (user.rank > 0 && user.rank <= 3) { // Global Rank
        if (user.rank === 1) { nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); wrapperClasses = "bg-wrapper-gold"; }
        else if (user.rank === 2) { nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); wrapperClasses = "bg-wrapper-silver"; }
        else if (user.rank === 3) { nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); wrapperClasses = "bg-wrapper-bronze"; }
    } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) { // Tetris Rank
        const rank = user.tetrisRank;
        titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
        if (rank === 1) { titleClasses = cn(baseTitleClass, "text-gradient-gold"); nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); }
        else if (rank === 2) { titleClasses = cn(baseTitleClass, "text-gradient-silver"); nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); }
        else if (rank === 3) { titleClasses = cn(baseTitleClass, "text-gradient-bronze"); nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); }
    } else {
        // Category Rank (either from activeCategory for lists, or postMainCategoryForAuthor for specific posts/comments)
        const categoryToConsider = activeCategory || postMainCategoryForAuthor;
        if (categoryToConsider && user.categoryStats?.[categoryToConsider]) {
            const catStat = user.categoryStats[categoryToConsider]!;
            const catRank = catStat.rankInCate || 0;

            if (catRank > 0 && catRank <= 20) {
                showLogoCategory = categoryToConsider; // Logo for top 20

                if (catRank <= 3) { // Title for 1-3
                    titleText = `${getCategoryDisplayName(categoryToConsider)} ${catRank}위`;
                    if (catRank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                    else if (catRank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                    else if (catRank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
                }

                // Nickname text & wrapper for 1-10
                if (catRank <= 10) {
                    if (categoryToConsider === 'Unity') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); wrapperClasses = "bg-wrapper-unity"; }
                    else if (categoryToConsider === 'Unreal') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); wrapperClasses = "bg-wrapper-unreal"; }
                    else if (categoryToConsider === 'Godot') { nicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); wrapperClasses = "bg-wrapper-godot"; }
                    else if (categoryToConsider === 'General') { nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); wrapperClasses = "bg-wrapper-general-rainbow"; }
                } else if (catRank <= 20) { // Nickname text only for 11-20
                    if (categoryToConsider === 'Unity') nicknameClasses = cn(baseNicknameClass, "text-gradient-unity");
                    else if (categoryToConsider === 'Unreal') nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal");
                    else if (categoryToConsider === 'Godot') nicknameClasses = cn(baseNicknameClass, "text-gradient-godot");
                    else if (categoryToConsider === 'General') nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow");
                }
            }
        }
    }
    
    // Context-specific overrides (e.g., no wrapper in header)
    if (context === 'header' || context === 'profileCard') {
        wrapperClasses = ""; // No wrapper in header or profile card main display
        // Keep gradient text if applied by rank, otherwise default
        if (!nicknameClasses.includes("gradient") && !nicknameClasses.includes("admin-text")) {
             nicknameClasses = cn(baseNicknameClass, "text-foreground");
        }
        if(context === 'header') {
            titleText = null; // No title in header
            showLogoCategory = null; // No logo in header
        }
    }
     if (titleText === null) titleClasses = ""; // Clear titleClasses if no titleText to avoid applying base style to empty space

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
    "inline-flex flex-col items-center leading-tight",
    displayInfo.wrapperClasses // This is where bg-wrapper-X should apply
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
