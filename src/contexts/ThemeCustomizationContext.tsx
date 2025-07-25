"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeCustomization = 'default' | 'wood';

interface ThemeCustomizationContextType {
  theme: ThemeCustomization;
  setTheme: (theme: ThemeCustomization) => void;
}

const ThemeCustomizationContext = createContext<ThemeCustomizationContextType | undefined>(undefined);

export const ThemeCustomizationProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeCustomization>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('themeCustomization') as ThemeCustomization | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  const setTheme = (newTheme: ThemeCustomization) => {
    setThemeState(newTheme);
    localStorage.setItem('themeCustomization', newTheme);
    if (newTheme === 'wood') {
      document.documentElement.classList.add('theme-wood');
    } else {
      document.documentElement.classList.remove('theme-wood');
    }
  };

  useEffect(() => {
    if (theme === 'wood') {
      document.documentElement.classList.add('theme-wood');
    } else {
      document.documentElement.classList.remove('theme-wood');
    }
  }, [theme]);

  return (
    <ThemeCustomizationContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCustomizationContext.Provider>
  );
};

export const useThemeCustomization = () => {
  const context = useContext(ThemeCustomizationContext);
  if (context === undefined) {
    throw new Error('useThemeCustomization must be used within a ThemeCustomizationProvider');
  }
  return context;
};
