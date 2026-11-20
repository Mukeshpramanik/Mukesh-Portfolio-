'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useThemeStore, applyThemeToDOM } from '@/stores/theme-store';
import { DEFAULT_THEME_ID, THEMES, type ThemeConfig } from '@/config/themes';

interface ThemeContextType {
  theme: string;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (themeId: string) => void;
  resetTheme: () => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, themeConfig, setTheme, toggleTheme, resetTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initial theme check on mount
    let initialThemeId = DEFAULT_THEME_ID;
    try {
      const savedTheme = localStorage.getItem('portfolio-theme') || localStorage.getItem('theme');
      if (savedTheme) {
        if (savedTheme === 'dark') initialThemeId = DEFAULT_THEME_ID;
        else if (savedTheme === 'light') initialThemeId = 'minimal-light';
        else if (THEMES.some((t) => t.id === savedTheme)) {
          initialThemeId = savedTheme;
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        initialThemeId = 'minimal-light';
      }
    } catch {
      // Fallback to default
    }

    setTheme(initialThemeId);
    setMounted(true);
  }, [setTheme]);

  // Keep DOM in sync if theme changes
  useEffect(() => {
    if (!mounted) return;
    applyThemeToDOM(theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        toggleTheme,
        setTheme,
        resetTheme,
        isMounted: mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
