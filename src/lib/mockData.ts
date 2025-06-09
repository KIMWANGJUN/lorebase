
// src/lib/mockData.ts
import type { User, StarterProject, AssetInfo, Post, Comment, RankEntry, Inquiry, PostMainCategory } from '@/types';

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

export const mockUsers: User[] = [
  { 
    id: 'admin', username: 'WANGJUNLAND', nickname: 'WANGJUNLAND', email: 'admin@example.com', 
    score: 99999, rank: 0, // Admin rank is 0, will be filtered out from display lists
    avatar: 'https://placehold.co/100x100.png?text=WJ', 
    nicknameLastChanged: new Date('2023-01-01'), 
    categoryStats: {
      Unity: { score: 1000, rankInCate: 1 },
      Unreal: { score: 1000, rankInCate: 1 },
      Godot: { score: 1000, rankInCate: 1 },
      General: { score: 1000, rankInCate: 1 },
    }
  },
  { 
    id: 'user1', username: 'unityMaster', nickname: '유니티장인', email: 'unity@example.com', 
    score: 1250, rank: 1, 
    avatar: 'https://placehold.co/100x100.png?text=U1', 
    nicknameLastChanged: fortyFiveDaysAgo, 
    categoryStats: {
      Unity: { score: 800, rankInCate: 1 },
      Unreal: { score: 300, rankInCate: 3 },
      Godot: { score: 100, rankInCate: 5 },
      General: { score: 50, rankInCate: 7 },
    } 
  },
  { 
    id: 'user2', username: 'unrealDev', nickname: '언리얼신', email: 'unreal@example.com', 
    score: 1100, rank: 2, 
    avatar: 'https://placehold.co/100x100.png?text=U2', 
    nicknameLastChanged: fifteenDaysAgo, 
    categoryStats: {
      Unity: { score: 200, rankInCate: 4 },
      Unreal: { score: 750, rankInCate: 1 },
      Godot: { score: 50, rankInCate: 6 },
      General: { score: 100, rankInCate: 2 },
    }
  },
  { 
    id: 'user3', username: 'godotFan', nickname: '고도엔진팬', email: 'godot@example.com', 
    score: 950, rank: 3, 
    avatar: 'https://placehold.co/100x100.png?text=GF', 
    categoryStats: {
      Unity: { score: 100, rankInCate: 5 },
      Unreal: { score: 50, rankInCate: 6 },
      Godot: { score: 700, rankInCate: 1 },
      General: { score: 100, rankInCate: 3 },
    }
  },
  { 
    id: 'user4', username: 'indieDreamer', nickname: '인디드리머', email: 'dreamer@example.com',
    score: 700, rank: 4, 
    avatar: 'https://placehold.co/100x100.png?text=ID', 
    nicknameLastChanged: new Date('2024-07-01'), 
    categoryStats: {
      Unity: { score: 300, rankInCate: 3 },
      Unreal: { score: 100, rankInCate: 5 },
      Godot: { score: 150, rankInCate: 3 },
      General: { score: 150, rankInCate: 1 }, 
    }
  },
  { 
    id: 'user5', username: 'pixelArtist', nickname: '픽셀아티스트', 
    score: 600, rank: 5, 
    avatar: 'https://placehold.co/100x100.png?text=PA', 
    nicknameLastChanged: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
    categoryStats: {
      Unity: { score: 50, rankInCate: 6 },
      Unreal: { score: 250, rankInCate: 2 },
      Godot: { score: 200, rankInCate: 2 },
      General: { score: 100, rankInCate: 4 },
    }
  },
   { 
    id: 'user6', username: 'generalEnjoyer', nickname: '일반글애호가', email: 'general@example.com',
    score: 550, rank: 6, 
    avatar: 'https://placehold.co/100x100.png?text=GE', 
    nicknameLastChanged: new Date('2024-07-06'),
    categoryStats: {
      Unity: { score: 10, rankInCate: 7 },
      Unreal: { score: 20, rankInCate: 8 },
      Godot: { score: 30, rankInCate: 8 },
      General: { score: 490, rankInCate: 1 }, 
    }
  },
  { 
    id: 'user7', username: 'unityNewbie', nickname: '유니티뉴비', 
    score: 400, rank: 7, 
    avatar: 'https://placehold.co/100x100.png?text=UN', 
    nicknameLastChanged: new Date('2024-07-07'),
    categoryStats: {
      Unity: { score: 350, rankInCate: 2 }, 
      Unreal: { score: 0, rankInCate: 0 }, // rankInCate 0 or undefined for no rank
      Godot: { score: 0, rankInCate: 0 },
      General: { score: 50, rankInCate: 6 },
    }
  },
  { 
    id: 'user8', username: 'unrealArtist', nickname: '언리얼아티스트', 
    score: 300, rank: 8, 
    avatar: 'https://placehold.co/100x100.png?text=UA', 
    nicknameLastChanged: new Date('2024-07-08'),
    categoryStats: {
      Unity: { score: 0, rankInCate: 0 },
      Unreal: { score: 280, rankInCate: 4 },
      Godot: { score: 0, rankInCate: 0 },
      General: { score: 20, rankInCate: 8 },
    }
  },
  // User with multiple top ranks
  {
    id: 'user9_multi_rank', username: 'multiRanker', nickname: '멀티랭커', email: 'multi@example.com',
    score: 1050, rank: 2, // Global Rank 2 (will conflict with user2, adjust if needed or ensure distinct scores)
    avatar: 'https://placehold.co/100x100.png?text=MR',
    nicknameLastChanged: new Date('2024-06-01'),
    categoryStats: {
      Unity: { score: 700, rankInCate: 1 }, // Unity Top 1
      Unreal: { score: 50, rankInCate: 7 },
      Godot: { score: 10, rankInCate: 10 },
      General: { score: 290, rankInCate: 2 }, // General Top 2
    }
  },
  {
    id: 'user10_tetris_cat_rank', username: 'tetrisCatEnjoyer', nickname: '테트리스냥이',
    score: 800, rank: 4, // Global Rank 4
    avatar: 'https://placehold.co/100x100.png?text=TC',
    categoryStats: {
        Unity: {score: 600, rankInCate: 1}, // Unity Top 1
        General: {score: 200, rankInCate: 3}, // General Top 3
    }
  }
];

