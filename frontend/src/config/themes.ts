/**
 * Portfolio Multi-Theme System Configuration
 * Defines 20 professionally art-directed visual themes with bespoke color palettes,
 * CSS variables, surface depth, gradients, and glow effects.
 */

export type ThemeCategory = 'Dark' | 'Light' | 'Vibrant' | 'Specialty';
export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  foreground: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  border: string;
  glassBg: string;
  glassBorder: string;
  glowColor: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  category: ThemeCategory;
  mode: ThemeMode;
  description: string;
  colors: ThemeColors;
}

export const DEFAULT_THEME_ID = 'dark-premium';

export const THEMES: ThemeConfig[] = [
  // 1. Dark Premium (Default)
  {
    id: 'dark-premium',
    name: 'Dark Premium',
    category: 'Dark',
    mode: 'dark',
    description: 'Sophisticated deep indigo-slate with radiant violet & cyan accents',
    colors: {
      background: '#0A0A0F',
      surface: '#12121A',
      surfaceElevated: '#1A1A26',
      foreground: '#F8FAFC',
      textSecondary: '#94A3B8',
      primary: '#8B5CF6',
      primaryLight: '#A78BFA',
      primaryDark: '#7C3AED',
      accent: '#06B6D4',
      accentLight: '#22D3EE',
      border: '#1E1E2E',
      glassBg: 'rgba(18, 18, 26, 0.75)',
      glassBorder: 'rgba(139, 92, 246, 0.18)',
      glowColor: 'rgba(139, 92, 246, 0.25)',
    },
  },

  // 2. Minimal Light
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    category: 'Light',
    mode: 'light',
    description: 'Clean Swiss editorial design with crisp white surfaces & royal indigo',
    colors: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceElevated: '#F1F5F9',
      foreground: '#0F172A',
      textSecondary: '#64748B',
      primary: '#4F46E5',
      primaryLight: '#6366F1',
      primaryDark: '#4338CA',
      accent: '#0284C7',
      accentLight: '#38BDF8',
      border: '#E2E8F0',
      glassBg: 'rgba(255, 255, 255, 0.85)',
      glassBorder: 'rgba(226, 232, 240, 0.9)',
      glowColor: 'rgba(79, 70, 229, 0.12)',
    },
  },

  // 3. Purple Glass
  {
    id: 'purple-glass',
    name: 'Purple Glass',
    category: 'Vibrant',
    mode: 'dark',
    description: 'Deep amethyst nebula with high-blur glass surfaces & neon fuchsia glow',
    colors: {
      background: '#0D071E',
      surface: '#160C30',
      surfaceElevated: '#211347',
      foreground: '#FAF5FF',
      textSecondary: '#C084FC',
      primary: '#A855F7',
      primaryLight: '#C084FC',
      primaryDark: '#9333EA',
      accent: '#EC4899',
      accentLight: '#F472B6',
      border: '#2E1C59',
      glassBg: 'rgba(22, 12, 48, 0.72)',
      glassBorder: 'rgba(168, 85, 247, 0.3)',
      glowColor: 'rgba(168, 85, 247, 0.35)',
    },
  },

  // 4. Cyberpunk Neon
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    category: 'Vibrant',
    mode: 'dark',
    description: 'Futuristic high-voltage laser cyan, hot pink and ink black contrast',
    colors: {
      background: '#05050A',
      surface: '#0D0D18',
      surfaceElevated: '#161626',
      foreground: '#FDF2F8',
      textSecondary: '#67E8F9',
      primary: '#06B6D4',
      primaryLight: '#22D3EE',
      primaryDark: '#0891B2',
      accent: '#F43F5E',
      accentLight: '#FB7185',
      border: '#1E293B',
      glassBg: 'rgba(13, 13, 24, 0.82)',
      glassBorder: 'rgba(6, 182, 212, 0.32)',
      glowColor: 'rgba(6, 182, 212, 0.38)',
    },
  },

  // 5. Ocean Blue
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    category: 'Dark',
    mode: 'dark',
    description: 'Deep marine oceanic abyss with luminous sapphire and aqua bioluminescence',
    colors: {
      background: '#051124',
      surface: '#0B1C38',
      surfaceElevated: '#11294F',
      foreground: '#F0F9FF',
      textSecondary: '#7DD3FC',
      primary: '#0284C7',
      primaryLight: '#38BDF8',
      primaryDark: '#0369A1',
      accent: '#14B8A6',
      accentLight: '#2DD4BF',
      border: '#153660',
      glassBg: 'rgba(11, 28, 56, 0.78)',
      glassBorder: 'rgba(56, 189, 248, 0.25)',
      glowColor: 'rgba(14, 165, 233, 0.32)',
    },
  },

  // 6. Emerald Green
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    category: 'Dark',
    mode: 'dark',
    description: 'Lush dark jade gemstone aesthetic with radiant mint and emerald accents',
    colors: {
      background: '#03140D',
      surface: '#082218',
      surfaceElevated: '#0D3223',
      foreground: '#ECFDF5',
      textSecondary: '#6EE7B7',
      primary: '#10B981',
      primaryLight: '#34D399',
      primaryDark: '#059669',
      accent: '#14B8A6',
      accentLight: '#5EEAD4',
      border: '#12422F',
      glassBg: 'rgba(8, 34, 24, 0.78)',
      glassBorder: 'rgba(16, 185, 129, 0.25)',
      glowColor: 'rgba(16, 185, 129, 0.3)',
    },
  },

  // 7. Sunset
  {
    id: 'sunset',
    name: 'Sunset',
    category: 'Vibrant',
    mode: 'dark',
    description: 'Warm twilight glow with tangerine orange, velvet magenta and dusk embers',
    colors: {
      background: '#130910',
      surface: '#200F1B',
      surfaceElevated: '#2E1527',
      foreground: '#FFF1F2',
      textSecondary: '#FDA4AF',
      primary: '#F97316',
      primaryLight: '#FB923C',
      primaryDark: '#EA580C',
      accent: '#E11D48',
      accentLight: '#F43F5E',
      border: '#401A33',
      glassBg: 'rgba(32, 15, 27, 0.78)',
      glassBorder: 'rgba(249, 115, 22, 0.25)',
      glowColor: 'rgba(244, 63, 94, 0.32)',
    },
  },

  // 8. Nord Arctic
  {
    id: 'nord-arctic',
    name: 'Nord Arctic',
    category: 'Dark',
    mode: 'dark',
    description: 'Scandinavian polar night palette with frost cyan and arctic aurora tones',
    colors: {
      background: '#242933',
      surface: '#2E3440',
      surfaceElevated: '#3B4252',
      foreground: '#ECEFF4',
      textSecondary: '#D8DEE9',
      primary: '#88C0D0',
      primaryLight: '#8FBCBB',
      primaryDark: '#81A1C1',
      accent: '#B48EAD',
      accentLight: '#D08770',
      border: '#434C5E',
      glassBg: 'rgba(46, 52, 64, 0.82)',
      glassBorder: 'rgba(136, 192, 208, 0.25)',
      glowColor: 'rgba(136, 192, 208, 0.28)',
    },
  },

  // 9. Dracula
  {
    id: 'dracula',
    name: 'Dracula',
    category: 'Specialty',
    mode: 'dark',
    description: 'Iconic developer dark palette with gothic purple, neon pink and mint cyan',
    colors: {
      background: '#1E1F29',
      surface: '#282A36',
      surfaceElevated: '#343746',
      foreground: '#F8F8F2',
      textSecondary: '#6272A4',
      primary: '#BD93F9',
      primaryLight: '#FF79C6',
      primaryDark: '#9A69D9',
      accent: '#50FA7B',
      accentLight: '#8BE9FD',
      border: '#44475A',
      glassBg: 'rgba(40, 42, 54, 0.82)',
      glassBorder: 'rgba(189, 147, 249, 0.28)',
      glowColor: 'rgba(189, 147, 249, 0.3)',
    },
  },

  // 10. Midnight Black
  {
    id: 'midnight-black',
    name: 'Midnight Black',
    category: 'Dark',
    mode: 'dark',
    description: 'Cosmic obsidian with subtle charcoal borders, ice blue and electric indigo',
    colors: {
      background: '#070709',
      surface: '#0F1015',
      surfaceElevated: '#171821',
      foreground: '#F1F5F9',
      textSecondary: '#94A3B8',
      primary: '#6366F1',
      primaryLight: '#818CF8',
      primaryDark: '#4F46E5',
      accent: '#38BDF8',
      accentLight: '#7DD3FC',
      border: '#1E202B',
      glassBg: 'rgba(15, 16, 21, 0.82)',
      glassBorder: 'rgba(99, 102, 241, 0.22)',
      glowColor: 'rgba(99, 102, 241, 0.28)',
    },
  },

  // 11. Rose Gold
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    category: 'Light',
    mode: 'light',
    description: 'Warm champagne luxury with blush rose, copper reflections and muted crimson',
    colors: {
      background: '#FDF8F6',
      surface: '#FFFFFF',
      surfaceElevated: '#F9ECE7',
      foreground: '#4A2828',
      textSecondary: '#8C5E5E',
      primary: '#E11D48',
      primaryLight: '#F43F5E',
      primaryDark: '#BE123C',
      accent: '#D97706',
      accentLight: '#F59E0B',
      border: '#EED8D2',
      glassBg: 'rgba(255, 255, 255, 0.86)',
      glassBorder: 'rgba(225, 29, 72, 0.18)',
      glowColor: 'rgba(225, 29, 72, 0.15)',
    },
  },

  // 12. Forest Green
  {
    id: 'forest-green',
    name: 'Forest Green',
    category: 'Dark',
    mode: 'dark',
    description: 'Deep woodland pine sanctuary with rich evergreen surfaces and lime highlights',
    colors: {
      background: '#08130B',
      surface: '#102215',
      surfaceElevated: '#18311F',
      foreground: '#F2FBF4',
      textSecondary: '#86EFAC',
      primary: '#22C55E',
      primaryLight: '#4ADE80',
      primaryDark: '#16A34A',
      accent: '#84CC16',
      accentLight: '#A3E635',
      border: '#1D3E26',
      glassBg: 'rgba(16, 34, 21, 0.8)',
      glassBorder: 'rgba(34, 197, 94, 0.22)',
      glowColor: 'rgba(34, 197, 94, 0.28)',
    },
  },

  // 13. Solarized
  {
    id: 'solarized',
    name: 'Solarized',
    category: 'Specialty',
    mode: 'dark',
    description: 'Scientifically calibrated teal base with solarized cyan and warm amber accents',
    colors: {
      background: '#002B36',
      surface: '#073642',
      surfaceElevated: '#0E4350',
      foreground: '#93A1A1',
      textSecondary: '#839496',
      primary: '#268BD2',
      primaryLight: '#2AA198',
      primaryDark: '#1A6A9E',
      accent: '#B58900',
      accentLight: '#CB4B16',
      border: '#0F4E5E',
      glassBg: 'rgba(7, 54, 66, 0.82)',
      glassBorder: 'rgba(38, 139, 210, 0.25)',
      glowColor: 'rgba(38, 139, 210, 0.26)',
    },
  },

  // 14. Lavender Dream
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    category: 'Light',
    mode: 'light',
    description: 'Gentle pastel lilac mist with soft violet typography and blooming pink accents',
    colors: {
      background: '#F8F6FF',
      surface: '#FFFFFF',
      surfaceElevated: '#EFEAFF',
      foreground: '#2E1E5E',
      textSecondary: '#6D559E',
      primary: '#7C3AED',
      primaryLight: '#8B5CF6',
      primaryDark: '#6D28D9',
      accent: '#EC4899',
      accentLight: '#F472B6',
      border: '#DDD3FF',
      glassBg: 'rgba(255, 255, 255, 0.88)',
      glassBorder: 'rgba(124, 58, 237, 0.18)',
      glowColor: 'rgba(124, 58, 237, 0.15)',
    },
  },

  // 15. Monochrome
  {
    id: 'monochrome',
    name: 'Monochrome',
    category: 'Specialty',
    mode: 'dark',
    description: 'High-contrast brutalist grayscale with silver speculars and graphite depths',
    colors: {
      background: '#0A0A0A',
      surface: '#141414',
      surfaceElevated: '#202020',
      foreground: '#FFFFFF',
      textSecondary: '#A3A3A3',
      primary: '#E5E5E5',
      primaryLight: '#FFFFFF',
      primaryDark: '#A3A3A3',
      accent: '#737373',
      accentLight: '#A3A3A3',
      border: '#2E2E2E',
      glassBg: 'rgba(20, 20, 20, 0.85)',
      glassBorder: 'rgba(255, 255, 255, 0.15)',
      glowColor: 'rgba(255, 255, 255, 0.12)',
    },
  },

  // 16. Warm Sand
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    category: 'Light',
    mode: 'light',
    description: 'Warm Mediterranean desert aesthetic with natural linen, terracotta and dark walnut',
    colors: {
      background: '#FBF7F0',
      surface: '#FFFFFF',
      surfaceElevated: '#F2EAE0',
      foreground: '#2C2219',
      textSecondary: '#705B48',
      primary: '#D97706',
      primaryLight: '#F59E0B',
      primaryDark: '#B45309',
      accent: '#C2410C',
      accentLight: '#EA580C',
      border: '#E3D5C3',
      glassBg: 'rgba(255, 255, 255, 0.88)',
      glassBorder: 'rgba(217, 119, 6, 0.2)',
      glowColor: 'rgba(217, 119, 6, 0.15)',
    },
  },

  // 17. Royal Purple
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    category: 'Vibrant',
    mode: 'dark',
    description: 'Majestic imperial velvet with radiant royal gold accents and deep amethyst',
    colors: {
      background: '#0E071A',
      surface: '#190D2E',
      surfaceElevated: '#261445',
      foreground: '#FAF5FF',
      textSecondary: '#D8B4FE',
      primary: '#9333EA',
      primaryLight: '#A855F7',
      primaryDark: '#7E22CE',
      accent: '#F59E0B',
      accentLight: '#FBBF24',
      border: '#3B1C6E',
      glassBg: 'rgba(25, 13, 46, 0.78)',
      glassBorder: 'rgba(245, 158, 11, 0.28)',
      glowColor: 'rgba(147, 51, 234, 0.35)',
    },
  },

  // 18. Crimson Red
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    category: 'Vibrant',
    mode: 'dark',
    description: 'Bold ruby & scarlet intensity over charcoal burgundy with burning ember glow',
    colors: {
      background: '#120508',
      surface: '#200A0F',
      surfaceElevated: '#2F0F16',
      foreground: '#FFF1F2',
      textSecondary: '#FDA4AF',
      primary: '#E11D48',
      primaryLight: '#F43F5E',
      primaryDark: '#BE123C',
      accent: '#F97316',
      accentLight: '#FB923C',
      border: '#45131E',
      glassBg: 'rgba(32, 10, 15, 0.8)',
      glassBorder: 'rgba(225, 29, 72, 0.3)',
      glowColor: 'rgba(225, 29, 72, 0.38)',
    },
  },

  // 19. Mint Fresh
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    category: 'Light',
    mode: 'light',
    description: 'Crisp eucalyptus & spearmint breeze with ultra-clean frosty white glass',
    colors: {
      background: '#F1FAF8',
      surface: '#FFFFFF',
      surfaceElevated: '#E0F5F0',
      foreground: '#0F3930',
      textSecondary: '#437A6E',
      primary: '#0D9488',
      primaryLight: '#14B8A6',
      primaryDark: '#0F766E',
      accent: '#059669',
      accentLight: '#10B981',
      border: '#BDEAE0',
      glassBg: 'rgba(255, 255, 255, 0.88)',
      glassBorder: 'rgba(13, 148, 136, 0.2)',
      glowColor: 'rgba(13, 148, 136, 0.16)',
    },
  },

  // 20. AMOLED Black
  {
    id: 'amoled-black',
    name: 'AMOLED Black',
    category: 'Specialty',
    mode: 'dark',
    description: 'True pitch #000000 black for OLED displays with vivid laser blue and electric cyan',
    colors: {
      background: '#000000',
      surface: '#070707',
      surfaceElevated: '#111111',
      foreground: '#FFFFFF',
      textSecondary: '#8E8E93',
      primary: '#2563EB',
      primaryLight: '#3B82F6',
      primaryDark: '#1D4ED8',
      accent: '#06B6D4',
      accentLight: '#22D3EE',
      border: '#1C1C1E',
      glassBg: 'rgba(7, 7, 7, 0.88)',
      glassBorder: 'rgba(37, 99, 235, 0.28)',
      glowColor: 'rgba(37, 99, 235, 0.35)',
    },
  },
];

export const THEMES_MAP = new Map<string, ThemeConfig>(
  THEMES.map((theme) => [theme.id, theme])
);

export function getThemeById(id: string): ThemeConfig {
  return THEMES_MAP.get(id) || THEMES[0];
}
