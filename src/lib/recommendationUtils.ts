// src/lib/recommendationUtils.ts
import { mockPosts } from './mockData'; // To update mockPosts directly
import type { Post } from '@/types';

const getStorageKey = (userId: string | undefined) => {
  if (!userId) return null;
  return `recommendedPosts_${userId}`;
};

export const getAllUserRecommendations = (userId: string | undefined): { [postId: string]: boolean } => {
  if (typeof window === 'undefined' || !userId) return {};
  const storageKey = getStorageKey(userId);
  if (!storageKey) return {};
  return JSON.parse(localStorage.getItem(storageKey) || '{}');
};

export const hasUserRecommended = (postId: string, userId: string | undefined): boolean => {
  if (typeof window === 'undefined' || !userId) return false;
  const recommendations = getAllUserRecommendations(userId);
  return !!recommendations[postId];
};

// Returns the new recommendation status (true if recommended, false if not)
// Also updates mockPosts directly for this mock environment
export const toggleUserRecommendation = (postId: string, userId: string | undefined): { newStatus: boolean; newUpvotes: number } | null => {
  if (typeof window === 'undefined' || !userId) return null;

  const recommendations = getAllUserRecommendations(userId);
  const postIndex = mockPosts.findIndex(p => p.id === postId);
  if (postIndex === -1) return null;

  const currentStatus = !!recommendations[postId];
  const newStatus = !currentStatus;
  let newUpvotes = mockPosts[postIndex].upvotes;

  if (newStatus) { // Recommended
    recommendations[postId] = true;
    newUpvotes += 1;
  } else { // Un-recommended
    delete recommendations[postId];
    newUpvotes = Math.max(0, newUpvotes - 1); // Ensure non-negative
  }
  mockPosts[postIndex].upvotes = newUpvotes;
  if (mockPosts[postIndex].postScore !== undefined) { // Recalculate postScore if it exists
      const calculatePostScore = (post: Omit<Post, 'postScore'>): number => {
        const score = (post.views * 0.01) + (post.upvotes * 0.5) + (post.commentCount * 0.1);
        return parseFloat(score.toFixed(2));
      };
      mockPosts[postIndex].postScore = calculatePostScore(mockPosts[postIndex]);
  }


  const storageKey = getStorageKey(userId);
  if (storageKey) {
    localStorage.setItem(storageKey, JSON.stringify(recommendations));
  }
  return { newStatus, newUpvotes };
};
