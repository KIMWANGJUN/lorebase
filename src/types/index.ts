

export type PostMainCategory = 'Unity' | 'Unreal' | 'Godot' | 'General';

export interface UserCategoryStat {
  score: number;
  rankInCate?: number; // Rank within that specific category (1-based), calculated dynamically
}

export type DisplayRankType = 
  | 'global' 
  | 'tetris' 
  | `category_${PostMainCategory}` 
  | 'default';

export interface User {
  id: string;
  username: string; // 아이디
  password?: string; // 사용자 비밀번호 (mock용)
  nickname: string; // 닉네임
  email?: string;
  avatar?: string;
  score: number; // Global score
  rank: number; // Global rank: 0 for admin (filtered from display), 1 for 1st, etc.
  socialProfiles?: {
    naver?: string;
    google?: string;
    kakao?: string;
  };
  nicknameLastChanged?: Date;
  isBlocked?: boolean;
  categoryStats?: { 
    [key in PostMainCategory]?: UserCategoryStat;
  };
  selectedDisplayRank?: DisplayRankType; // User's preference for display
  tetrisRank?: number; // Monthly Tetris rank, 1-based. 0 or undefined if not ranked.
}

export interface StarterProject {
  id: string;
  engine: 'Unity' | 'Unreal' | 'Godot' | 'Other';
  name: string;
  description: string;
  imageUrl?: string;
  downloadUrl: string; // Mock URL
  version: string;
  lastUpdatedAt: string; // ISO Date string
  tags?: string[];
  developerNotes?: string;
}

export interface AssetInfo {
  id: string;
  name: string;
  type: 'Texture' | 'Model' | 'Sound' | 'Plugin' | 'Other';
  description: string;
  siteUrl: string;
  imageUrl?: string;
  isFree: boolean;
  updateFrequency?: 'Daily' | 'Weekly' | 'Monthly'; // For free assets
  tags?: string[];
}

export type PostType = 'QnA' | 'Knowledge' | 'DevLog' | 'GeneralPost' | 'Humor' | 'Notice' | 'Announcement';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorNickname: string;
  authorAvatar?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  mainCategory: PostMainCategory;
  type: PostType;
  upvotes: number;
  downvotes: number; // Only visible to admin
  views: number;
  isPinned?: boolean;
  tags?: string[];
  commentCount: number;
  isEdited?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorAvatar?: string;
  content: string;
  createdAt: string; // ISO Date string
  updatedAt?: string; // ISO Date string for edits
  upvotes: number;
  downvotes: number;
  parentId?: string; // ID of the comment this is a reply to
  replies?: Comment[]; // Nested replies for display
  isEdited?: boolean;
}

export interface RankEntry { // Used for global ranking list display
  userId: string;
  nickname: string;
  score: number;
  rank: number; // This is global rank for the main ranking list
  avatar?: string;
}

export interface Inquiry {
  id: string;
  userId: string;
  userNickname: string;
  title: string;
  content: string;
  createdAt: string; // ISO Date string
  status: 'Pending' | 'Answered' | 'Closed';
  response?: string;
  respondedAt?: string; // ISO Date string
}

export interface DirectMessage {
  id:string;
  fromUserId: string;
  toUserId: string;
  content: string;
  sentAt: string; // ISO Date string
  isRead: boolean;
}

export interface TetrisRanker {
  userId: string;
  nickname: string;
  score: number;
  rank: number; // Calculated rank within Tetris monthly
}
    
