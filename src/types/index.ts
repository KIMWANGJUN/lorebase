
import { FieldValue, Timestamp } from 'firebase/firestore';

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
    [key in PostMainCategory]?: UserCategoryStat;
  };
  isBlocked: boolean;
  socialProfiles: {
    discord?: string;
    youtube?: string;
  };
  selectedTitleIdentifier: TitleIdentifier;
  selectedNicknameEffectIdentifier: NicknameEffectIdentifier;
  selectedLogoIdentifier: LogoIdentifier;
  twoFactorEnabled: boolean;
  isAdmin?: boolean;
  createdAt: Timestamp | FieldValue;
  nicknameLastChanged?: Timestamp | FieldValue;
  lastEmailChangeDate?: string | null;
  emailChangesToday?: number;
  lastPasswordChangeDate?: string | null;
  passwordChangesToday?: number;
}

export interface Whisper {
  id: string;
  senderId: string;
  senderNickname: string;
  recipientId: string;
  recipientNickname: string;
  content: string;
  isReply: boolean;
  originalWhisperId?: string;
  createdAt: Timestamp | FieldValue;
  readAt?: Timestamp | FieldValue;
}

export interface Inquiry {
  id: string;
  userId: string;
  userNickname: string;
  title: string;
  content: string;
  category: InquiryCategory;
  status: 'Pending' | 'InProgress' | 'Completed';
  createdAt: Timestamp | FieldValue;
  reply?: string;
  repliedAt?: Timestamp | FieldValue;
  repliedBy?: string;
}

export interface Ranking {
  category: PostMainCategory | 'Overall';
  entries: RankEntry[];
}

export interface RankEntry {
  userId: string;
  nickname: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface Post {
  id: string;
  authorId: string; // 데이터베이스에 저장되는 필드
  author: User;     // API 응답에서 채워지는 필드
  mainCategory: PostMainCategory;
  title: string;
  content: string;
  type: PostType;
  upvotes: number;
  downvotes: number;
  views: number;
  commentCount: number;
  isPinned?: boolean;
  tags: string[];
  isEdited?: boolean;
  postScore?: number;
  isPopular?: boolean;
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string; // 데이터베이스에 저장되는 필드
  author: User;     // API 응답에서 채워지는 필드
  content: string;
  upvotes: number;
  downvotes: number;
  parentId?: string | null;
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface UserCategoryStat {
  score: number;
  rankInCate?: number;
}

export type PostMainCategory = 'Unity' | 'Unreal' | 'Godot' | 'General' | 'game-workshop' | 'tavern' | 'free-assets';
export type PostType = 'QnA' | 'Knowledge' | 'DevLog' | 'Notice' | 'GeneralPost' | 'Humor';
export type InquiryCategory = 'account' | 'payment' | 'technical' | 'other' | 'user-report';

export type TitleIdentifier = 
  | 'none'
  | 'bronze-gamer' | 'silver-gamer' | 'gold-gamer' | 'platinum-gamer' | 'diamond-gamer'
  | 'bronze-writer' | 'silver-writer' | 'gold-writer' | 'platinum-writer' | 'diamond-writer';

export type NicknameEffectIdentifier = 
  | 'none'
  | 'bronze-glow' | 'silver-glow' | 'gold-glow' | 'diamond-sparkle'
  | 'bronze-flame' | 'silver-flame' | 'gold-flame' | 'rainbow-wave';

export type LogoIdentifier = 
  | 'none'
  | 'bronze-quill' | 'silver-quill' | 'gold-quill' | 'diamond-crown';

export interface TetrisRanker {
    userId: string;
    nickname: string;
    score: number;
    rank: number;
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

export interface NewUserDto {
  username: string;
  nickname: string;
  email?: string;
  password?: string;
  twoFactorEnabled?: boolean;
}

export interface TwoFactorSetupResult {
  success: boolean;
  message: string;
  verificationCode?: string;
}

export interface TwoFactorVerifyResult {
  success: boolean;
  message: string;
}