// Helper to re-calculate category ranks based on current scores in mockUsers
// This should be called if scores can change dynamically, or use pre-assigned ranks
export const assignCategoryRanks = () => {
  const categories: PostMainCategory[] = ['Unity', 'Unreal', 'Godot', 'General'];
  categories.forEach(category => {
    const rankedUsersInCategory = mockUsers
      .filter(u => u.username !== 'WANGJUNLAND' && u.categoryStats && typeof u.categoryStats[category]?.score === 'number')
      .sort((a, b) => (b.categoryStats![category]!.score || 0) - (a.categoryStats![category]!.score || 0));

    rankedUsersInCategory.forEach((user, index) => {
      if (user.categoryStats && user.categoryStats[category]) {
        user.categoryStats[category]!.rankInCate = index + 1;
      }
    });
  });
};
// Call it once to ensure ranks are set based on initial scores
assignCategoryRanks();


export const mockTetrisRankings = {
  monthly: [ 
    { userId: 'user1', nickname: '유니티장인', score: 2500000 }, // Was TetrisGod
    { userId: 'user9_multi_rank', nickname: '멀티랭커', score: 2200000 }, // Was ConsistentPlayer
    { userId: 'user3', nickname: '고도엔진팬', score: 1900000 }, // Was BlockMaster
    { userId: 'user4', nickname: '인디드리머', score: 1600000 },
    { userId: 'user5', nickname: '픽셀아티스트', score: 1400000 },
    { userId: 'user6', nickname: '일반글애호가', score: 1350000 },
    { userId: 'user7', nickname: '유니티뉴비', score: 1200000 },
    { userId: 'user10_tetris_cat_rank', nickname: '테트리스냥이', score: 2300000 }, // Added this user
  ].sort((a,b) => b.score - a.score) // Sort by score to determine Tetris Rank 1,2,3
};

