// src/components/layout/Header.tsx
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Gamepad2, Users, Store, ShieldCheck, LogIn, ChevronDown, User, Settings, LogOut, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/game-workshop', label: '게임 공방', icon: Store },
  { href: '/tavern', label: '선술집', icon: Users },
  { href: '/free-assets', label: '무료 에셋', icon: Gamepad2 },
];

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // 프로필 드롭다운 외부 클릭
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
      
      // 모바일 메뉴 외부 클릭 (햄버거 버튼은 제외)
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 모바일 메뉴가 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleProfileDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <style jsx global>{`
        /* 도현체 폰트 임포트 */
        @import url('https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap');
        
        /* 버튼 커스터마이징 CSS 변수 - 이 값들을 수정하여 버튼 모양을 조절하세요 */
        :root {
          /* 버튼 기본 설정 */
          --button-height: 34px;                /* 버튼 높이 */
          --button-margin-top: -13px;            /* 버튼 상단 위치 (음수값으로 위로 올림) */
          --button-border-radius: 0.7em;       /* 버튼 라운드 정도 */
          --button-padding: 0.9em 1.6em;        /* 버튼 패딩 */
          
          /* 3D 효과 설정 */
          --button-3d-depth: 0.5em;             /* 기본 3D 깊이 */
          --button-shadow-height: 0.4em;        /* 그림자 높이 */
          --button-hover-height: 0.2em;         /* 호버 시 버튼 높이 */
          --button-active-height: 0.5em;        /* 활성/클릭 시 버튼 높이 */
          --button-hover-shadow: 0.3em;         /* 호버 시 그림자 높이 */
          
          /* 프로필 버튼 설정 (다른 크기로 조절 가능) */
          --profile-button-width-min: 100px;
          --profile-button-width-max: 120px;

          /* 모바일 버튼 설정 */
          --mobile-button-margin: 0.5rem 0;     /* 모바일 버튼 간격 */
        }
        
        /* LOREBASE 로고 효과 - 크기 10% 증가 */
        .logo-button {
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 215, 0, 0.6) 50%,
            transparent 70%
          );
          transition: left 0.6s ease;
          z-index: 1;
        }

        .logo-button:hover::before {
          left: 100%;
        }

        .logo-button:hover {
          transform: scale(1.05);
        }

        .logo-button:active {
          transform: scale(1.0);
          transition: transform 0.1s ease;
        }

        .logo-button > * {
          position: relative;
          z-index: 2;
        }

        /* 햄버거 메뉴 버튼 - 가로폭 기준으로만 표시 */
        .hamburger-button {
          position: relative;
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
          z-index: 60;
          padding: 4px;
        }

        .hamburger-line {
          width: 20px;
          height: 2px;
          background-color: hsl(var(--foreground));
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }

        .hamburger-button.open .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger-button.open .hamburger-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger-button.open .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* 모바일 메뉴 오버레이 */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        /* 모바일 메뉴 - 완전히 숨김 처리 */
        .mobile-menu {
          position: fixed;
          top: 64px; /* 헤더 높이만큼 아래에서 시작 */
          left: 0;
          right: 0;
          background: hsl(var(--background));
          border-bottom: 1px solid hsl(var(--border));
          z-index: 50;
          transform: translateY(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          /* 닫혀있을 때 완전히 숨김 */
          visibility: hidden;
          pointer-events: none;
          opacity: 0;
        }

        .mobile-menu.open {
          transform: translateY(0);
          visibility: visible;
          pointer-events: auto;
          opacity: 1;
        }

        /* 다크모드 모바일 메뉴 */
        .dark .mobile-menu {
          background: rgb(28, 28, 28);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        /* 모바일 메뉴 내용 */
        .mobile-menu-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: var(--mobile-button-margin);
          max-height: calc(100vh - 64px);
          overflow-y: auto;
        }

        /* 모바일용 3D 버튼 (기존 스타일 상속) */
        .mobile-nav-button {
          position: relative;
          width: 100%;
          cursor: pointer;
          outline: none;
          border: 0;
          text-transform: inherit;
          font-size: 16px;
          font-family: 'Do Hyeon', sans-serif;
          font-weight: 400;
          padding: 1em 1.5em;
          border-radius: var(--button-border-radius);
          transform-style: preserve-3d;
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), background 150ms cubic-bezier(0, 0, 0.58, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          margin: var(--mobile-button-margin);
          min-height: 48px; /* 터치 친화적인 높이 */
        }

        /* 라이트 모드 모바일 3D 버튼 */
        .mobile-nav-button.light-mode {
          color: #2d3748;
          background: #f7fafc;
          border: 2px solid #d4af37;
        }

        .mobile-nav-button.light-mode::before {
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #e2e8f0;
          border-radius: inherit;
          box-shadow: 0 0 0 2px #d4af37, 0 0.4em 0 0 #cbd5e0;
          transform: translate3d(0, 0.5em, -1em);
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
        }

        .mobile-nav-button.light-mode:hover {
          background: #f7fafc;
          transform: translate(0, 0.15em);
          color: #d4af37;
        }

        .mobile-nav-button.light-mode:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0.3em 0 0 #cbd5e0;
          transform: translate3d(0, 0.35em, -1em);
        }

        .mobile-nav-button.light-mode:active {
          background: #f7fafc;
          transform: translate(0em, 0.5em);
        }

        .mobile-nav-button.light-mode:active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 #cbd5e0;
          transform: translate3d(0, 0, -1em);
        }

        /* 모바일 활성 상태 */
        .mobile-nav-button.light-mode.active {
          color: #d4af37;
          background: #f7fafc;
          transform: translate(0em, 0.5em);
        }

        .mobile-nav-button.light-mode.active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 #cbd5e0;
          transform: translate3d(0, 0, -1em);
        }

        .mobile-nav-button.light-mode.active .nav-icon {
          color: #d4af37;
          transform: scale(1.1);
        }

        /* 다크 모드 모바일 3D 버튼 */
        .dark .mobile-nav-button {
          color: #e2e8f0;
          background: rgb(40, 42, 43);
          border: 2px solid #d4af37;
        }

        .dark .mobile-nav-button::before {
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgb(28, 30, 31);
          border-radius: inherit;
          box-shadow: 0 0 0 2px #d4af37, 0 0.4em 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0.5em, -1em);
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
        }

        .dark .mobile-nav-button:hover {
          background: rgb(45, 47, 48);
          transform: translate(0, 0.15em);
          color: #d4af37;
        }

        .dark .mobile-nav-button:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0.3em 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0.35em, -1em);
        }

        .dark .mobile-nav-button:active {
          background: rgb(45, 47, 48);
          transform: translate(0em, 0.5em);
        }

        .dark .mobile-nav-button:active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0, -1em);
        }

        .dark .mobile-nav-button.active {
          color: #d4af37;
          background: rgb(45, 47, 48);
          transform: translate(0em, 0.5em);
        }

        .dark .mobile-nav-button.active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0, -1em);
        }

        .dark .mobile-nav-button.active .nav-icon {
          color: #d4af37;
          transform: scale(1.1);
        }

        /* 모바일 버튼 내용 */
        .mobile-nav-button > * {
          position: relative;
          z-index: 2;
        }

        .mobile-nav-button:not(.active):hover {
          color: #d4af37;
        }

        .mobile-nav-button:not(.active):hover .nav-icon {
          color: #d4af37;
          transform: scale(1.1);
        }

        /* 모바일 구분선 */
        .mobile-divider {
          height: 1px;
          background: hsl(var(--border));
          margin: 1rem 0;
        }

        /* 3D 버튼 스타일 (네비게이션 버튼) - CSS 변수 사용 */
        .nav-3d-button {
          position: relative;
          margin: auto;
          min-width: 80px;
          height: var(--button-height);
          cursor: pointer;
          outline: none;
          border: 0;
          text-transform: inherit;
          font-size: 14px;
          font-family: 'Do Hyeon', sans-serif;
          font-weight: 400;
          padding: var(--button-padding);
          border-radius: var(--button-border-radius);
          transform-style: preserve-3d;
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), background 150ms cubic-bezier(0, 0, 0.58, 1);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: var(--button-margin-top);
        }

        /* 라이트 모드 3D 버튼 */
        .nav-3d-button.light-mode {
          color: #2d3748;
          background: #f7fafc;
          border: 2px solid #d4af37;
        }

        .nav-3d-button.light-mode::before {
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #e2e8f0;
          border-radius: inherit;
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-shadow-height) 0 0 #cbd5e0;
          transform: translate3d(0, var(--button-3d-depth), -1em);
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
        }

        .nav-3d-button.light-mode:hover {
          background: #f7fafc;
          transform: translate(0, var(--button-hover-height));
        }

        .nav-3d-button.light-mode:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-hover-shadow) 0 0 #cbd5e0;
          transform: translate3d(0, var(--button-hover-shadow), -1em);
        }

        .nav-3d-button.light-mode:active {
          background: #f7fafc;
          transform: translate(0em, var(--button-active-height));
        }

        .nav-3d-button.light-mode:active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 #cbd5e0;
          transform: translate3d(0, 0, -1em);
        }

        /* 라이트모드 활성 상태 - 호버 효과 방지 */
        .nav-3d-button.light-mode.active {
          color: #d4af37;
          background: #f7fafc;
          transform: translate(0em, var(--button-active-height));
        }

        .nav-3d-button.light-mode.active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 #cbd5e0;
          transform: translate3d(0, 0, -1em);
        }

        .nav-3d-button.light-mode.active .nav-icon {
          color: #d4af37;
          transform: scale(1.1);
        }

        /* 라이트모드 활성 상태에서 호버 효과 제거 */
        .nav-3d-button.light-mode.active:hover {
          background: #f7fafc;
          transform: translate(0em, var(--button-active-height));
        }

        .nav-3d-button.light-mode.active:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 #cbd5e0;
          transform: translate3d(0, 0, -1em);
        }

        /* 다크 모드 3D 버튼 */
        .dark .nav-3d-button {
          color: #e2e8f0;
          background: rgb(40, 42, 43);
          border: 2px solid #d4af37;
        }

        .dark .nav-3d-button::before {
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgb(28, 30, 31);
          border-radius: inherit;
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-shadow-height) 0 0 rgb(20, 22, 23);
          transform: translate3d(0, var(--button-3d-depth), -1em);
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
        }

        .dark .nav-3d-button:hover {
          background: rgb(45, 47, 48);
          transform: translate(0, var(--button-hover-height));
        }

        .dark .nav-3d-button:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-hover-shadow) 0 0 rgb(20, 22, 23);
          transform: translate3d(0, var(--button-hover-shadow), -1em);
        }

        .dark .nav-3d-button:active {
          background: rgb(45, 47, 48);
          transform: translate(0em, var(--button-active-height));
        }

        .dark .nav-3d-button:active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0, -1em);
        }

        /* 다크모드 활성 상태 */
        .dark .nav-3d-button.active {
          color: #d4af37;
          background: rgb(45, 47, 48);
          transform: translate(0em, var(--button-active-height));
        }

        .dark .nav-3d-button.active::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0, -1em);
        }

        .dark .nav-3d-button.active .nav-icon {
          color: #d4af37;
          transform: scale(1.1);
        }

        /* 다크모드 활성 상태에서 호버 효과 제거 */
        .dark .nav-3d-button.active:hover {
          background: rgb(45, 47, 48);
          transform: translate(0em, var(--button-active-height));
        }

        .dark .nav-3d-button.active:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0, -1em);
        }

        /* 3D 버튼 내용 */
        .nav-3d-button > * {
          position: relative;
          z-index: 2;
        }

        /* 3D 버튼 호버 시 금색 효과 (활성 상태가 아닐 때만) */
        .nav-3d-button:not(.active):hover {
          color: #d4af37;
        }

        .nav-3d-button:not(.active):hover .nav-icon {
          color: #d4af37;
          transform: scale(1.1);
        }

        /* 커스텀 프로필 버튼 (3D 효과) - CSS 변수 사용 */
        .custom-profile-button {
          position: relative;
          margin: auto;
          min-width: var(--profile-button-width-min);
          max-width: var(--profile-button-width-max);
          height: var(--button-height);
          cursor: pointer;
          outline: none;
          border: 0;
          text-transform: inherit;
          font-size: 13px;
          font-family: 'Do Hyeon', sans-serif;
          font-weight: 400;
          padding: var(--button-padding);
          border-radius: var(--button-border-radius);
          transform-style: preserve-3d;
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), background 150ms cubic-bezier(0, 0, 0.58, 1);
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: space-between;
          margin-top: var(--button-margin-top);
        }

        /* 라이트 모드 커스텀 프로필 버튼 */
        .custom-profile-button.light-mode {
          color: #2d3748;
          background: #f7fafc;
          border: 2px solid #d4af37;
        }

        .custom-profile-button.light-mode::before {
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #e2e8f0;
          border-radius: inherit;
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-shadow-height) 0 0 #cbd5e0;
          transform: translate3d(0, var(--button-3d-depth), -1em);
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
        }

        .custom-profile-button.light-mode:hover {
          background: #f7fafc;
          transform: translate(0, var(--button-hover-height));
          color: #d4af37;
        }

        .custom-profile-button.light-mode:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-hover-shadow) 0 0 #cbd5e0;
          transform: translate3d(0, var(--button-hover-shadow), -1em);
        }

        .custom-profile-button.light-mode.dropdown-open {
          background: #f7fafc;
          transform: translate(0em, var(--button-active-height));
          color: #d4af37;
        }

        .custom-profile-button.light-mode.dropdown-open::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 #cbd5e0;
          transform: translate3d(0, 0, -1em);
        }

        /* 다크 모드 커스텀 프로필 버튼 */
        .dark .custom-profile-button {
          color: #e2e8f0;
          background: rgb(40, 42, 43);
          border: 2px solid #d4af37;
        }

        .dark .custom-profile-button::before {
          position: absolute;
          content: '';
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgb(28, 30, 31);
          border-radius: inherit;
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-shadow-height) 0 0 rgb(20, 22, 23);
          transform: translate3d(0, var(--button-3d-depth), -1em);
          transition: transform 150ms cubic-bezier(0, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
        }

        .dark .custom-profile-button:hover {
          background: rgb(45, 47, 48);
          transform: translate(0, var(--button-hover-height));
          color: #d4af37;
        }

        .dark .custom-profile-button:hover::before {
          box-shadow: 0 0 0 2px #d4af37, 0 var(--button-hover-shadow) 0 0 rgb(20, 22, 23);
          transform: translate3d(0, var(--button-hover-shadow), -1em);
        }

        .dark .custom-profile-button.dropdown-open {
          background: rgb(45, 47, 48);
          transform: translate(0em, var(--button-active-height));
          color: #d4af37;
        }

        .dark .custom-profile-button.dropdown-open::before {
          box-shadow: 0 0 0 2px #d4af37, 0 0 rgb(20, 22, 23);
          transform: translate3d(0, 0, -1em);
        }

        /* 커스텀 프로필 버튼 내용 */
        .custom-profile-button > * {
          position: relative;
          z-index: 2;
        }

        .custom-profile-button:hover .profile-info,
        .custom-profile-button.dropdown-open .profile-info {
          color: #d4af37;
        }

        .custom-profile-button:hover .chevron-icon,
        .custom-profile-button.dropdown-open .chevron-icon {
          color: #d4af37;
          transform: rotate(180deg);
        }

        /* 커스텀 드롭다운 래퍼 */
        .custom-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }

        /* 드롭다운 메뉴 스타일 */
        .custom-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          min-width: 200px;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 50;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-10px);
          animation: dropdownIn 0.2s ease-out forwards;
        }

        @keyframes dropdownIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-dropdown-menu.closing {
          animation: dropdownOut 0.2s ease-in forwards;
        }

        @keyframes dropdownOut {
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        /* 드롭다운 헤더 */
        .dropdown-header {
          padding: 16px;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted) / 0.5);
        }

        .dropdown-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }

        .dropdown-user-details h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .dropdown-user-details p {
          margin: 0;
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }

        /* 드롭다운 메뉴 아이템 */
        .dropdown-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: hsl(var(--foreground));
          text-decoration: none;
          transition: background-color 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 14px;
        }

        .dropdown-menu-item:hover {
          background: hsl(var(--muted));
        }

        .dropdown-menu-item svg {
          width: 16px;
          height: 16px;
          color: hsl(var(--muted-foreground));
        }

        /* 로그아웃 버튼 특별 스타일 */
        .logout-item {
          border-top: 1px solid #d4af37; /* 금색 구분선 */
          margin-top: 4px;
          transition: color 0.2s ease;
        }

        .logout-item:hover {
          color: #dc2626 !important; /* 호버 시 빨간색 텍스트 */
          background: hsl(var(--muted));
        }

        .logout-item:hover svg {
          color: #dc2626 !important; /* 호버 시 아이콘도 빨간색 */
        }

        /* 관리자 배지 */
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: hsl(var(--destructive) / 0.1);
          color: hsl(var(--destructive));
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          margin-top: 2px;
        }

        /* 테마 토글 버튼 스타일 */
        .theme-toggle {
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 다크모드: 가운데에서 테두리로 흰색 배경 */
        .theme-toggle.dark-mode::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background-color: white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s ease-out;
          z-index: 1;
        }

        .theme-toggle.dark-mode:hover::before {
          width: 100%;
          height: 100%;
        }

        /* 라이트모드: 가운데에서 테두리로 검은색 배경 */
        .theme-toggle.light-mode::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background-color: black;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s ease-out;
          z-index: 1;
        }

        .theme-toggle.light-mode:hover::before {
          width: 100%;
          height: 100%;
        }

        .theme-icon {
          position: relative;
          z-index: 2;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-icon.transitioning {
          animation: iconTransition 0.6s ease-in-out;
        }

        @keyframes iconTransition {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .theme-toggle:hover .theme-icon {
          transform: scale(1.1);
        }

        /* 관리자 버튼 (빨간색 기반) */
        .admin-button {
          position: relative;
          overflow: hidden;
          border: 2px solid #dc2626;
          color: #dc2626;
          background: transparent;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 14px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 4px;
          padding: 2px;
          background: conic-gradient(from 0deg, transparent, transparent, transparent, #dc2626, transparent, transparent, transparent);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0;
          animation: spin 2s linear infinite;
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        .admin-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            transparent 20%,
            rgba(220, 38, 38, 0.4) 40%,
            rgba(220, 38, 38, 0.7) 50%,
            rgba(220, 38, 38, 0.4) 60%,
            transparent 80%
          );
          transform: skewX(-20deg);
          transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
          border-radius: 4px;
        }

        .admin-button:hover::after {
          opacity: 1;
        }

        .admin-button:hover::before {
          left: 150%;
        }

        .admin-button:hover {
          border-color: #dc2626;
          background-color: #dc2626;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        }

        .admin-button:active {
          transform: translateY(0);
          transition: transform 0.1s ease;
        }

        .admin-button > * {
          position: relative;
          z-index: 3;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <header className={`sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:backdrop-blur ${
        isDark 
          ? '' 
          : 'bg-background/60 shadow-md'
      }`}
      style={isDark ? { backgroundColor: 'hsl(0 0% 5% / 0.6)' } : {}}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Group */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-end gap-0.5 group logo-button">
              <Image
                src="/assets/images/malamute-icon.webp"
                alt="LOREBASE Logo"
                width={28}
                height={28}
                className="transition-transform duration-300 group-hover:rotate-[-15deg] group-hover:scale-110"
              />
              <h1 className="font-logo text-2xl font-bold leading-none text-foreground group-hover:text-primary transition-colors duration-300">LOREBASE</h1>
            </Link>
          </div>

          {/* Desktop Nav Items Group - 가로폭 768px 이상에서만 표시 */}
          <nav className="hidden md:flex items-center space-x-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-3d-button light-mode ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="h-3.5 w-3.5 nav-icon transition-all duration-150" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="admin-button flex items-center gap-1 font-headline hover:font-bold active:font-bold"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                관리자
              </Link>
            )}
          </nav>

          {/* User Actions Group - 항상 표시 */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Mobile Hamburger Menu - 가로폭 768px 미만에서만 표시 */}
            <div className="md:hidden">
              <button
                ref={hamburgerRef}
                className={`hamburger-button ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "모바일 메뉴 닫기" : "모바일 메뉴 열기"}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
              </button>
            </div>

            <ThemeToggleButton />
            
            {user ? (
              <div className="custom-dropdown-wrapper" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className={`custom-profile-button light-mode ${isProfileDropdownOpen ? 'dropdown-open' : ''}`}
                  aria-label={isProfileDropdownOpen ? "프로필 메뉴 닫기" : "프로필 메뉴 열기"}
                  aria-expanded={isProfileDropdownOpen}
                >
                  <div className="flex items-center gap-2 profile-info">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-16">내 정보</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 chevron-icon transition-transform duration-200" />
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="custom-dropdown-menu">
                    {/* 드롭다운 헤더 */}
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-avatar">
                          {user.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div className="dropdown-user-details">
                          <h3>{user.nickname}</h3>
                          <p>{user.email}</p>
                          {isAdmin && (
                            <div className="admin-badge">
                              <ShieldCheck className="w-3 h-3" />
                              관리자
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 아이템들 */}
                    <Link 
                      href="/profile" 
                      className="dropdown-menu-item"
                      onClick={closeProfileDropdown}
                    >
                      <User />
                      내 프로필
                    </Link>

                    <Link 
                      href="/inquiries" 
                      className="dropdown-menu-item"
                      onClick={closeProfileDropdown}
                    >
                      <MessageCircle />
                      문의하기
                    </Link>

                    <Link 
                      href="/settings" 
                      className="dropdown-menu-item"
                      onClick={closeProfileDropdown}
                    >
                      <Settings />
                      설정
                    </Link>

                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className="dropdown-menu-item"
                        onClick={closeProfileDropdown}
                      >
                        <ShieldCheck />
                        관리자 대시보드
                      </Link>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="dropdown-menu-item logout-item"
                    >
                      <LogOut />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button asChild variant="ghost" className="text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu 컨테이너 - 모바일에서만 렌더링 */}
        <div className="md:hidden">
          {/* Mobile Menu Overlay - 조건부 렌더링 */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-menu-overlay open" 
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
          )}

          {/* Mobile Menu - 완전한 상태 관리 */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
            <div className="mobile-menu-content">
              {/* Mobile Navigation Buttons */}
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`mobile-nav-button light-mode ${isActive ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <item.icon className="h-5 w-5 nav-icon transition-all duration-150" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Admin Button */}
              {isAdmin && (
                <>
                  <div className="mobile-divider"></div>
                  <Link
                    href="/admin"
                    className="mobile-nav-button light-mode"
                    onClick={closeMobileMenu}
                  >
                    <ShieldCheck className="h-5 w-5 nav-icon transition-all duration-150" />
                    <span>관리자 대시보드</span>
                  </Link>
                </>
              )}

              {/* Mobile User Menu */}
              {user && (
                <>
                  <div className="mobile-divider"></div>
                  <Link 
                    href="/profile" 
                    className="mobile-nav-button light-mode"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5 nav-icon" />
                    내 프로필
                  </Link>

                  <Link 
                    href="/inquiries" 
                    className="mobile-nav-button light-mode"
                    onClick={closeMobileMenu}
                  >
                    <MessageCircle className="h-5 w-5 nav-icon" />
                    문의하기
                  </Link>

                  <Link 
                    href="/settings" 
                    className="mobile-nav-button light-mode"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-5 w-5 nav-icon" />
                    설정
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="mobile-nav-button light-mode"
                  >
                    <LogOut className="h-5 w-5 nav-icon" />
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
