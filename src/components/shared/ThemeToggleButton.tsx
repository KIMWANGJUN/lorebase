// src/components/shared/ThemeToggleButton.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggleButton() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid rendering button until mounted to prevent hydration mismatch
  if (!mounted) {
    // Placeholder button: initially transparent, on hover becomes visible with a light border
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 opacity-0 hover:opacity-100 hover:bg-secondary hover:text-foreground cursor-default transition-colors duration-200"
        aria-hidden="true"
      />
    );
  }

  const toggleTheme = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`w-9 h-9 transition-colors duration-200 hover:bg-secondary hover:text-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 theme-toggle ${resolvedTheme === 'dark' ? 'dark-mode' : 'light-mode'}`}
    >
      {/* Display Sun icon if current theme is dark, Moon icon if light */}
      {resolvedTheme === 'dark' ? (
        <Sun className={`h-[1.1rem] w-[1.1rem] text-yellow-400 theme-icon ${isTransitioning ? 'transitioning' : ''}`} />
      ) : (
        <Moon className={`h-[1.1rem] w-[1.1rem] text-primary theme-icon ${isTransitioning ? 'transitioning' : ''}`} />
      )}
    </Button>
  )
}