export const tetrisTitles: string[] = [
  '"테트리스" 그 자체',
  '"테트리스" 그랜드 마스터',
  '"테트리스" 마스터',
];


export const mockStarterProjects: StarterProject[] = [
  { id: 'sp1', engine: 'Unity', name: 'Unity 2D 플랫포머 스타터', description: '기본적인 2D 플랫포머 게임 개발을 위한 Unity 프로젝트 템플릿입니다. 캐릭터 컨트롤, 타일맵, 간단한 UI가 포함되어 있습니다.', imageUrl: 'https://placehold.co/600x400.png', downloadUrl: '#', version: '1.0.2', lastUpdatedAt: new Date().toISOString(), tags: ['2D', 'Platformer', 'Unity'] },
  { id: 'sp2', engine: 'Unreal', name: 'Unreal FPS 스타터 키트', description: '1인칭 슈팅 게임 개발을 위한 Unreal Engine 5 스타터 프로젝트입니다. 기본 무기 시스템, 플레이어 이동, 간단한 AI 적이 포함되어 있습니다.', imageUrl: 'https://placehold.co/600x400.png', downloadUrl: '#', version: '0.8.5', lastUpdatedAt: new Date().toISOString(), tags: ['FPS', 'Unreal Engine 5', 'Shooter'] },
  { id: 'sp3', engine: 'Godot', name: 'Godot 픽셀아트 RPG 템플릿', description: 'Godot Engine으로 만드는 픽셀 아트 스타일 RPG 게임 템플릿입니다. 대화 시스템, 인벤토리, 간단한 퀘스트 시스템이 포함되어 있습니다.', imageUrl: 'https://placehold.co/600x400.png', downloadUrl: '#', version: '1.1.0', lastUpdatedAt: new Date().toISOString(), tags: ['RPG', 'Pixel Art', 'Godot'] },
  { id: 'sp4', engine: 'Unity', name: 'Unity VR 인터랙션 샘플', description: 'VR 환경에서의 기본 상호작용을 구현한 Unity 샘플 프로젝트입니다.', imageUrl: 'https://placehold.co/600x400.png', downloadUrl: '#', version: '1.0.0', lastUpdatedAt: new Date().toISOString(), tags: ['VR', 'Interaction', 'Unity'] },
];

export const mockAssetInfos: AssetInfo[] = [
  { id: 'ai1', name: 'Kenney.nl Assets', type: 'Model', description: '방대한 양의 무료 2D/3D 게임 에셋 제공. UI, 캐릭터, 환경 등 다양함.', siteUrl: 'https://kenney.nl/assets', imageUrl: 'https://placehold.co/600x400.png', isFree: true, updateFrequency: 'Monthly', tags: ['2D', '3D', 'UI', 'Character'] },
  { id: 'ai2', name: 'Poly Haven', type: 'Texture', description: '고품질 PBR 텍스처, 모델, HDRIs 무료 제공.', siteUrl: 'https://polyhaven.com', imageUrl: 'https://placehold.co/600x400.png', isFree: true, updateFrequency: 'Weekly', tags: ['PBR', 'Texture', 'Model', 'HDRI'] },
  { id: 'ai3', name: 'Freesound', type: 'Sound', description: '다양한 종류의 사운드 이펙트 및 배경음악 무료 제공.', siteUrl: 'https://freesound.org', imageUrl: 'https://placehold.co/600x400.png', isFree: true, tags: ['Sound Effect', 'BGM'] },
  { id: 'ai4', name: 'Unity Asset Store (Free)', type: 'Plugin', description: 'Unity Asset Store에서 제공하는 다양한 무료 에셋 및 플러그인.', siteUrl: 'https://assetstore.unity.com/?category=3d&orderBy=1&price=0-0', imageUrl: 'https://placehold.co/600x400.png', isFree: true, updateFrequency: 'Daily', tags: ['Unity', 'Plugin', 'Model'] },
];

