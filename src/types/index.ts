
export type PostMainCategory = 'Unity' | 'Unreal' | 'Godot' | 'General';

export interface UserCategoryStat {
  score: number;
  rankInCate?: number; // Rank within that specific category (1-based), calculated dynamically
}

// 사용자가 달성하여 프로필에서 선택할 수 있는 *개별* 효과의 식별자 타입 정의
export type TitleIdentifier = 
  | 'none'
  | 'tetris_1_title' | 'tetris_2_title' | 'tetris_3_title'
  | 'category_Unity_1_title' | 'category_Unity_2_title' | 'category_Unity_3_title'
  | 'category_Unreal_1_title' | 'category_Unreal_2_title' | 'category_Unreal_3_title'
  | 'category_Godot_1_title' | 'category_Godot_2_title' | 'category_Godot_3_title'
  | 'category_General_1_title' | 'category_General_2_title' | 'category_General_3_title';

export type NicknameEffectIdentifier =
  | 'none'
  | 'global_1_effect' | 'global_2_effect' | 'global_3_effect'
  | 'tetris_1_effect' | 'tetris_2_effect' | 'tetris_3_effect' // Nickname text only, no wrapper
  | 'category_Unity_1-3_effect' | 'category_Unity_4-10_effect' | 'category_Unity_11-20_effect'
  | 'category_Unreal_1-3_effect' | 'category_Unreal_4-10_effect' | 'category_Unreal_11-20_effect'
  | 'category_Godot_1-3_effect' | 'category_Godot_4-10_effect' | 'category_Godot_11-20_effect'
  | 'category_General_1-3_effect' | 'category_General_4-10_effect' | 'category_General_11-20_effect';

export type LogoIdentifier = 
  | 'none'
  | 'logo_Unity' | 'logo_Unreal' | 'logo_Godot' | 'logo_General';

// 사용자가 달성한 랭크/칭호의 종류 (번들된 효과를 나타내는 기존 타입, 내부 로직에 활용 가능)
export type AchievedRankType =
  | 'default' 
  | 'global_1' | 'global_2' | 'global_3'
  | 'tetris_1' | 'tetris_2' | 'tetris_3'
  | 'category_Unity_1-3' | 'category_Unity_4-10' | 'category_Unity_11-20'
  | 'category_Unreal_1-3' | 'category_Unreal_4-10' | 'category_Unreal_11-20'
  | 'category_Godot_1-3' | 'category_Godot_4-10' | 'category_Godot_11-20'
  | 'category_General_1-3' | 'category_General_4-10' | 'category_General_11-20';


export interface User {
  twoFactorEnabled: any;
  id: string;
  username: string; 
  password?: string; 
  nickname: string; 
  email?: string;
  avatar?: string;
  score: number; 
  rank: number; 
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
  tetrisRank?: number; 

  // User's preferred display settings (granular)
  selectedTitleIdentifier?: TitleIdentifier;
  selectedNicknameEffectIdentifier?: NicknameEffectIdentifier;
  selectedLogoIdentifier?: LogoIdentifier;

  // This can be kept for internal logic if needed to determine *earned* bundled ranks
  achievedDisplayRankBundled?: AchievedRankType; // Example: user might have earned 'global_1' bundle
}

export interface StarterProject {
  id: string;
  engine: 'Unity' | 'Unreal' | 'Godot' | 'Other';
  name: string;
  description: string;
  imageUrl?: string;
  downloadUrl: string; 
  version: string;
  lastUpdatedAt: string; 
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
  updateFrequency?: 'Daily' | 'Weekly' | 'Monthly'; 
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
  createdAt: string; 
  updatedAt: string; 
  mainCategory: PostMainCategory;
  type: PostType;
  upvotes: number;
  downvotes: number; 
  views: number;
  isPinned?: boolean;
  tags?: string[];
  commentCount: number;
  isEdited?: boolean;
  postScore?: number; 
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorAvatar?: string;
  content: string;
  createdAt: string; 
  updatedAt?: string; 
  upvotes: number;
  downvotes: number;
  parentId?: string; 
  replies?: Comment[]; 
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
  createdAt: string; 
  status: 'Pending' | 'Answered' | 'Closed';
  response?: string;
  respondedAt?: string; 
}

export interface DirectMessage {
  id:string;
  fromUserId: string;
  toUserId: string;
  content: string;
  sentAt: string; 
  isRead: boolean;
}

export interface TetrisRanker {
  userId: string;
  nickname: string;
  score: number;
  rank: number; 
}
