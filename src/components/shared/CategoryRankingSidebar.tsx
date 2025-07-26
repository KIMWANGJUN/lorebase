// CategoryRankingSidebar.tsx의 상단 타입 정의 부분을 다음과 같이 수정:

import { Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PostMainCategory, Ranking } from '@/types'; // 이미 정의된 타입 사용

// 기존 RankingEntry 인터페이스를 제거하고 다음으로 교체:
interface CategoryRankingSidebarProps {
  rankings: Ranking[];
}

// getChannelByCategory 함수 (임시)
const getChannelByCategory = (category: PostMainCategory) => {
  const categoryNames = {
    unity: 'Unity',
    unreal: 'Unreal', 
    godot: 'Godot',
    general: '일반'
  };
  return { name: categoryNames[category] };
};

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
      {rankings.map((ranking) => {
        const channel = getChannelByCategory(ranking.category as PostMainCategory);
        const displayTitle = ranking.category === 'Overall' ? '전체 랭킹' : channel?.name || ranking.category;

        return (
          <Card key={ranking.category}>
            <CardHeader>
              <CardTitle className="text-lg">{displayTitle} 랭킹</CardTitle>
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
                        <AvatarImage src={entry.avatar || ''} alt={entry.nickname} />
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
        );
      })}
    </div>
  );
}
