'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Command as CommandIcon,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useThemeStore } from '@/stores/theme-store';
import { useCommandPaletteStore } from '@/stores/command-palette-store';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const { scrollDirection, isAtTop } = useScrollDirection({ threshold: 15 });
  const { theme, toggleTheme } = useThemeStore();
  const openCommandPalette = useCommandPaletteStore((state) => state.open);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isHidden = scrollDirection === 'down' && !isAtTop && !mobileMenuOpen;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out',
          isHidden ? '-translate-y-full' : 'translate-y-0',
          !isAtTop
            ? 'glass bg-background/80 border-b border-border/60 shadow-lg shadow-black/5'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Official MP Brand Logo - Top-Left Navbar */}
            <Link
              href="/"
              className="group flex items-center gap-2.5 sm:gap-3 focus:outline-none"
              aria-label="Mukesh Pramanik MP Logo - Home"
            >
              <BrandLogo
                size="md"
                withGlow
                className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-semibold text-base sm:text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                Mukesh <span className="text-primary">Pramanik</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-surface-elevated/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200',
                      isActive
                        ? 'text-white'
                        : 'text-muted hover:text-foreground hover:bg-surface-elevated/80'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-sm shadow-primary/25 -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Command Palette & Theme Selector & Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Command Palette Trigger Button */}
              <button
                type="button"
                onClick={openCommandPalette}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs text-muted font-mono rounded-lg border border-border/80 bg-surface-elevated/50 hover:border-primary/40 hover:text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Open command palette"
              >
                <CommandIcon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs">Quick Menu</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-surface rounded border border-border/60 text-muted shadow-sm">
                  ⌘K
                </kbd>
              </button>

              {/* Multi-Theme Selector (All 20 Themes) */}
              <ThemeSelector />

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-muted hover:text-foreground bg-surface-elevated/50 border border-border/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-surface border-l border-border/80 p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-6 border-b border-border/60">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 focus:outline-none group"
                    aria-label="Mukesh Pramanik MP Logo - Home"
                  >
                    <BrandLogo size="sm" withGlow />
                    <span className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                      Mukesh <span className="text-primary">Pramanik</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Links */}
                <div className="flex flex-col gap-1.5 py-6">
                  {navItems.map((item) => {
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-between',
                          isActive
                            ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/20'
                            : 'text-muted hover:text-foreground hover:bg-surface-elevated'
                        )}
                      >
                        <span>{item.name}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-border/60 space-y-3">
                <div className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-elevated border border-border/70">
                  <span className="text-xs font-medium text-muted pl-1">Theme</span>
                  <ThemeSelector />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCommandPalette();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border/80 bg-surface-elevated text-sm text-foreground hover:border-primary/40 transition-colors"
                >
                  <CommandIcon className="w-4 h-4 text-primary" />
                  <span>Command Palette (⌘K)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