export const mockPosts: Post[] = [
  { id: 'post_unity_qna1', mainCategory: 'Unity', title: 'Unity Rigidbody 관련 질문입니다.', content: 'Rigidbody.MovePosition과 transform.Translate의 정확한 차이점과 사용 사례가 궁금합니다.', authorId: 'user4', authorNickname: '인디드리머', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'QnA', upvotes: 10, downvotes: 0, views: 120, commentCount: 2, tags: ['Unity', 'Physics', 'Rigidbody'] },
  { id: 'post_unity_knowledge1', mainCategory: 'Unity', title: 'Unity DOTS 사용 후기 공유합니다.', content: '최근에 Unity DOTS를 사용해서 프로젝트를 진행해봤는데, 성능 최적화에 정말 큰 도움이 되었습니다. 처음엔 학습 곡선이 좀 있지만 익숙해지니 좋네요. 다른 분들 경험은 어떠신가요?', authorId: 'user1', authorNickname: '유니티장인', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Knowledge', upvotes: 25, downvotes: 1, views: 150, commentCount: 7, isPinned: true, tags: ['Unity', 'DOTS', 'Performance'] },
  { id: 'post_unity_devlog1', mainCategory: 'Unity', title: '나만의 2D 플랫포머 개발 일지 #1 - 캐릭터 구현', content: 'Unity로 2D 플랫포머 게임을 만들고 있습니다. 오늘은 기본 캐릭터 움직임과 점프를 구현했습니다!', authorId: 'user5', authorNickname: '픽셀아티스트', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'DevLog', upvotes: 15, downvotes: 0, views: 90, commentCount: 3, tags: ['Unity', '2D', 'Platformer', 'DevLog'] },
  
  { id: 'post_unreal_qna1', mainCategory: 'Unreal', title: 'Unreal Engine 5에서 Lumen 사용할 때 팁 있나요?', content: 'Lumen으로 실시간 GI를 구현 중인데, 특정 환경에서 빛샘 현상이 발생하네요. 해결 방법이나 최적화 팁 아시는 분 계시면 공유 부탁드립니다!', authorId: 'user2', authorNickname: '언리얼신', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'QnA', upvotes: 18, downvotes: 0, views: 220, commentCount: 3, tags: ['Unreal Engine 5', 'Lumen', 'Lighting'] },
  { id: 'post_unreal_knowledge1', mainCategory: 'Unreal', title: '언리얼 블루프린트 최적화 팁 몇가지', content: '블루프린트 사용 시 자주 발생하는 성능 저하를 피하기 위한 몇 가지 팁을 공유합니다. Nativization, Pure 함수 활용 등...', authorId: 'user2', authorNickname: '언리얼신', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(), type: 'Knowledge', upvotes: 30, downvotes: 0, views: 250, commentCount: 5, tags: ['Unreal Engine', 'Blueprint', 'Optimization'] },
  { id: 'post_unreal_devlog1', mainCategory: 'Unreal', title: 'UE5 오픈월드 프로젝트 시작합니다!', content: '사이버펑크 컨셉의 오픈월드 게임 개발을 시작했습니다. 현재 기본 환경 구성 중입니다. #UE5 #OpenWorld', authorId: 'user1', authorNickname: '유니티장인', createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), type: 'DevLog', upvotes: 22, downvotes: 0, views: 180, commentCount: 4, tags: ['Unreal Engine 5', 'Open World', 'Cyberpunk'] },

  { id: 'post_godot_qna1', mainCategory: 'Godot', title: 'Godot에서 GDScript와 C# 선택 기준이 뭘까요?', content: 'Godot 엔진을 처음 시작하는데, GDScript와 C# 중 어떤 언어를 사용하는 것이 좋을지 고민입니다. 각 언어의 장단점이나 추천 사용 사례가 있을까요?', authorId: 'user4', authorNickname: '인디드리머', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'QnA', upvotes: 12, downvotes: 0, views: 100, commentCount: 4, tags: ['Godot', 'GDScript', 'C#'] },
  { id: 'post_godot_knowledge1', mainCategory: 'Godot', title: 'Godot 씬 관리 효율적으로 하는 법', content: '프로젝트가 커질수록 씬 관리가 복잡해지는데, Godot에서 씬을 효율적으로 구성하고 관리하는 노하우가 있다면 공유해주세요.', authorId: 'user3', authorNickname: '고도엔진팬', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), type: 'Knowledge', upvotes: 20, downvotes: 0, views: 130, commentCount: 3, tags: ['Godot', 'Scene Management', 'Workflow'] },
  { id: 'post_godot_devlog1', mainCategory: 'Godot', title: '[홍보] 저희 팀이 만든 고도 엔진 게임입니다!', content: '안녕하세요! 저희 팀에서 Godot Engine으로 개발한 인디 게임 OOO가 스팀에 출시되었습니다! 많은 관심 부탁드립니다. 피드백도 환영합니다!', authorId: 'user3', authorNickname: '고도엔진팬', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), type: 'DevLog', upvotes: 30, downvotes: 2, views: 300, commentCount: 1, tags: ['Godot', 'Game Release', 'Indie Game'] },

  { id: 'post_general_notice1', mainCategory: 'General', title: '[공지] 커뮤니티 이용 규칙 업데이트 안내', content: '커뮤니티 이용 규칙이 일부 개정되었습니다. 자세한 내용은 공지사항 게시판을 확인해주시기 바랍니다. 모든 회원분들의 적극적인 협조 부탁드립니다.', authorId: 'admin', authorNickname: 'WANGJUNLAND', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'Notice', upvotes: 50, downvotes: 0, views: 500, commentCount: 0, isPinned: true, tags: ['Community', 'Rules'] },
  { id: 'post_general_post1', mainCategory: 'General', title: '인디 게임 개발자가 갖춰야 할 마인드셋', content: '성공적인 인디 게임 개발을 위해 어떤 마음가짐이 중요하다고 생각하시나요? 자유롭게 의견 나눠봐요.', authorId: 'user4', authorNickname: '인디드리머', createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(), type: 'GeneralPost', upvotes: 40, downvotes: 1, views: 400, commentCount: 10, tags: ['IndieDev', 'Mindset'] },
  { id: 'post_general_humor1', mainCategory: 'General', title: '개발자 유머) 버그 없는 코드.jpg', content: '코딩하다 보면 항상 예상치 못한 버그가...', authorId: 'user5', authorNickname: '픽셀아티스트', createdAt: new Date(Date.now() - 86400000 * 0.2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.2).toISOString(), type: 'Humor', upvotes: 60, downvotes: 0, views: 600, commentCount: 15, tags: ['Humor', 'Programming'] },
  { id: 'post_general_humor2', mainCategory: 'General', title: '내 게임이 드디어 빌드 성공했을 때 내 모습', content: '(움짤 첨부) ...은 아니고 일단 기쁨의 커피 한잔', authorId: 'user1', authorNickname: '유니티장인', createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), type: 'Humor', upvotes: 55, downvotes: 0, views: 550, commentCount: 8, tags: ['Humor', 'Build', 'GameDevLife'] },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `post_general_older_${i + 1}`,
    mainCategory: 'General' as PostMainCategory,
    title: `오래된 일반 게시글 ${i + 1}`,
    content: `이것은 오래된 일반 게시글 내용입니다. (${i + 1})`,
    authorId: mockUsers.filter(u => u.id !== 'admin')[(i + 1) % (mockUsers.length -1)].id,
    authorNickname: mockUsers.filter(u => u.id !== 'admin')[(i + 1) % (mockUsers.length-1)].nickname,
    createdAt: new Date(Date.now() - 86400000 * (7 + i)).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * (7 + i)).toISOString(),
    type: 'GeneralPost' as PostType,
    upvotes: 5 + i,
    downvotes: 0,
    views: 50 + i * 5,
    commentCount: i % 5,
    tags: ['Old', 'General']
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `post_unity_older_${i + 1}`,
    mainCategory: 'Unity' as PostMainCategory,
    title: `오래된 Unity QnA ${i + 1}`,
    content: `Unity 관련 오래된 질문입니다. (${i + 1})`,
    authorId: mockUsers.filter(u => u.id !== 'admin')[(i + 2) % (mockUsers.length -1)].id,
    authorNickname: mockUsers.filter(u => u.id !== 'admin')[(i + 2) % (mockUsers.length-1)].nickname,
    createdAt: new Date(Date.now() - 86400000 * (10 + i)).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * (10 + i)).toISOString(),
    type: 'QnA' as PostType,
    upvotes: 3 + i,
    downvotes: 0,
    views: 30 + i * 3,
    commentCount: i % 3,
    tags: ['Old', 'Unity', 'QnA']
  })),
];


