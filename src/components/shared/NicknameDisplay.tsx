
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
    const baseNicknameClass = "text-sm font-medium"; // 기본 닉네임 스타일 (font-medium)
    const baseTitleClass = "title-text-base"; // from globals.css (text-xs font-semibold)

    let titleText: string | null = null;
    let titleClasses: string = "";
    let nicknameClasses: string = cn(baseNicknameClass, "text-foreground"); // 기본값
    let wrapperClasses: string = "";
    let showLogoCategory: PostMainCategory | null = null;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogoCategory, nickname: "Unknown User", isAdmin: false };

    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null, titleClasses: "", nicknameClasses: cn(baseNicknameClass, "admin-text", "font-bold"), // 관리자 텍스트는 이미 globals.css에서 font-semibold 처리, 여기서 font-bold로 강화
        wrapperClasses: "admin-badge", showLogoCategory: null, nickname: user.nickname, isAdmin: true,
      };
    }
    
    // 사용자 선택 우선 처리 (testwang1 포함)
    const { selectedTitleIdentifier, selectedNicknameEffectIdentifier, selectedLogoIdentifier } = user;
    const hasSpecificSelection = selectedTitleIdentifier !== 'none' || selectedNicknameEffectIdentifier !== 'none' || selectedLogoIdentifier !== 'none';

    if (user.username === 'testwang1' || hasSpecificSelection) {
        // 1. Apply Title from selectedTitleIdentifier
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

        // 2. Apply Nickname Effect (Text & Wrapper) from selectedNicknameEffectIdentifier
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
                
                const applyWrapper = tierEffect === '1-3_effect' || tierEffect === '4-10_effect';
                const isTextEffectOnly = tierEffect === '11-20_effect';
                
                let categoryTextGradientClass = "";
                let categoryWrapperClass = "";

                if (cat === 'Unity') { categoryTextGradientClass = "text-gradient-unity"; if(applyWrapper) categoryWrapperClass = "bg-wrapper-unity"; }
                else if (cat === 'Unreal') { categoryTextGradientClass = "text-gradient-unreal"; if(applyWrapper) categoryWrapperClass = "bg-wrapper-unreal"; }
                else if (cat === 'Godot') { categoryTextGradientClass = "text-gradient-godot"; if(applyWrapper) categoryWrapperClass = "bg-wrapper-godot"; }
                else if (cat === 'General') { categoryTextGradientClass = "text-gradient-general-rainbow"; if(applyWrapper) categoryWrapperClass = "bg-wrapper-general-rainbow"; }
                
                nicknameClasses = cn(baseNicknameClass, categoryTextGradientClass); // 기본적으로 font-semibold가 그라데이션 클래스에 있음
                if (applyWrapper || isTextEffectOnly) { // 카테고리 효과는 기본적으로 font-semibold 유지 (요청 시 변경 가능)
                     wrapperClasses = categoryWrapperClass; // 11-20위는 wrapper X (categoryWrapperClass가 ""임)
                }

            } else if (selectedNicknameEffectIdentifier.startsWith('tetris_')) {
                const rank = parseInt(selectedNicknameEffectIdentifier.split('_')[1]);
                // 테트리스 닉네임 효과는 텍스트 그라데이션만 (font-semibold 유지), 래퍼 없음
                if (rank === 1) nicknameClasses = cn(baseNicknameClass, "text-gradient-gold");
                else if (rank === 2) nicknameClasses = cn(baseNicknameClass, "text-gradient-silver");
                else if (rank === 3) nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze");
            }
        } else { // selectedNicknameEffectIdentifier === 'none'
            nicknameClasses = cn(baseNicknameClass, "text-foreground"); // 명시적으로 'none'이면 기본 스타일
        }


        // 3. Apply Logo from selectedLogoIdentifier
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
    
    // Default Rank-Based Styling (applies if user is not testwang1 AND all selected preferences are 'none')
    // 순서: 종합 랭킹 > 테트리스 랭킹 > 카테고리 랭킹
    if (user.rank > 0 && user.rank <= 3) { // Global Rank
        if (user.rank === 1) { nicknameClasses = cn(baseNicknameClass, "text-gradient-gold", "font-bold"); wrapperClasses = "bg-wrapper-gold"; }
        else if (user.rank === 2) { nicknameClasses = cn(baseNicknameClass, "text-gradient-silver", "font-bold"); wrapperClasses = "bg-wrapper-silver"; }
        else if (user.rank === 3) { nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze", "font-bold"); wrapperClasses = "bg-wrapper-bronze"; }
    } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) { // Tetris Rank
        const rank = user.tetrisRank;
        titleText = tetrisTitles[rank] || `테트리스 ${rank}위`;
        if (rank === 1) { titleClasses = cn(baseTitleClass, "text-gradient-gold"); nicknameClasses = cn(baseNicknameClass, "text-gradient-gold"); }
        else if (rank === 2) { titleClasses = cn(baseTitleClass, "text-gradient-silver"); nicknameClasses = cn(baseNicknameClass, "text-gradient-silver"); }
        else if (rank === 3) { titleClasses = cn(baseTitleClass, "text-gradient-bronze"); nicknameClasses = cn(baseNicknameClass, "text-gradient-bronze"); }
    } else { // Category Rank (컨텍스트에 따라 적용)
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
                }

                if (catRank <= 10) { // 1-10위는 래퍼 + 텍스트 효과
                    const applyWrapper = true; 
                    if (categoryToConsiderForStyle === 'Unity') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unity"); if(applyWrapper) wrapperClasses = "bg-wrapper-unity"; }
                    else if (categoryToConsiderForStyle === 'Unreal') { nicknameClasses = cn(baseNicknameClass, "text-gradient-unreal"); if(applyWrapper) wrapperClasses = "bg-wrapper-unreal"; }
                    else if (categoryToConsiderForStyle === 'Godot') { nicknameClasses = cn(baseNicknameClass, "text-gradient-godot"); if(applyWrapper) wrapperClasses = "bg-wrapper-godot"; }
                    else if (categoryToConsiderForStyle === 'General') { nicknameClasses = cn(baseNicknameClass, "text-gradient-general-rainbow"); if(applyWrapper) wrapperClasses = "bg-wrapper-general-rainbow"; }
                } else if (catRank <= 20) { // 11-20위는 텍스트 효과만
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
    displayInfo.wrapperClasses 
  );

  const finalNicknameContainerClasses = cn(
    "flex items-center", 
    displayInfo.showLogoCategory ? "gap-1" : ""
  );

  if (displayInfo.isAdmin) {
    return (
      <span className={cn(displayInfo.wrapperClasses, "inline-flex items-center gap-1")}>
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className={displayInfo.nicknameClasses}>{displayInfo.nickname}</span>
      </span>
    );
  }

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
    
