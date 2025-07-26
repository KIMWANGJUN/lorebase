// src/components/shared/IntegratedRankingPanel.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, Gamepad2, Trophy, Users, ChevronLeft, ChevronRight,
  Award
} from 'lucide-react';
import type { RankEntry, Ranking, TetrisRanker } from '@/types';

interface IntegratedRankingPanelProps {
  globalRankings: RankEntry[];
  categoryRankings: Ranking[];
  tetrisRankings: TetrisRanker[];
  loading: boolean;
}

type RankingTab = 'tetris' | 'global' | 'unity' | 'unreal' | 'godot';

const IntegratedRankingPanel: React.FC<IntegratedRankingPanelProps> = ({
  globalRankings,
  categoryRankings,
  tetrisRankings,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<RankingTab>('tetris');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = [
    { id: 'tetris' as RankingTab, label: '테트리스', icon: Gamepad2, color: 'text-watercolor-primary' },
    { id: 'global' as RankingTab, label: '전체', icon: Crown, color: 'text-watercolor-secondary' },
    { id: 'unity' as RankingTab, label: 'Unity', icon: Trophy, color: 'text-watercolor-accent' },
    { id: 'unreal' as RankingTab, label: 'Unreal', icon: Trophy, color: 'text-watercolor-primary' },
    { id: 'godot' as RankingTab, label: 'Godot', icon: Trophy, color: 'text-watercolor-secondary' }
  ];

  const getCurrentRankingData = () => {
    switch (activeTab) {
      case 'tetris':
        return tetrisRankings.map(ranker => ({
          rank: ranker.rank,
          nickname: ranker.nickname,
          score: ranker.score,
          avatar: ranker.avatar,
          userId: ranker.userId
        }));
      case 'global':
        return globalRankings;
      case 'unity':
      case 'unreal':
      case 'godot':
        const categoryRanking = categoryRankings.find(r => 
          r.category.toLowerCase() === activeTab.toLowerCase()
        );
        return categoryRanking ? categoryRanking.entries : [];
      default:
        return [];
    }
  };

  const currentData = getCurrentRankingData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = currentData.slice(startIndex, endIndex);

  const handleTabChange = (tab: RankingTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Award className="h-4 w-4 text-watercolor-primary" />;
    if (rank === 2) return <Award className="h-4 w-4 text-watercolor-secondary" />;
    if (rank === 3) return <Award className="h-4 w-4 text-watercolor-accent" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-watercolor-primary to-watercolor-accent text-white';
    if (rank === 2) return 'bg-gradient-to-r from-watercolor-secondary to-watercolor-primary/70 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-watercolor-accent to-watercolor-secondary/70 text-white';
    return 'bg-watercolor-surface border border-watercolor-border text-watercolor-text';
  };

  if (loading) {
    return (
      <Card className="watercolor-card">
        <CardHeader>
          <CardTitle className="text-lg">랭킹</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-watercolor-surface"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 mb-1 bg-watercolor-surface rounded"></div>
                  <div className="h-3 w-16 bg-watercolor-surface rounded"></div>
                </div>
                <div className="h-4 w-12 bg-watercolor-surface rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="watercolor-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-watercolor-primary" />
          <span className="watercolor-text-gradient">랭킹</span>
        </CardTitle>
        
        {/* 탭 메뉴 */}
        <div className="flex flex-wrap gap-1 mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange(tab.id)}
                className={`text-xs ${
                  activeTab === tab.id
                    ? 'bg-watercolor-primary/20 text-watercolor-primary border-watercolor-primary/50'
                    : 'text-watercolor-muted hover:text-watercolor-text border-watercolor-border/50'
                }`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {currentPageData.length > 0 ? (
          <>
            <div className="space-y-2">
              {currentPageData.map((user, index) => {
                const actualRank = startIndex + index + 1;
                return (
                  <div 
                    key={`${user.userId}-${actualRank}`} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-watercolor-primary/5 watercolor-transition"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold watercolor-transition ${getRankStyle(actualRank)}`}>
                      {actualRank}
                    </div>
                    
                    {'avatar' in user && (
                      <Avatar className="h-7 w-7 border border-watercolor-border">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-watercolor-accent/20 text-watercolor-text text-xs">
                          {user.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-watercolor-text">
                        {user.nickname}
                      </p>
                      <p className="text-xs text-watercolor-muted">
                        {user.score.toLocaleString()} 점
                      </p>
                    </div>
                    
                    {actualRank <= 3 && getRankIcon(actualRank)}
                  </div>
                );
              })}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-watercolor-border/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-xs border-watercolor-border/50"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  이전
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-7 h-7 text-xs p-0 ${
                          currentPage === pageNum
                            ? 'bg-watercolor-primary/20 text-watercolor-primary border-watercolor-primary/50'
                            : 'border-watercolor-border/50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-xs border-watercolor-border/50"
                >
                  다음
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
            
            <div className="text-xs text-watercolor-muted text-center mt-2">
              {startIndex + 1}-{Math.min(endIndex, currentData.length)} / {currentData.length}
            </div>
          </>
        ) : (
          <p className="text-watercolor-muted text-sm text-center py-8">
            {activeTab === 'tetris' ? '테트리스 랭킹이' : 
             activeTab === 'global' ? '전체 랭킹이' : 
             `${activeTab.toUpperCase()} 랭킹이`} 없습니다
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegratedRankingPanel;
