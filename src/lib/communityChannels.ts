export interface CommunityChannel {
  slug: string; // URL에 사용될 고유 식별자 (예: 'unity', 'unreal', 'general')
  name: string; // 사용자에게 표시될 이름 (예: 'Unity 개발자 커뮤니티', '일반 & 유머')
  description: string; // 채널 설명
  categories: string[]; // 이 채널에 포함될 게시물 카테고리 (PostMainCategory와 매핑)
  icon?: string; // 채널을 나타내는 아이콘 (선택 사항)
}

export const COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    slug: 'unity',
    name: 'Unity 개발자 커뮤니티',
    description: 'Unity 엔진 관련 정보, 팁, 질문 등을 공유하는 채널입니다.',
    categories: ['unity'],
    icon: 'icon-unity', // 예시
  },
  {
    slug: 'unreal',
    name: 'Unreal Engine 개발자 커뮤니티',
    description: 'Unreal Engine 관련 정보, 팁, 질문 등을 공유하는 채널입니다.',
    categories: ['unreal'],
    icon: 'icon-unreal', // 예시
  },
  {
    slug: 'godot',
    name: 'Godot Engine 개발자 커뮤니티',
    description: 'Godot Engine 관련 정보, 팁, 질문 등을 공유하는 채널입니다.',
    categories: ['godot'],
    icon: 'icon-godot', // 예시
  },
  {
    slug: 'general',
    name: '일반 & 유머 커뮤니티',
    description: '게임 개발 외의 자유로운 주제나 유머를 공유하는 채널입니다.',
    categories: ['general'],
    icon: 'icon-general', // 예시
  },
  // 향후 새로운 채널 추가 시 여기에 정의합니다.
  // {
  //   slug: '2d-graphics',
  //   name: '2D 그래픽 아티스트',
  //   description: '2D 그래픽 관련 정보, 포트폴리오 등을 공유하는 채널입니다.',
  //   categories: ['2DGraphics'],
  //   icon: 'icon-2d-graphics',
  // },
];

// 카테고리 슬러그를 기반으로 채널을 찾는 헬퍼 함수
export const getChannelBySlug = (slug: string): CommunityChannel | undefined => {
  return COMMUNITY_CHANNELS.find(channel => channel.slug === slug);
};

// 카테고리 이름을 기반으로 채널을 찾는 헬퍼 함수 (PostMainCategory와 매핑)
export const getChannelByCategory = (category: string): CommunityChannel | undefined => {
  return COMMUNITY_CHANNELS.find(channel => channel.categories.includes(category));
};
