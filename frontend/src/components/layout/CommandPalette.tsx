'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  User,
  FolderGit2,
  BookOpen,
  Mail,
  Sun,
  Moon,
  Download,
  Github,
  Linkedin,
  Terminal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPaletteStore } from '@/stores/command-palette-store';
import { useThemeStore } from '@/stores/theme-store';
import { THEMES } from '@/config/themes';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: 'Navigation' | 'Actions' | 'Social' | 'Themes';
  icon: React.ReactNode;
  perform: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, toggle, searchQuery, setSearchQuery } =
    useCommandPaletteStore();
  const { theme, themeConfig, setTheme, toggleTheme } = useThemeStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggle]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'nav-home',
        title: 'Home',
        description: 'Return to portfolio main landing page',
        category: 'Navigation',
        icon: <Home className="w-4 h-4 text-violet-400" />,
        perform: () => router.push('/'),
      },
      {
        id: 'nav-about',
        title: 'About Me',
        description: 'Read bio, background, skills, and experience',
        category: 'Navigation',
        icon: <User className="w-4 h-4 text-violet-400" />,
        perform: () => router.push('/about'),
      },
      {
        id: 'nav-projects',
        title: 'Projects',
        description: 'Explore full-stack, cloud, and AI projects',
        category: 'Navigation',
        icon: <FolderGit2 className="w-4 h-4 text-cyan-400" />,
        perform: () => router.push('/projects'),
      },
      {
        id: 'nav-blog',
        title: 'Blog Articles',
        description: 'Technical write-ups, tutorials, and insights',
        category: 'Navigation',
        icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
        perform: () => router.push('/blog'),
      },
      {
        id: 'nav-contact',
        title: 'Contact',
        description: 'Get in touch for collaborations or inquiries',
        category: 'Navigation',
        icon: <Mail className="w-4 h-4 text-amber-400" />,
        perform: () => router.push('/contact'),
      },
      {
        id: 'action-theme',
        title: `Quick Toggle: ${themeConfig.mode === 'dark' ? 'Minimal Light' : 'Dark Premium'}`,
        description: `Current: ${themeConfig.name} • Press T to toggle primary mode`,
        category: 'Actions',
        icon:
          themeConfig.mode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          ),
        perform: () => toggleTheme(),
        shortcut: 'T',
      },
      ...THEMES.map((t) => ({
        id: `theme-${t.id}`,
        title: `Theme: ${t.name}`,
        description: `${t.category} (${t.mode}) • ${t.description}`,
        category: 'Themes' as const,
        icon: (
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shrink-0 shadow-sm"
            style={{ backgroundColor: t.colors.primary }}
          />
        ),
        perform: () => setTheme(t.id),
      })),
      {
        id: 'action-resume',
        title: 'Download Resume',
        description: 'Open and save latest engineering resume (PDF)',
        category: 'Actions',
        icon: <Download className="w-4 h-4 text-cyan-400" />,
        perform: () => {
          const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
          window.open(`${base}/resume.pdf`, '_blank');
        },
      },
      {
        id: 'social-github',
        title: 'GitHub Profile',
        description: 'Browse open-source repositories and code',
        category: 'Social',
        icon: <Github className="w-4 h-4 text-foreground" />,
        perform: () => window.open('https://github.com/Mukeshpramanik', '_blank'),
      },
      {
        id: 'social-linkedin',
        title: 'LinkedIn Profile',
        description: 'Connect on professional network',
        category: 'Social',
        icon: <Linkedin className="w-4 h-4 text-blue-400" />,
        perform: () =>
          window.open('https://linkedin.com/in/mukeshpramanik', '_blank'),
      },
    ],
    [router, toggleTheme, setTheme, themeConfig]
  );

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    const query = searchQuery.toLowerCase().trim();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query) ||
        (cmd.description && cmd.description.toLowerCase().includes(query)) ||
        cmd.category.toLowerCase().includes(query)
    );
  }, [commands, searchQuery]);

  // Adjust selectedIndex if it goes out of bounds after filtering
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const executeCommand = (cmd: CommandItem) => {
    close();
    cmd.perform();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-surface/95 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-border/60">
              <Search className="w-5 h-5 text-muted shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-foreground placeholder:text-muted/60 text-base focus:outline-none"
              />
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-muted font-mono bg-surface-elevated rounded border border-border/60">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto p-2 divide-y divide-border/20"
            >
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((cmd, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
                        isSelected
                          ? 'bg-gradient-to-r from-violet-600/15 to-cyan-500/10 text-foreground border border-violet-500/25'
                          : 'text-muted hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg border transition-colors',
                            isSelected
                              ? 'bg-surface-elevated border-violet-500/30'
                              : 'bg-surface-elevated/50 border-border/60'
                          )}
                        >
                          {cmd.icon}
                        </div>
                        <div>
                          <p
                            className={cn(
                              'text-sm font-medium leading-none mb-1',
                              isSelected ? 'text-foreground' : 'text-foreground/90'
                            )}
                          >
                            {cmd.title}
                          </p>
                          {cmd.description && (
                            <p className="text-xs text-muted leading-tight">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted/70 uppercase">
                          {cmd.category}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer status bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-elevated/40 border-t border-border/40 text-[11px] text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border/60">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border/60">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border/60">↵</kbd>
                  <span>Select</span>
                </span>
              </div>
              <span className="font-mono text-[10px] text-violet-400">
                Mukesh Pramanik Portfolio
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
