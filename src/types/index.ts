export interface User {
  id: string;
  username: string; // 아이디
  nickname: string; // 닉네임
  email?: string;
  avatar?: string;
  score: number;
  rank: number; // 0 for admin, 1 for 1st, etc.
  socialProfiles?: {
    naver?: string;
    google?: string;
    kakao?: string;
  };
  nicknameLastChanged?: Date;
  isBlocked?: boolean;
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

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorNickname: string;
  authorAvatar?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  type: 'Discussion' | 'QnA' | 'Promotion' | 'Announcement' | 'Notice';
  upvotes: number;
  downvotes: number; // Only visible to admin
  views: number;
  isPinned?: boolean;
  tags?: string[];
  commentCount: number; // This will be the initial count, actual display might be dynamic
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

export interface RankEntry {
  userId: string;
  nickname: string;
  score: number;
  rank: number;
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
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  sentAt: string; // ISO Date string
  isRead: boolean;
}
