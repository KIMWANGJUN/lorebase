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
    const baseNicknameClass = "text-sm font-medium"; 
    const baseTitleClass = "title-text-base"; 

    let titleText: string | null = null;
    let titleClasses: string = "";
    let nicknameClasses: string = cn(baseNicknameClass, "text-foreground"); 
    let wrapperClasses: string = "";
    let showLogoCategory: PostMainCategory | null = null;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: "Unknown User", isAdmin: false };

    if (user.username === 'WANGJUNLAND') {
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
    const hasSpecificSelection = selectedTitleIdentifier !== 'none' || selectedNicknameEffectIdentifier !== 'none' || selectedLogoIdentifier !== 'none';

    if (user.username === 'testwang1' || hasSpecificSelection) {
        if (selectedTitleIdentifier && selectedTitleIdentifier !== 'none') {
            if (selectedTitleIdentifier.startsWith('tetris_')) {
                const rank = parseInt(selectedTitleIdentifier.split('_')[1]);
                if (rank >= 1 && rank <= 3) {
                    titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
                    if (rank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                    else if (rank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                    else if (rank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
                }
            } else if (selectedTitleIdentifier.startsWith('category_')) {
                const parts = selectedTitleIdentifier.split('_'); 
                const cat = parts[1] as PostMainCategory;
                const rankPart = parts[2]; 
                if (rankPart && (rankPart === "1" || rankPart === "2" || rankPart === "3")) {
                    const rank = parseInt(rankPart);
                    titleText = `${getCategoryDisplayName(cat)} ${rank}위`;
                    if (rank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                    else if (rank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                    else if (rank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
                }
            }
            if (!titleText) titleClasses = ""; 
        }

        if (selectedNicknameEffectIdentifier && selectedNicknameEffectIdentifier !== 'none') {
            if (selectedNicknameEffectIdentifier.startsWith('global_')) {
                const rank = parseInt(selectedNicknameEffectIdentifier.split('_')[1]);
                if (rank === 1) { nicknameClasses = cn(baseNicknameClass, "text-gradient-gold", "font-bold"); wrapperClasses = "bg-wrapper-gold"; }
                else if (rank === 2) { nicknameClasses = cn(baseNicknameClass, "text-gradient-silver", "font-bold"); wrapperClasses = "bg-wrapper-silver"; }
                else if (rank === 3) { nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze", "font-bold"); wrapperClasses = "bg-wrapper-bronze"; }
            } else if (selectedNicknameEffectIdentifier.startsWith('category_')) {
                const parts = selectedNicknameEffectIdentifier.split('_'); 
                const cat = parts[1] as PostMainCategory;
                const tierEffect = parts[2] + (parts[3] ? `_${parts[3]}` : ""); 
                
                let categoryTextGradientClass = "";
                let categoryWrapperClass = "";

                if (cat === 'Unity') { 
                    categoryTextGradientClass = "text-gradient-unity"; 
                    if (tierEffect === '1-3_effect') categoryWrapperClass = "bg-wrapper-unity-top";
                    else if (tierEffect === '4-10_effect') categoryWrapperClass = "bg-wrapper-unity";
                } else if (cat === 'Unreal') { 
                    categoryTextGradientClass = "text-gradient-unreal"; 
                    if (tierEffect === '1-3_effect') categoryWrapperClass = "bg-wrapper-unreal-top";
                    else if (tierEffect === '4-10_effect') categoryWrapperClass = "bg-wrapper-unreal";
                } else if (cat === 'Godot') { 
                    categoryTextGradientClass = "text-gradient-godot"; 
                    if (tierEffect === '1-3_effect') categoryWrapperClass = "bg-wrapper-godot-top";
                    else if (tierEffect === '4-10_effect') categoryWrapperClass = "bg-wrapper-godot";
                } else if (cat === 'General') { 
                    categoryTextGradientClass = "text-gradient-general-rainbow"; 
                    if (tierEffect === '1-3_effect') categoryWrapperClass = "bg-wrapper-general-rainbow";
                    else if (tierEffect === '4-10_effect') categoryWrapperClass = "bg-wrapper-general-mid";
                }
                
                nicknameClasses = cn(baseNicknameClass, categoryTextGradientClass);
                if (tierEffect === '1-3_effect' || tierEffect === '4-10_effect') {
                     wrapperClasses = categoryWrapperClass;
                }
            } else if (selectedNicknameEffectIdentifier.startsWith('tetris_')) {
                const rank = parseInt(selectedNicknameEffectIdentifier.split('_')[1]);
                if (rank === 1) nicknameClasses = cn(baseNicknameClass, "text-gradient-gold");
                else if (rank === 2) nicknameClasses = cn(baseNicknameClass, "text-gradient-silver");
                else if (rank === 3) nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze");
            }
        } else { 
            nicknameClasses = cn(baseNicknameClass, "text-foreground"); 
        }

        if (selectedLogoIdentifier && selectedLogoIdentifier !== 'none') {
            if (selectedLogoIdentifier.startsWith('logo_')) {
                showLogoCategory = selectedLogoIdentifier.split('_')[1] as PostMainCategory;
            }
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
    }
    
    // Default Rank-Based Styling
    if (user.rank > 0 && user.rank <= 3) { 
        if (user.rank === 1) { nicknameClasses = cn(baseNicknameClass, "text-gradient-gold", "font-bold"); wrapperClasses = "bg-wrapper-gold"; }
        else if (user.rank === 2) { nicknameClasses = cn(baseNicknameClass, "text-gradient-silver", "font-bold"); wrapperClasses = "bg-wrapper-silver"; }
        else if (user.rank === 3) { nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze", "font-bold"); wrapperClasses = "bg-wrapper-bronze"; }
    } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) { 
        const rank = user.tetrisRank;
        titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
        if (rank === 1) { titleClasses = cn(baseTitleClass, "text-gradient-gold"); nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); }
        else if (rank === 2) { titleClasses = cn(baseTitleClass, "text-gradient-silver"); nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); }
        else if (rank === 3) { titleClasses = cn(baseTitleClass, "text-gradient-bronze"); nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); }
    } else { 
        const categoryToConsiderForStyle = activeCategory || postMainCategoryForAuthor;
        if (categoryToConsiderForStyle && user.categoryStats?.[categoryToConsiderForStyle]) {
            const catStat = user.categoryStats[categoryToConsiderForStyle]!;
            const catRank = catStat.rankInCate || 0;

            if (catRank > 0 && catRank <= 20) {
                showLogoCategory = categoryToConsiderForStyle;

                if (catRank <= 3) { 
                    titleText = `${getCategoryDisplayName(categoryToConsiderForStyle)} ${catRank}위`;
                    if (catRank === 1) titleClasses = cn(baseTitleClass, "text-gradient-gold");
                    else if (catRank === 2) titleClasses = cn(baseTitleClass, "text-gradient-silver");
                    else if (catRank === 3) titleClasses = cn(baseTitleClass, "text-gradient-bronze");
                    
                    if (categoryToConsiderForStyle === 'Unity') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); wrapperClasses = "bg-wrapper-unity-top"; }
                    else if (categoryToConsiderForStyle === 'Unreal') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); wrapperClasses = "bg-wrapper-unreal-top"; }
                    else if (categoryToConsiderForStyle === 'Godot') { nicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); wrapperClasses = "bg-wrapper-godot-top"; }
                    else if (categoryToConsiderForStyle === 'General') { nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); wrapperClasses = "bg-wrapper-general-rainbow"; }
                } else if (catRank <= 10) { 
                    if (categoryToConsiderForStyle === 'Unity') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); wrapperClasses = "bg-wrapper-unity"; }
                    else if (categoryToConsiderForStyle === 'Unreal') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); wrapperClasses = "bg-wrapper-unreal"; }
                    else if (categoryToConsiderForStyle === 'Godot') { nicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); wrapperClasses = "bg-wrapper-godot"; }
                    else if (categoryToConsiderForStyle === 'General') { nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); wrapperClasses = "bg-wrapper-general-mid"; }
                } else if (catRank <= 20) { 
                    if (categoryToConsiderForStyle === 'Unity') nicknameClasses = cn(baseNicknameClass, "text-gradient-unity");
                    else if (categoryToConsiderForStyle === 'Unreal') nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal");
                    else if (categoryToConsiderForStyle === 'Godot') nicknameClasses = cn(baseNicknameClass, "text-gradient-godot");
                    else if (categoryToConsiderForStyle === 'General') nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow");
                }
            }
        }
    }
    
    if (context === 'header' || context === 'profileCard') {
        wrapperClasses = ""; 
        if(context === 'header') {
            titleText = null; titleClasses = "";
            showLogoCategory = null;
        }
    }
    if (!titleText) titleClasses = "";

    return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: user.nickname, isAdmin: false };
  }, [user, user.selectedTitleIdentifier, user.selectedNicknameEffectIdentifier, user.selectedLogoIdentifier, activeCategory, postMainCategoryForAuthor, context]);

  const finalWrapperClasses = cn(
    "inline-flex flex-col items-center leading-tight",
    displayInfo.wrapperClasses,
    // 헤더에서 블러 제거
    context === 'header' && "header-text-clear"
  );

  const finalNicknameContainerClasses = cn(
    "flex items-center", 
    displayInfo.showLogoCategory ? "gap-1" : "",
    // 헤더에서 블러 제거
    context === 'header' && "header-text-clear"
  );

  if (displayInfo.isAdmin) {
    return (
      <span className={cn(
        displayInfo.wrapperClasses, 
        "inline-flex items-center gap-1",
        context === 'header' && "header-text-clear"
      )}>
        <ShieldCheck className={cn(
          "h-4 w-4 text-primary",
          context === 'header' && "header-text-clear"
        )} />
        <span className={cn(
          displayInfo.nicknameClasses,
          context === 'header' && "header-text-clear"
        )}>{displayInfo.nickname}</span>
      </span>
    );
  }

  return (
    <div className={finalWrapperClasses}>
      {displayInfo.titleText && (
        <span className={cn(
          "title-on-nickname-wrapper",
          context === 'header' && "header-text-clear"
        )}> 
            <span className={cn(
              displayInfo.titleClasses,
              context === 'header' && "header-text-clear"
            )}>
                {displayInfo.titleText}
            </span>
        </span>
      )}
      <div className={finalNicknameContainerClasses}> 
        {displayInfo.showLogoCategory && <CategoryIcon category={displayInfo.showLogoCategory} className={cn(
          "h-3.5 w-3.5",
          context === 'header' && "header-text-clear"
        )} />}
        <span className={cn(
          displayInfo.nicknameClasses,
          context === 'header' && "header-text-clear"
        )}> 
          {displayInfo.nickname}
        </span>
      </div>
    </div>
  );
}
