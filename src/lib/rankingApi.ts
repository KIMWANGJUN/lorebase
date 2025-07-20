
// src/lib/rankingApi.ts
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
export async function getRankings(): Promise<Ranking[]> {
  try {
    const categories: PostMainCategory[] = ['Unity', 'Unreal', 'Godot', 'General'];
    
    const overallPromise = fetchTopUsers('score', 5);
    const categoryPromises = categories.map(category => 
      fetchTopUsers(`categoryStats.${category}.score`, 3)
    );

    const [overallEntries, ...categoryEntries] = await Promise.all([overallPromise, ...categoryPromises]);

    const rankings: Ranking[] = [
      {
        category: 'Overall',
        entries: overallEntries,
      },
      ...categories.map((category, index) => ({
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
        
        return querySnapshot.docs.map((doc, index) => ({
            userId: doc.id,
            ...doc.data(),
            rank: index + 1
        } as TetrisRanker));
    } catch (error) {
        console.error("Error fetching Tetris rankers:", error);
        return [];
    }
}
