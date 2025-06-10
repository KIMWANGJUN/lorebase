
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
    let titleClasses: string = "";
    let nicknameClasses: string = "text-sm font-medium text-foreground";
    let wrapperClasses: string = "";
    let showLogoCategory: PostMainCategory | null = null;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: "Unknown User", isAdmin: false };

    const baseNicknameClass = "text-sm font-medium";
    const baseTitleClass = "title-text-base"; // from globals.css, sets text-xs

    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null, titleClasses: "", nicknameClasses: cn(baseNicknameClass, "admin-text"),
        wrapperClasses: "admin-badge", showLogoCategory: null, nickname: user.nickname, isAdmin: true,
      };
    }
    
    // For testwang1 or regular users with specific preferences
    if (user.username === 'testwang1' || 
        user.selectedTitleIdentifier !== 'none' || 
        user.selectedNicknameEffectIdentifier !== 'none' || 
        user.selectedLogoIdentifier !== 'none') {

        let finalTitleText: string | null = null;
        let finalTitleClasses: string = "";
        let finalNicknameClasses: string = cn(baseNicknameClass, "text-foreground"); // Default
        let finalWrapperClasses: string = "";
        let finalShowLogoCategory: PostMainCategory | null = null;

        // Determine styles based on selected preferences
        const { selectedTitleIdentifier, selectedNicknameEffectIdentifier, selectedLogoIdentifier } = user;

        // 1. Apply Title from selectedTitleIdentifier
        if (selectedTitleIdentifier && selectedTitleIdentifier !== 'none') {
            if (selectedTitleIdentifier.startsWith('tetris_')) {
                const rank = parseInt(selectedTitleIdentifier.split('_')[1]);
                if (rank >= 1 && rank <= 3) {
                    finalTitleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
                    if (rank === 1) finalTitleClasses = cn(baseTitleClass, "text-gradient-gold");
                    else if (rank === 2) finalTitleClasses = cn(baseTitleClass, "text-gradient-silver");
                    else if (rank === 3) finalTitleClasses = cn(baseTitleClass, "text-gradient-bronze");
                }
            } else if (selectedTitleIdentifier.startsWith('category_')) {
                const parts = selectedTitleIdentifier.split('_'); // category_Unity_1_title
                const cat = parts[1] as PostMainCategory;
                const rankPart = parts[2]; // "1" from "1_title"
                if (rankPart && (rankPart === "1" || rankPart === "2" || rankPart === "3")) {
                    const rank = parseInt(rankPart);
                    finalTitleText = `${getCategoryDisplayName(cat)} ${rank}위`;
                    if (rank === 1) finalTitleClasses = cn(baseTitleClass, "text-gradient-gold");
                    else if (rank === 2) finalTitleClasses = cn(baseTitleClass, "text-gradient-silver");
                    else if (rank === 3) finalTitleClasses = cn(baseTitleClass, "text-gradient-bronze");
                }
            }
            if (!finalTitleText) finalTitleClasses = ""; // Clear if no title text
        }


        // 2. Apply Nickname Effect (Text & Wrapper) from selectedNicknameEffectIdentifier
        if (selectedNicknameEffectIdentifier && selectedNicknameEffectIdentifier !== 'none') {
            if (selectedNicknameEffectIdentifier.startsWith('global_')) {
                const rank = parseInt(selectedNicknameEffectIdentifier.split('_')[1]);
                if (rank === 1) { finalNicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); finalWrapperClasses = "bg-wrapper-gold"; }
                else if (rank === 2) { finalNicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); finalWrapperClasses = "bg-wrapper-silver"; }
                else if (rank === 3) { finalNicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); finalWrapperClasses = "bg-wrapper-bronze"; }
            } else if (selectedNicknameEffectIdentifier.startsWith('category_')) {
                const parts = selectedNicknameEffectIdentifier.split('_'); // category_Unity_1-3_effect
                const cat = parts[1] as PostMainCategory;
                const tierEffect = parts[2] + (parts[3] ? `_${parts[3]}` : ""); // "1-3_effect", "4-10_effect", "11-20_effect"
                
                const applyWrapper = tierEffect === '1-3_effect' || tierEffect === '4-10_effect';
                
                if (cat === 'Unity') { finalNicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); if(applyWrapper) finalWrapperClasses = "bg-wrapper-unity"; }
                else if (cat === 'Unreal') { finalNicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); if(applyWrapper) finalWrapperClasses = "bg-wrapper-unreal"; }
                else if (cat === 'Godot') { finalNicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); if(applyWrapper) finalWrapperClasses = "bg-wrapper-godot"; }
                else if (cat === 'General') { finalNicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); if(applyWrapper) finalWrapperClasses = "bg-wrapper-general-rainbow"; }
            } else if (selectedNicknameEffectIdentifier.startsWith('tetris_')) {
                const rank = parseInt(selectedNicknameEffectIdentifier.split('_')[1]);
                if (rank === 1) finalNicknameClasses = cn(baseNicknameClass, "text-gradient-gold");
                else if (rank === 2) finalNicknameClasses = cn(baseNicknameClass, "text-gradient-silver");
                else if (rank === 3) finalNicknameClasses = cn(baseNicknameClass, "text-gradient-bronze");
                // No wrapper for tetris effects for nickname
            }
        }

        // 3. Apply Logo from selectedLogoIdentifier
        if (selectedLogoIdentifier && selectedLogoIdentifier !== 'none') {
            if (selectedLogoIdentifier.startsWith('logo_')) {
                finalShowLogoCategory = selectedLogoIdentifier.split('_')[1] as PostMainCategory;
            }
        }

        // If user is testwang1, these are the final styles.
        // For regular users, these selected styles take precedence if they are not 'none'.
        // If a regular user selected 'none' for all, the rank-based logic below will apply.
        if (user.username === 'testwang1' || 
            (selectedTitleIdentifier !== 'none' || selectedNicknameEffectIdentifier !== 'none' || selectedLogoIdentifier !== 'none')
        ) {
             // Ensure default nickname color if no specific effect applied it
            if (finalNicknameClasses === cn(baseNicknameClass, "text-foreground") && selectedNicknameEffectIdentifier === 'none') {
                 finalNicknameClasses = cn(baseNicknameClass, "text-foreground");
            }

            return { 
                titleText: finalTitleText, 
                titleClasses: finalTitleClasses ? finalTitleClasses : "", 
                nicknameClasses: finalNicknameClasses, 
                wrapperClasses: finalWrapperClasses, 
                showLogoCategory: finalShowLogoCategory, 
                nickname: user.nickname, 
                isAdmin: false 
            };
        }
    }
    
    // Default Rank-Based Styling (applies if user is not testwang1 AND all selected preferences are 'none')
    titleText = null; // Reset for rank-based logic
    titleClasses = "";
    nicknameClasses = cn(baseNicknameClass, "text-foreground");
    wrapperClasses = "";
    showLogoCategory = null;

    if (user.rank > 0 && user.rank <= 3) { // Global Rank (highest priority for default styling)
        if (user.rank === 1) { nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); wrapperClasses = "bg-wrapper-gold"; }
        else if (user.rank === 2) { nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); wrapperClasses = "bg-wrapper-silver"; }
        else if (user.rank === 3) { nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); wrapperClasses = "bg-wrapper-bronze"; }
    } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) { // Tetris Rank (second priority)
        const rank = user.tetrisRank;
        titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
        if (rank === 1) { titleClasses = cn(baseTitleClass, "text-gradient-gold"); nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); }
        else if (rank === 2) { titleClasses = cn(baseTitleClass, "text-gradient-silver"); nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); }
        else if (rank === 3) { titleClasses = cn(baseTitleClass, "text-gradient-bronze"); nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); }
    } else {
        // Category Rank (lowest priority for default styling, considers context)
        const categoryToConsiderForStyle = activeCategory || postMainCategoryForAuthor;
        if (categoryToConsiderForStyle && user.categoryStats?.[categoryToConsiderForStyle]) {
            const catStat = user.categoryStats[categoryToConsiderForStyle]!;
            const catRank = catStat.rankInCate || 0;

            if (catRank > 0 && catRank <= 20) {
                showLogoCategory = categoryToConsiderForStyle; // Logo for top 20 in this context

                if (catRank <= 3) { // Title for 1-3 in this context
                    titleText = `${getCategoryDisplayName(categoryToConsiderForStyle)} ${catRank}위`;
                    if (catRank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                    else if (catRank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                    else if (catRank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
                }

                // Nickname text & wrapper for 1-10 in this context
                if (catRank <= 10) {
                    const applyWrapper = true;
                    if (categoryToConsiderForStyle === 'Unity') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); if(applyWrapper) wrapperClasses = "bg-wrapper-unity"; }
                    else if (categoryToConsiderForStyle === 'Unreal') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); if(applyWrapper) wrapperClasses = "bg-wrapper-unreal"; }
                    else if (categoryToConsiderForStyle === 'Godot') { nicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); if(applyWrapper) wrapperClasses = "bg-wrapper-godot"; }
                    else if (categoryToConsiderForStyle === 'General') { nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); if(applyWrapper) wrapperClasses = "bg-wrapper-general-rainbow"; }
                } else if (catRank <= 20) { // Nickname text only for 11-20 in this context
                    if (categoryToConsiderForStyle === 'Unity') nicknameClasses = cn(baseNicknameClass, "text-gradient-unity");
                    else if (categoryToConsiderForStyle === 'Unreal') nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal");
                    else if (categoryToConsiderForStyle === 'Godot') nicknameClasses = cn(baseNicknameClass, "text-gradient-godot");
                    else if (categoryToConsiderForStyle === 'General') nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow");
                }
            }
        }
    }
    
    // Context-specific overrides for default styling
    if (context === 'header' || context === 'profileCard') {
        wrapperClasses = ""; // No wrapper in header or profile card main display
        if(context === 'header') {
            titleText = null; // No title in header
            showLogoCategory = null; // No logo in header
        }
    }
    if (!titleText) titleClasses = ""; // Ensure titleClasses is empty if no titleText

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
    "inline-flex flex-col items-center leading-tight", // Ensure items-center for title and nickname block
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

    