import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { User, Ranking, RankEntry, PostMainCategory, TetrisRanker } from '@/types';

const fetchTopUsers = async (
  orderByField: string,
  limitCount: number
): Promise<RankEntry[]> => {
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, orderBy(orderByField, 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc, index) => {
    const user = doc.data() as User;
    return {
      userId: doc.id,
      nickname: user.nickname,
      score: user.score,
      rank: index + 1,
      avatar: user.avatar || '/default-avatar.webp',
    };
  });
};

/**
 * Fetches overall and category-specific rankings from Firestore.
 * @returns A promise that resolves to an array of Ranking objects.
 */
export async function getRankings(channelCategories?: PostMainCategory[]): Promise<Ranking[]> {
  try {
    // 기본 카테고리를 소문자로 수정
    const categoriesToFetch: PostMainCategory[] = channelCategories && channelCategories.length > 0 
      ? channelCategories 
      : ['unity', 'unreal', 'godot', 'general'];
    
    const overallPromise = fetchTopUsers('score', 5);
    const categoryPromises = categoriesToFetch.map(category => 
      fetchTopUsers(`categoryStats.${category}.score`, 3)
    );

    const [overallEntries, ...categoryEntries] = await Promise.all([overallPromise, ...categoryPromises]);

    const rankings: Ranking[] = [
      {
        category: 'Overall',
        entries: overallEntries,
      },
      ...categoriesToFetch.map((category, index) => ({
        category: category,
        entries: categoryEntries[index],
      }))
    ];

    return rankings;

  } catch (error) {
    console.error("Error fetching rankings:", error);
    return [];
  }
}

export async function getCommunityRankers(options: { category: string, limit: number }): Promise<User[]> {
    console.log(`Fetching ${options.limit} community rankers for ${options.category}`);
    // This is a placeholder. You'll need to implement the actual logic
    // based on your community ranking criteria.
    return []; 
}

/**
 * Fetches top Tetris rankers from Firestore.
 * @param options An object with a 'limit' property.
 * @returns A promise that resolves to an array of TetrisRanker objects.
 */
export async function getTetrisRankers(options: { limit: number }): Promise<TetrisRanker[]> {
    try {
        const rankersCollection = collection(db, 'tetris-rankings');
        const q = query(rankersCollection, orderBy('score', 'desc'), limit(options.limit));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                userId: doc.id,
                nickname: data.nickname,
                score: data.score,
                rank: index + 1
            } as TetrisRanker;
        });
    } catch (error) {
        console.error("Error fetching Tetris rankers:", error);
        return [];
    }
}

/**
 * 카테고리별 상위 사용자를 가져오는 헬퍼 함수
 * @param category 카테고리
 * @param limit 제한 수
 * @returns RankEntry 배열
 */
export async function getCategoryRanking(category: PostMainCategory, limit: number = 5): Promise<RankEntry[]> {
    try {
        return await fetchTopUsers(`categoryStats.${category}.score`, limit);
    } catch (error) {
        console.error(`Error fetching ${category} category ranking:`, error);
        return [];
    }
}

/**
 * 전체 랭킹을 가져오는 헬퍼 함수
 * @param limit 제한 수
 * @returns RankEntry 배열
 */
export async function getOverallRanking(limit: number = 10): Promise<RankEntry[]> {
    try {
        return await fetchTopUsers('score', limit);
    } catch (error) {
        console.error("Error fetching overall ranking:", error);
        return [];
    }
}
