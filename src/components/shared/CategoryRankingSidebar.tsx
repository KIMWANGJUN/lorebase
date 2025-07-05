
import React from 'react';
import type { Ranking } from '@/types'; // RankingI 대신 Ranking 타입 사용
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';

interface CategoryRankingSidebarProps {
  rankings: Ranking[];
}

export default function CategoryRankingSidebar({ rankings }: CategoryRankingSidebarProps) {
  if (!rankings || rankings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>카테고리 랭킹</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">랭킹 정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {rankings.map((ranking) => (
        <Card key={ranking.category}>
          <CardHeader>
            <CardTitle className="text-lg">{ranking.category} 랭킹</CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.entries.length > 0 ? (
              <ul className="space-y-3">
                {ranking.entries.slice(0, 5).map((entry, index) => (
                  <li key={entry.userId} className="flex items-center gap-3">
                    <span className="font-bold text-lg w-5 text-center">
                      {index === 0 ? <Crown className="w-5 h-5 text-yellow-500" /> : entry.rank}
                    </span>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={entry.avatar} alt={entry.nickname} />
                      <AvatarFallback>{entry.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold truncate">{entry.nickname}</p>
                      <p className="text-sm text-muted-foreground">{entry.score.toLocaleString()}점</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">아직 랭커가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
