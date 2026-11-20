'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Check,
  RotateCcw,
  X,
  Search,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { THEMES, DEFAULT_THEME_ID, type ThemeConfig, type ThemeCategory } from '@/config/themes';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  className?: string;
  compact?: boolean;
}

const CATEGORIES: ('All' | ThemeCategory)[] = ['All', 'Dark', 'Light', 'Vibrant', 'Specialty'];

export function ThemeSelector({ className, compact = false }: ThemeSelectorProps) {
  const { theme, themeConfig, setTheme, resetTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | ThemeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  // Filtered themes
  const filteredThemes = useMemo(() => {
    return THEMES.filter((t) => {
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          'p-2 rounded-xl text-muted bg-surface-elevated/50 border border-border/80 transition-colors',
          className
        )}
        aria-label="Theme selector"
      >
        <Palette className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Current theme: ${themeConfig.name}. Click to change theme`}
        aria-expanded={isOpen}
        className={cn(
          'group relative flex items-center gap-2 p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
          compact
            ? 'bg-surface-elevated/60 border border-border/80 hover:border-primary/50 text-foreground'
            : 'px-2.5 sm:px-3 py-1.5 bg-surface-elevated/50 hover:bg-surface-elevated border border-border/80 hover:border-primary/40 text-foreground shadow-sm'
        )}
      >
        {/* Palette icon with glowing pulse on hover */}
        <div className="relative">
          <Palette className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-45" />
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-background animate-pulse"
            style={{ backgroundColor: themeConfig.colors.accent }}
          />
        </div>

        {!compact && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium">
            <span className="text-muted group-hover:text-foreground transition-colors">Theme:</span>
            <span className="font-semibold text-primary">{themeConfig.name}</span>
          </span>
        )}

        {/* Mini Preview Chip */}
        <div className="hidden lg:flex items-center -space-x-1 pl-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/20"
            style={{ backgroundColor: themeConfig.colors.primary }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/20"
            style={{ backgroundColor: themeConfig.colors.accent }}
          />
        </div>
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2.5 z-50 w-auto sm:w-[460px] max-w-[calc(100vw-2rem)] rounded-2xl bg-surface/95 backdrop-blur-2xl border border-border/90 shadow-2xl shadow-black/30 overflow-hidden flex flex-col"
            style={{
              maxHeight: 'calc(85vh - 5rem)',
            }}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-border/60 bg-surface-elevated/40">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                      <span>Choose Portfolio Theme</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                        {THEMES.length} Themes
                      </span>
                    </h3>
                    <p className="text-xs text-muted">
                      Personalize color palette, surfaces &amp; mood
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                  aria-label="Close theme selector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search themes by name or mood (e.g. cyber, light, emerald)..."
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-surface border border-border/80 rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-muted hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((cat) => {
                  const count =
                    cat === 'All' ? THEMES.length : THEMES.filter((t) => t.category === cat).length;
                  const isSelected = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150',
                        isSelected
                          ? 'bg-primary text-white shadow-sm shadow-primary/20 font-semibold'
                          : 'bg-surface/80 hover:bg-surface-elevated text-muted hover:text-foreground border border-border/50'
                      )}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Theme Grid */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[380px] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredThemes.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-muted">
                  No themes found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredThemes.map((t) => {
                  const isActive = theme === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                      }}
                      className={cn(
                        'group relative flex flex-col p-3 rounded-xl text-left transition-all duration-200 border',
                        isActive
                          ? 'bg-surface-elevated border-primary shadow-md ring-1 ring-primary'
                          : 'bg-surface/60 hover:bg-surface-elevated border-border/70 hover:border-primary/40'
                      )}
                    >
                      {/* Top Bar: Name & Mode / Check */}
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {t.name}
                        </span>

                        {isActive ? (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                            {t.mode === 'dark' ? (
                              <Moon className="w-2.5 h-2.5" />
                            ) : (
                              <Sun className="w-2.5 h-2.5" />
                            )}
                            {t.category}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-muted leading-snug line-clamp-1 mb-2.5">
                        {t.description}
                      </p>

                      {/* Color Palette Swatch Bar */}
                      <div
                        className="w-full h-4 rounded-md p-0.5 flex items-center gap-1 border shadow-inner"
                        style={{
                          backgroundColor: t.colors.background,
                          borderColor: t.colors.border,
                        }}
                      >
                        <span
                          className="h-full flex-1 rounded-sm shadow-sm"
                          style={{ backgroundColor: t.colors.surface }}
                          title="Surface"
                        />
                        <span
                          className="h-full flex-1 rounded-sm shadow-sm"
                          style={{ backgroundColor: t.colors.primary }}
                          title="Primary Accent"
                        />
                        <span
                          className="h-full flex-1 rounded-sm shadow-sm"
                          style={{ backgroundColor: t.colors.accent }}
                          title="Secondary Accent"
                        />
                        <span
                          className="h-full flex-1 rounded-sm shadow-sm"
                          style={{ backgroundColor: t.colors.foreground }}
                          title="Text"
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:px-4 sm:py-3 border-t border-border/60 bg-surface-elevated/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeConfig.colors.primary }} />
                <span>
                  Active: <strong className="text-foreground">{themeConfig.name}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetTheme();
                }}
                disabled={theme === DEFAULT_THEME_ID}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  theme === DEFAULT_THEME_ID
                    ? 'text-muted/50 cursor-not-allowed'
                    : 'text-primary hover:text-primary-light hover:bg-primary/10'
                )}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeSelector;
