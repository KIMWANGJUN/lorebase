
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Firebase Studio(Project IDX) 도메인 허용
  allowedDevOrigins: [
    '3000-firebase-studio-1749213667538.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev',
    '*.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev',
    'localhost:3000',
    '127.0.0.1:3000'
  ],

  // serverExternalPackages for Next.js 13.1+ (moved from experimental.serverComponentsExternalPackages)
  serverExternalPackages: ['firebase-admin'],

  // Firebase Studio(IDX) 환경 감지 및 최적화
  experimental: {
    // Firebase Studio 환경에서 성능 최적화
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // 이미지 최적화 설정 (검색 결과 [3], [5]에서 확인)
  images: {
    // Firebase Storage 및 외부 이미지 도메인 허용
    domains: [
      'placehold.co',
      'picsum.photos', 
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com', // Google 프로필 이미지
      'avatars.githubusercontent.com', // GitHub 아바타
      'cdn.pixabay.com',
      'images.unsplash.com'
    ],
    
    // 최신 Next.js remotePatterns 사용 (검색 결과 [2]에서 확인)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    
    // 이미지 최적화 설정
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // CORS 헤더 설정 (Firebase Studio 환경용)
  async headers() {
    return [
      {
        // API 라우트용 CORS 설정
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      {
        // 모든 페이지용 보안 헤더
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        // Firebase API 요청용 특별 헤더
        source: '/_next/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // 환경변수 명시적 설정 (검색 결과 [1]에서 확인)
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },

  // Firebase Studio 환경에서 빌드 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Firebase Studio 환경에서 성능 최적화
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    // Firebase 관련 모듈 최적화
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // 개발 서버 표시기 설정 (업데이트됨)
  devIndicators: {
    position: 'bottom-right', // buildActivityPosition에서 position으로 변경, buildActivity 제거
  },

  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Firebase App Hosting 호환성 (검색 결과 [2]에서 확인)
  output: 'standalone',

  // 타입스크립트 설정
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
