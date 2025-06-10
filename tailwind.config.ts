
import type {Config} from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // 텍스트 그라데이션 클래스
    'text-gradient-gold',
    'text-gradient-silver',
    'text-gradient-bronze',
    'text-gradient-unity',
    'text-gradient-unreal',
    'text-gradient-godot',
    'text-gradient-general-rainbow',
    
    // 배경 래퍼 클래스
    'bg-wrapper-gold',
    'bg-wrapper-silver',
    'bg-wrapper-bronze',
    'bg-wrapper-unity',
    'bg-wrapper-unreal',
    'bg-wrapper-godot',
    'bg-wrapper-general-rainbow',
    
    // 기타 커스텀 클래스
    'admin-badge',
    'admin-text',
    'title-on-nickname-wrapper',
    'title-text-base',
    
    // 카테고리 아이콘 클래스 (HSL 변수를 사용하므로 safelist 필요 없을 수 있으나, 만약을 위해 추가)
    'icon-unity',
    'icon-unreal',
    'icon-godot',
    'icon-general',

    // NicknameDisplay에서 동적으로 사용될 수 있는 기본 Tailwind 클래스들
    'text-transparent',
    // 'bg-clip-text', // This is a CSS property, not a Tailwind class. text-gradient-* handles this.
    'font-semibold',
    'font-medium',
    'font-bold', // Added for global rankers
    'text-primary',
    'text-foreground',
    'inline-flex',
    'items-center',
    'gap-1',
    'flex-col',
    'leading-tight',
    'text-center',
    'block',
    'w-full',
    'mb-0.5',
    'h-3.5',
    'w-3.5',
    'h-4',
    'w-4',
    'shrink-0',
    'border-2', 
    'border-amber-500/70',
    'border-slate-500/70',
    'border-orange-600/70'
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Noto Sans KR', 'sans-serif'],
        headline: ['Noto Sans KR', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          orange: 'hsl(var(--accent-orange))',
          yellow: 'hsl(var(--accent-yellow))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: { 
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
