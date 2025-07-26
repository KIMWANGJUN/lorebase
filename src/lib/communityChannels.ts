// src/lib/communityChannels.ts
export type PostMainCategory = 'unity' | 'unreal' | 'godot' | 'general';

export interface Channel {
  name: string;
  slug: string;
  description: string;
  categories: PostMainCategory[];
  icon: string; // icon 프로퍼티 추가
}

export const COMMUNITY_CHANNELS: Channel[] = [
  {
    name: 'Unity',
    slug: 'unity', 
    description: 'Unity 개발 관련',
    categories: ['unity'],
    icon: 'icon-unity'
  },
  {
    name: 'Unreal',
    slug: 'unreal',
    description: 'Unreal Engine 개발 관련', 
    categories: ['unreal'],
    icon: 'icon-unreal'
  },
  {
    name: 'Godot',
    slug: 'godot',
    description: 'Godot 개발 관련',
    categories: ['godot'],
    icon: 'icon-godot'
  },
  {
    name: '일반',
    slug: 'general',
    description: '일반 토론',
    categories: ['general'],
    icon: 'icon-general'
  }
];

export const getChannelBySlug = (slug: string): Channel | undefined => {
  return COMMUNITY_CHANNELS.find(channel => channel.slug === slug);
};

export const getChannelByCategory = (category: PostMainCategory): Channel | undefined => {
  return COMMUNITY_CHANNELS.find(channel => channel.categories.includes(category));
};
