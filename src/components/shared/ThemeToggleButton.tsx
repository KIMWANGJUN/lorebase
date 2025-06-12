// src/components/shared/ThemeToggleButton.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggleButton() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

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
        className="w-9 h-9 opacity-0 hover:opacity-100 hover:bg-transparent hover:border-muted-foreground border border-transparent cursor-default"
        aria-hidden="true"
      />
    );
  }

  const toggleTheme = () => {
    // If the current resolved theme is dark, switch to light, otherwise switch to dark.
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 transition-colors duration-200 border border-transparent hover:bg-transparent hover:border-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {/* Display Sun icon if current theme is dark, Moon icon if light */}
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 transition-transform duration-300 ease-in-out group-hover:rotate-12" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary transition-transform duration-300 ease-in-out group-hover:rotate-12" />
      )}
    </Button>
  )
}
