// src/lib/recommendationUtils.ts
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
export const toggleUserRecommendation = (postId: string, userId: string | undefined): { newStatus: boolean } | null => {
  if (typeof window === 'undefined' || !userId) return null;

  const recommendations = getAllUserRecommendations(userId);
  const currentStatus = !!recommendations[postId];
  const newStatus = !currentStatus;

  if (newStatus) { // Recommended
    recommendations[postId] = true;
  } else { // Un-recommended
    delete recommendations[postId];
  }

  const storageKey = getStorageKey(userId);
  if (storageKey) {
    localStorage.setItem(storageKey, JSON.stringify(recommendations));
  }
  return { newStatus };
};
