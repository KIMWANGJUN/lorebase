
// src/types/index.ts

// ... (other interfaces remain the same)

export interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  avatar?: string;
  score: number;
  rank: number;
  tetrisRank: number;
  categoryStats: {
    [key in PostMainCategory]: UserCategoryStat;
  };
  nicknameLastChanged?: Date;
  isBlocked: boolean;
  socialProfiles: {
    google?: string;
    naver?: string;
    kakao?: string;
    discord?: string;
    youtube?: string;
    twitch?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
  selectedTitleIdentifier: TitleIdentifier;
  selectedNicknameEffectIdentifier: NicknameEffectIdentifier;
  selectedLogoIdentifier: LogoIdentifier;
  twoFactorEnabled: boolean;
  emailChangesToday?: number;
  lastEmailChangeDate?: string | null;
  passwordChangesToday?: number;
  lastPasswordChangeDate?: string | null;
  twoFactorSecret?: string;
  twoFactorVerifiedAt?: string | null;
  pendingEmailVerification?: string | null;
  isAdmin?: boolean; // isAdmin property added
}

// ... (other type definitions remain the same)

export interface Post {
  id: string;
  mainCategory: PostMainCategory;
  title: string;
  content: string;
  author: User; // Changed from authorId, authorNickname etc.
  createdAt: string;
  updatedAt: string;
  type: PostType;
  upvotes: number;
  downvotes: number;
  views: number;
  commentCount: number;
  postScore?: number;
  isPinned?: boolean;
  tags: string[];
  isEdited?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: User; // Changed from authorId, authorNickname etc.
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  parentId?: string;
  replies: Comment[];
}

// ... (rest of the file remains the same)
export interface UserCategoryStat {
  score: number;
  rankInCate?: number;
}

export type PostMainCategory = 'Unity' | 'Unreal' | 'Godot' | 'General';
export type PostType = 'QnA' | 'Knowledge' | 'DevLog' | 'Notice' | 'GeneralPost' | 'Humor';
export type TitleIdentifier = 'none' | 'unity_master' | 'unreal_master' | 'godot_master' | 'tetris_king';
export type NicknameEffectIdentifier = 'none' | 'rainbow' | 'glow' | 'shadow';
export type LogoIdentifier = 'none' | 'crown' | 'star' | 'diamond';

export interface NewUserDto {
  username: string;
  nickname: string;
  email: string;
  password?: string;
  twoFactorEnabled?: boolean;
}
export interface RankEntry {
  userId: string;
  nickname: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface TetrisRanker {
  userId: string;
  nickname: string;
  score: number;
  rank: number;
}

export interface Inquiry {
  id: string;
  userId: string;
  userNickname: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'Pending' | 'Answered' | 'Closed';
  response?: string;
  respondedAt?: string;
}

export interface StarterProject {
  id: string;
  engine: string;
  name: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  version: string;
  lastUpdatedAt: string;
  tags: string[];
}

export interface AssetInfo {
  id: string;
  name: string;
  type: 'Model' | 'Texture' | 'Sound' | 'Plugin';
  description: string;
  siteUrl: string;
  imageUrl: string;
  isFree: boolean;
  updateFrequency?: string;
  tags: string[];
}

export type AchievedRankType = 'global' | 'unity' | 'unreal' | 'godot' | 'general' | 'tetris';

// 2차 인증 관련 인터페이스 추가
export interface TwoFactorSetupResult {
  success: boolean;
  message: string;
  verificationCode?: string;
}

export interface TwoFactorVerifyResult {
  success: boolean;
  message: string;
}
