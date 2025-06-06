// src/lib/mockData.ts
import type { User, StarterProject, AssetInfo, Post, Comment, RankEntry, Inquiry } from '@/types';

export const mockUsers: User[] = [
  { id: 'admin', username: 'WANGJUNLAND', nickname: 'WANGJUNLAND', email: 'admin@example.com', score: 99999, rank: 0, avatar: 'https://placehold.co/100x100.png?text=WJ', nicknameLastChanged: new Date('2023-01-01') },
  { id: 'user1', username: 'unityMaster', nickname: '유니티장인', email: 'unity@example.com', score: 1250, rank: 1, avatar: 'https://placehold.co/100x100.png?text=U1', nicknameLastChanged: new Date('2024-05-01') },
  { id: 'user2', username: 'unrealDev', nickname: '언리얼신', email: 'unreal@example.com', score: 1100, rank: 2, avatar: 'https://placehold.co/100x100.png?text=U2', nicknameLastChanged: new Date('2024-06-15') },
  { id: 'user3', username: 'godotFan', nickname: '고도엔진팬', email: 'godot@example.com', score: 950, rank: 3, avatar: 'https://placehold.co/100x100.png?text=GF', nicknameLastChanged: new Date('2024-04-20') },
  { id: 'user4', username: 'indieDreamer', nickname: '인디드리머', email: 'dreamer@example.com', score: 700, rank: 4, avatar: 'https://placehold.co/100x100.png?text=ID', nicknameLastChanged: new Date('2024-07-01') },
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
  { id: 'post1', title: 'Unity DOTS 사용 후기 공유합니다.', content: '최근에 Unity DOTS를 사용해서 프로젝트를 진행해봤는데, 성능 최적화에 정말 큰 도움이 되었습니다. 처음엔 학습 곡선이 좀 있지만 익숙해지니 좋네요. 다른 분들 경험은 어떠신가요?', authorId: 'user1', authorNickname: '유니티장인', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Discussion', upvotes: 25, downvotes: 1, views: 150, commentCount: 7, isPinned: true, tags: ['Unity', 'DOTS', 'Performance'] },
  { id: 'post2', title: 'Unreal Engine 5에서 Lumen 사용할 때 팁 있나요?', content: 'Lumen으로 실시간 GI를 구현 중인데, 특정 환경에서 빛샘 현상이 발생하네요. 해결 방법이나 최적화 팁 아시는 분 계시면 공유 부탁드립니다!', authorId: 'user2', authorNickname: '언리얼신', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'QnA', upvotes: 18, downvotes: 0, views: 220, commentCount: 3, tags: ['Unreal Engine 5', 'Lumen', 'Lighting'] },
  { id: 'post3', title: '[홍보] 저희 팀이 만든 고도 엔진 게임입니다!', content: '안녕하세요! 저희 팀에서 Godot Engine으로 개발한 인디 게임 OOO가 스팀에 출시되었습니다! 많은 관심 부탁드립니다. 피드백도 환영합니다!', authorId: 'user3', authorNickname: '고도엔진팬', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), type: 'Promotion', upvotes: 30, downvotes: 2, views: 300, commentCount: 1, tags: ['Godot', 'Game Release', 'Indie Game'] },
  { id: 'notice1', title: '[공지] 커뮤니티 이용 규칙 업데이트 안내', content: '커뮤니티 이용 규칙이 일부 개정되었습니다. 자세한 내용은 공지사항 게시판을 확인해주시기 바랍니다. 모든 회원분들의 적극적인 협조 부탁드립니다.', authorId: 'admin', authorNickname: 'WANGJUNLAND', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'Notice', upvotes: 50, downvotes: 0, views: 500, commentCount: 0, isPinned: true, tags: ['Community', 'Rules'] },
];

export const mockComments: Comment[] = [
  { id: 'comment1', postId: 'post1', authorId: 'user2', authorNickname: '언리얼신', content: 'DOTS 정말 좋죠! 저도 작은 프로젝트에 적용해봤는데 확실히 퍼포먼스가 다르더라고요.', createdAt: new Date(Date.now() - 86400000 * 1.9).toISOString(), upvotes: 5, downvotes: 0, replies: [
    { id: 'reply1_to_comment1', postId: 'post1', authorId: 'user1', authorNickname: '유니티장인', content: '맞아요! 처음엔 어려웠는데, 익숙해지니 가능성이 무궁무진한 것 같아요.', createdAt: new Date(Date.now() - 86400000 * 1.8).toISOString(), upvotes: 2, downvotes: 0, parentId: 'comment1', replies: [] }
  ]},
  { id: 'comment2', postId: 'post1', authorId: 'user3', authorNickname: '고도엔진팬', content: 'ECS 개념이 아직은 생소해서 좀 더 공부해봐야겠어요. 좋은 정보 감사합니다!', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), upvotes: 3, downvotes: 0, replies: [] },
  { id: 'comment3', postId: 'post2', authorId: 'user1', authorNickname: '유니티장인', content: 'Lumen 설정에서 Post Process Volume의 디테일 설정을 한번 확인해보세요. 가끔 그게 문제일 수 있습니다.', createdAt: new Date(Date.now() - 86400000 * 0.9).toISOString(), upvotes: 3, downvotes: 0, replies: [] },
  { id: 'comment4', postId: 'post2', authorId: 'admin', authorNickname: 'WANGJUNLAND', content: '빛샘 현상은 메쉬의 라이트맵 UV나 두께 문제일 수도 있습니다. 해당 부분도 점검해보시는 것이 좋겠습니다.', createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString(), upvotes: 2, downvotes: 0, replies: [] },
  { id: 'comment5', postId: 'post3', authorId: 'user4', authorNickname: '인디드리머', content: '오! 축하드립니다! 한번 플레이해봐야겠네요!', createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), upvotes: 7, downvotes: 0, replies: [] },
  { id: 'comment6_for_post1', postId: 'post1', authorId: 'admin', authorNickname: 'WANGJUNLAND', content: 'DOTS 관련해서 좋은 토론이네요. 혹시 추가적인 질문 있으시면 언제든 편하게 남겨주세요.', createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), upvotes: 1, downvotes: 0, replies: [] },
];


export const mockRankings: RankEntry[] = mockUsers
  .filter(u => u.username !== 'WANGJUNLAND') // Exclude admin from typical ranking display here
  .sort((a, b) => b.score - a.score)
  .map((user, index) => ({
    userId: user.id,
    nickname: user.nickname,
    score: user.score,
    rank: index + 1,
    avatar: user.avatar,
  }));
if (mockUsers.find(u => u.username === 'WANGJUNLAND')) {
    const adminUser = mockUsers.find(u => u.username === 'WANGJUNLAND')!;
    mockRankings.unshift({ // Add admin to top for specific display cases or if rules allow
        userId: adminUser.id,
        nickname: adminUser.nickname,
        score: adminUser.score,
        rank: 0, // Special rank for admin
        avatar: adminUser.avatar,
    });
}


export const mockInquiries: Inquiry[] = [
  { id: 'inq1', userId: 'user4', userNickname: '인디드리머', title: '닉네임 변경 기간 문의', content: '닉네임 변경 후 1개월 제한이 정확히 어떻게 적용되는지 궁금합니다.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Answered', response: '닉네임 변경 시점으로부터 만 30일 이후에 다시 변경 가능합니다.', respondedAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
  { id: 'inq2', userId: 'user1', userNickname: '유니티장인', title: '게시글 오류 신고', content: '특정 게시글에서 이미지가 깨져 보입니다. 확인 부탁드립니다. (게시글 ID: postX)', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Pending' },
];
