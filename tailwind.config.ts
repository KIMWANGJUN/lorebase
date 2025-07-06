import type {Config} from 'tailwindcss';

export default {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // 수채화 관련 클래스들 추가
    'watercolor-bg',
    'watercolor-card',
    'watercolor-hover',
    'watercolor-transition',
    'watercolor-text-gradient',
    'watercolor-button',
    'floating',
    'animate-watercolor-float',
    'animate-watercolor-pulse',
    'shadow-watercolor-light',
    'shadow-watercolor-dark',
    'shadow-watercolor-glow',
    'text-watercolor-primary',
    'text-watercolor-secondary',
    'text-watercolor-accent',
    'text-watercolor-text',
    'text-watercolor-muted',
    'bg-watercolor-primary',
    'bg-watercolor-surface',
    'border-watercolor-border',
    'border-watercolor-primary',
    
    // 기존 클래스들
    'text-gradient-gold',
    'text-gradient-silver',
    'text-gradient-bronze',
    'text-gradient-unity',
    'text-gradient-unreal',
    'text-gradient-godot',
    'text-gradient-general-rainbow',
    
    'bg-wrapper-gold',
    'bg-wrapper-silver',
    'bg-wrapper-bronze',
    'bg-wrapper-unity',
    'bg-wrapper-unreal',
    'bg-wrapper-godot',
    'bg-wrapper-general-rainbow',
    
    'admin-badge',
    'admin-text',
    'title-on-nickname-wrapper',
    'title-text-base',
    
    'icon-unity',
    'icon-unreal',
    'icon-godot',
    'icon-general',

    'text-transparent',
    'font-semibold',
    'font-medium',
    'font-bold',
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
    'border-yellow-600/70', 
    'border-yellow-500/70',
    'border-slate-600/70',
    'border-slate-500/70',
    'border-orange-700/70',
    'border-orange-600/70',
    'text-[10px]',
    'text-[11px]',
    'text-[13px]',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Jua', 'sans-serif'], 
        headline: ['Do Hyeon', 'sans-serif'], 
        logo: ['Black Han Sans', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        // 수채화 테마 색상 추가
        watercolor: {
          primary: 'var(--watercolor-primary)',
          secondary: 'var(--watercolor-secondary)',
          accent: 'var(--watercolor-accent)',
          background: 'var(--watercolor-background)',
          surface: 'var(--watercolor-surface)',
          text: 'var(--watercolor-text)',
          muted: 'var(--watercolor-muted)',
          border: 'var(--watercolor-border)',
        },
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
        // 수채화 애니메이션 추가
        'watercolor-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'watercolor-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // 수채화 애니메이션 추가
        'watercolor-float': 'watercolor-float 6s ease-in-out infinite',
        'watercolor-pulse': 'watercolor-pulse 4s ease-in-out infinite',
      },
      // 수채화 효과를 위한 그라디언트 추가
      backgroundImage: {
        'watercolor-light': 'linear-gradient(135deg, #F8F6F3 0%, #EFEBE6 50%, #E6E1DA 100%)',
        'watercolor-dark': 'linear-gradient(135deg, #2A2838 0%, #3D3A4B 50%, #4A4758 100%)',
        'watercolor-accent-light': 'linear-gradient(45deg, #D4B896 0%, #A8C0D4 100%)',
        'watercolor-accent-dark': 'linear-gradient(45deg, #C4A484 0%, #9FBACD 100%)',
      },
      // 수채화 효과를 위한 박스 섀도우 추가
      boxShadow: {
        'watercolor-light': '0 4px 20px rgba(139, 135, 151, 0.1), 0 1px 3px rgba(139, 135, 151, 0.05)',
        'watercolor-dark': '0 4px 20px rgba(28, 26, 36, 0.3), 0 1px 3px rgba(28, 26, 36, 0.1)',
        'watercolor-glow': '0 0 30px rgba(139, 127, 184, 0.3)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
