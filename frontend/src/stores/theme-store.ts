import { create } from 'zustand';
import { THEMES, DEFAULT_THEME_ID, getThemeById, type ThemeConfig } from '@/config/themes';

export type Theme = string;

interface ThemeState {
  theme: string;
  themeConfig: ThemeConfig;
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
}

export function applyThemeToDOM(themeId: string): ThemeConfig {
  const config = getThemeById(themeId);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', config.id);

    if (config.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    root.style.colorScheme = config.mode;
  }
  return config;
}

function resolveInitialTheme(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;

  try {
    const saved = localStorage.getItem('portfolio-theme') || localStorage.getItem('theme');
    if (saved) {
      // Backwards compatibility migration
      if (saved === 'dark') return DEFAULT_THEME_ID;
      if (saved === 'light') return 'minimal-light';
      // Validate that it's one of the 20 themes
      if (THEMES.some((t) => t.id === saved)) {
        return saved;
      }
    }

    // Default to system preference if light is requested
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'minimal-light';
    }
  } catch {
    // Ignore localStorage access errors
  }

  return DEFAULT_THEME_ID;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: DEFAULT_THEME_ID,
  themeConfig: getThemeById(DEFAULT_THEME_ID),

  setTheme: (themeId: string) => {
    const config = applyThemeToDOM(themeId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('portfolio-theme', config.id);
        localStorage.setItem('theme', config.id); // for backwards-compatibility
      } catch {
        // Ignore storage quotas / access errors
      }
    }
    set({ theme: config.id, themeConfig: config });
  },

  toggleTheme: () => {
    set((state) => {
      // Quick toggle between primary dark and minimal light, or next theme
      const nextThemeId = state.themeConfig.mode === 'dark' ? 'minimal-light' : DEFAULT_THEME_ID;
      const config = applyThemeToDOM(nextThemeId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('portfolio-theme', config.id);
          localStorage.setItem('theme', config.id);
        } catch {
          // Ignore
        }
      }
      return { theme: config.id, themeConfig: config };
    });
  },

  resetTheme: () => {
    const config = applyThemeToDOM(DEFAULT_THEME_ID);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('portfolio-theme', DEFAULT_THEME_ID);
        localStorage.setItem('theme', DEFAULT_THEME_ID);
      } catch {
        // Ignore
      }
    }
    set({ theme: DEFAULT_THEME_ID, themeConfig: config });
  },
}));
