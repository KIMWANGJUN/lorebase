
// src/components/shared/NicknameDisplay.tsx
"use client";

import type { User, PostMainCategory, AchievedRankType } from '@/types';
import { tetrisTitles } from '@/lib/mockData'; 
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { Box, AppWindow, PenTool, LayoutGrid, ShieldCheck } from 'lucide-react';

interface NicknameDisplayProps {
  user: User;
  context?: 'postAuthor' | 'commentAuthor' | 'rankingList' | 'sidebarRanking' | 'header';
  activeCategory?: PostMainCategory; // For sidebar or category-specific views
  postMainCategoryForAuthor?: PostMainCategory; // For post author in post detail view
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
    let showLogo: PostMainCategory | null = null;
    let appliedStyle = false;

    if (!user) return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogo, nickname: "Unknown User", isAdmin: false };

    const applyGlobalRankStyle = (rank: number) => {
        if (rank === 1) { nicknameClasses = "text-gradient-gold"; wrapperClasses = "bg-wrapper-gold"; }
        else if (rank === 2) { nicknameClasses = "text-gradient-silver"; wrapperClasses = "bg-wrapper-silver"; }
        else if (rank === 3) { nicknameClasses = "text-gradient-bronze"; wrapperClasses = "bg-wrapper-bronze"; }
        titleText = null; 
    };
    
    const applyTetrisRankStyle = (rank: number, gameName: string = "테트리스") => {
        if (rank === 1) { titleText = `♛${gameName}♕`; titleClasses = "text-gradient-gold title-text-base"; nicknameClasses = "text-gradient-gold"; }
        else if (rank === 2) { titleText = `"${gameName}" 그랜드 마스터`; titleClasses = "text-gradient-silver title-text-base"; nicknameClasses = "text-gradient-silver"; }
        else if (rank === 3) { titleText = `"${gameName}" 마스터`; titleClasses = "text-gradient-bronze title-text-base"; nicknameClasses = "text-gradient-bronze"; }
        wrapperClasses = ""; 
    };

    const applyCategoryRankStyle = (category: PostMainCategory, rank: number) => {
        showLogo = category;
        if (rank >= 1 && rank <= 3) {
            titleText = getCategoryDisplayName(category);
            if (rank === 1) titleClasses = "text-gradient-gold title-text-base";
            else if (rank === 2) titleClasses = "text-gradient-silver title-text-base";
            else if (rank === 3) titleClasses = "text-gradient-bronze title-text-base";
        } else {
            titleText = null;
        }

        if (rank >= 1 && rank <= 10) { // Nickname and Wrapper for 1-10
            if (category === 'Unity') { nicknameClasses = "text-gradient-unity"; wrapperClasses = "bg-wrapper-unity"; }
            else if (category === 'Unreal') { nicknameClasses = "text-gradient-unreal"; wrapperClasses = "bg-wrapper-unreal"; }
            else if (category === 'Godot') { nicknameClasses = "text-gradient-godot"; wrapperClasses = "bg-wrapper-godot"; }
            else if (category === 'General') { nicknameClasses = "text-gradient-general-rainbow"; wrapperClasses = "bg-wrapper-general-rainbow"; }
        } else if (rank >= 11 && rank <= 20) { // Text only for 11-20
             if (category === 'Unity') nicknameClasses = "text-gradient-unity";
             else if (category === 'Unreal') nicknameClasses = "text-gradient-unreal";
             else if (category === 'Godot') nicknameClasses = "text-gradient-godot";
             else if (category === 'General') nicknameClasses = "text-gradient-general-rainbow";
            wrapperClasses = ""; 
        }
    };
    
    // 테스트 계정 특별 처리
    if (user.username === 'testwang1') {
        const selected = user.selectedDisplayRank || 'default';
        appliedStyle = true; // 테스트 계정은 항상 이 블록에서 스타일이 결정됨

        if (selected.startsWith('global_')) {
            applyGlobalRankStyle(parseInt(selected.split('_')[1]));
        } else if (selected.startsWith('tetris_')) {
            const rank = parseInt(selected.split('_')[1]);
            // tetrisTitles에서 실제 게임 이름을 가져오거나, 기본값 사용
            const gameTitle = tetrisTitles[rank] ? tetrisTitles[rank].replace(/♛|♕|"/g, '').split(' ')[0] : "테트리스";
            applyTetrisRankStyle(rank, gameTitle);
        } else if (selected.startsWith('category_')) {
            const parts = selected.split('_');
            const cat = parts[1] as PostMainCategory;
            const tier = parts[2]; // "1-3", "4-10", "11-20"
            let representativeRank = 0;
            if (tier === "1-3") representativeRank = 1;
            else if (tier === "4-10") representativeRank = 4;
            else if (tier === "11-20") representativeRank = 11;
            
            if (representativeRank > 0) {
                applyCategoryRankStyle(cat, representativeRank);
            } else { // 안전장치
                nicknameClasses = "text-sm font-medium text-foreground";
            }
        } else { // 'default' 또는 기타 선택
            nicknameClasses = "text-sm font-medium text-foreground";
            titleText = null; wrapperClasses = ""; showLogo = null;
        }
        return { titleText, titleClasses, nicknameClasses, wrapperClasses, showLogo, nickname: user.nickname, isAdmin: false };
    }


    if (user.username === 'WANGJUNLAND') {
      return {
        titleText: null, titleClasses: "", nicknameClasses: "admin-text text-sm",
        wrapperClasses: "admin-badge", showLogo: null, nickname: user.nickname, isAdmin: true,
      };
    }

    const currentSelectedRank = user.selectedDisplayRank || 'default';

    if (currentSelectedRank !== 'default') {
      const [type, ...rest] = currentSelectedRank.split('_') as [string, string, string?];
      const rankOrCategory = rest[0];
      const rankNum = parseInt(rankOrCategory);

      if (type === 'global' && user.rank === rankNum && rankNum <=3) {
        applyGlobalRankStyle(rankNum); appliedStyle = true;
      } else if (type === 'tetris' && user.tetrisRank && user.tetrisRank === rankNum && rankNum <=3) {
        applyTetrisRankStyle(rankNum, tetrisTitles[rankNum]?.replace(/♛|♕|"/g, '').split(' ')[0] || "테트리스"); appliedStyle = true;
      } else if (type === 'category') {
        const cat = rankOrCategory as PostMainCategory;
        const tier = rest[1]; 
        const userCatRank = user.categoryStats?.[cat]?.rankInCate;
        if (userCatRank) {
            if ((tier === "1-3" && userCatRank >= 1 && userCatRank <= 3) ||
              (tier === "4-10" && userCatRank >= 4 && userCatRank <= 10) ||
              (tier === "11-20" && userCatRank >= 11 && userCatRank <= 20)) {
              applyCategoryRankStyle(cat, userCatRank); appliedStyle = true;
            }
        }
      }
    }

    if (!appliedStyle) {
      if (user.rank > 0 && user.rank <= 3) {
        applyGlobalRankStyle(user.rank);
      } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <= 3) {
        applyTetrisRankStyle(user.tetrisRank, tetrisTitles[user.tetrisRank]?.replace(/♛|♕|"/g, '').split(' ')[0] || "테트리스");
      } else {
        const categoryForContext = activeCategory || postMainCategoryForAuthor;
        let styledByCategoryContext = false;

        if (categoryForContext) {
          const catRank = user.categoryStats?.[categoryForContext]?.rankInCate;
          if (catRank && catRank > 0 && catRank <= 20) {
            applyCategoryRankStyle(categoryForContext, catRank);
            styledByCategoryContext = true;
          }
        }
        
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
    
    if (context === 'header') {
        wrapperClasses = ""; 
        if (nicknameClasses.includes("gradient") || nicknameClasses.includes("rank-")) {
            if (user.rank > 0 && user.rank <=3) {
                 if(user.rank === 1) nicknameClasses = "text-gradient-gold";
                 else if(user.rank === 2) nicknameClasses = "text-gradient-silver";
                 else nicknameClasses = "text-gradient-bronze";
            } else if (user.tetrisRank && user.tetrisRank > 0 && user.tetrisRank <=3) {
                 if(user.tetrisRank === 1) nicknameClasses = "text-gradient-gold";
                 else if(user.tetrisRank === 2) nicknameClasses = "text-gradient-silver";
                 else nicknameClasses = "text-gradient-bronze";
            }
            else nicknameClasses = "text-foreground"; // Fallback for other gradient cases in header
        }
        nicknameClasses = cn(nicknameClasses, "text-sm font-medium");
        titleText = null; 
        showLogo = null; 
    }

    if (!nicknameClasses.includes("text-sm") && !nicknameClasses.includes("text-xs")) {
        nicknameClasses = cn("text-sm font-medium", nicknameClasses);
    } else {
        nicknameClasses = cn("font-medium", nicknameClasses); 
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
    displayInfo.wrapperClasses 
  );

  const finalNicknameContainerClasses = cn(
    "flex items-center",
    displayInfo.showLogo ? "gap-1" : "" 
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
