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
    // Return a placeholder or null to prevent SSR/CSR mismatch issues before hydration
    // It's important for the placeholder to occupy the same space or for layout shifts to be acceptable
    return <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0 cursor-default" disabled aria-hidden="true" />;
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
      className="w-9 h-9 transition-colors duration-200 hover:bg-accent/10 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
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
