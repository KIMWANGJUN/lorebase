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
    return <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0 cursor-default" disabled aria-hidden="true" />;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      className="w-9 h-9 transition-colors duration-200 hover:bg-accent/10 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 transition-transform duration-300 ease-in-out group-hover:rotate-12" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary transition-transform duration-300 ease-in-out group-hover:rotate-12" />
      )}
    </Button>
  )
}