export const mockComments: Comment[] = [
  { id: 'comment1', postId: 'post_unity_knowledge1', authorId: 'user2', authorNickname: '언리얼신', content: 'DOTS 정말 좋죠! 저도 작은 프로젝트에 적용해봤는데 확실히 퍼포먼스가 다르더라고요.', createdAt: new Date(Date.now() - 86400000 * 1.9).toISOString(), upvotes: 5, downvotes: 0, replies: [
    { id: 'reply1_to_comment1', postId: 'post_unity_knowledge1', authorId: 'user1', authorNickname: '유니티장인', content: '맞아요! 처음엔 어려웠는데, 익숙해지니 가능성이 무궁무진한 것 같아요.', createdAt: new Date(Date.now() - 86400000 * 1.8).toISOString(), upvotes: 2, downvotes: 0, parentId: 'comment1', replies: [] }
  ]},
  { id: 'comment2', postId: 'post_unity_knowledge1', authorId: 'user3', authorNickname: '고도엔진팬', content: 'ECS 개념이 아직은 생소해서 좀 더 공부해봐야겠어요. 좋은 정보 감사합니다!', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), upvotes: 3, downvotes: 0, replies: [] },
  { id: 'comment3', postId: 'post_unreal_qna1', authorId: 'user1', authorNickname: '유니티장인', content: 'Lumen 설정에서 Post Process Volume의 디테일 설정을 한번 확인해보세요. 가끔 그게 문제일 수 있습니다.', createdAt: new Date(Date.now() - 86400000 * 0.9).toISOString(), upvotes: 3, downvotes: 0, replies: [] },
  { id: 'comment4', postId: 'post_unreal_qna1', authorId: 'admin', authorNickname: 'WANGJUNLAND', content: '빛샘 현상은 메쉬의 라이트맵 UV나 두께 문제일 수도 있습니다. 해당 부분도 점검해보시는 것이 좋겠습니다.', createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString(), upvotes: 2, downvotes: 0, replies: [] },
  { id: 'comment5', postId: 'post_godot_devlog1', authorId: 'user4', authorNickname: '인디드리머', content: '오! 축하드립니다! 한번 플레이해봐야겠네요!', createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), upvotes: 7, downvotes: 0, replies: [] },
  { id: 'comment6_for_post_unity_knowledge1', postId: 'post_unity_knowledge1', authorId: 'admin', authorNickname: 'WANGJUNLAND', content: 'DOTS 관련해서 좋은 토론이네요. 혹시 추가적인 질문 있으시면 언제든 편하게 남겨주세요.', createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), upvotes: 1, downvotes: 0, replies: [] },
];


export const mockRankings: RankEntry[] = mockUsers
  .filter(u => u.username !== 'WANGJUNLAND') // Exclude admin from global ranking list
  .sort((a, b) => b.score - a.score)
  .map((user, index) => ({
    userId: user.id,
    nickname: user.nickname,
    score: user.score,
    rank: index + 1,
    avatar: user.avatar,
  }));


export const mockInquiries: Inquiry[] = [
  { id: 'inq1', userId: 'user4', userNickname: '인디드리머', title: '닉네임 변경 기간 문의', content: '닉네임 변경 후 1개월 제한이 정확히 어떻게 적용되는지 궁금합니다.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Answered', response: '닉네임 변경 시점으로부터 만 30일 이후에 다시 변경 가능합니다.', respondedAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
  { id: 'inq2', userId: 'user1', userNickname: '유니티장인', title: '게시글 오류 신고', content: '특정 게시글에서 이미지가 깨져 보입니다. 확인 부탁드립니다. (게시글 ID: postX)', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Pending' },
];

    

    