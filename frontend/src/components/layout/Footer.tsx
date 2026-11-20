'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Mail, ArrowUp, Heart, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';

import { usePortfolioContent } from '@/hooks/usePortfolioContent';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { personal } = usePortfolioContent();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      href: personal.socialLinks?.github || 'https://github.com/Mukeshpramanik',
      icon: <Github className="w-4 h-4" />,
    },
    {
      name: 'LinkedIn',
      href: personal.socialLinks?.linkedin || 'https://linkedin.com/in/mukesh-pramanik',
      icon: <Linkedin className="w-4 h-4" />,
    },
    {
      name: 'Email',
      href: `mailto:${personal.email || 'mukesh@example.com'}`,
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  return (
    <footer className="relative bg-background border-t border-border/60 overflow-hidden">
      {/* Subtle top gradient glow line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-border/40">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus:outline-none group"
              aria-label="Mukesh Pramanik MP Logo - Home"
            >
              <BrandLogo
                size="sm"
                withGlow
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-bold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
                {personal.name ? personal.name : 'Mukesh Pramanik'}
              </span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              {personal.bio || 'B.Tech Computer Science Engineering student passionate about Data Analytics, Python programming, and Software Development.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-surface-elevated/70 border border-border/80 flex items-center justify-center text-muted hover:text-foreground hover:border-primary/40 hover:bg-surface transition-all"
                  aria-label={item.name}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-foreground transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-muted text-xs font-mono">
                  Available for select opportunities
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Looking for impactful frontend, full-stack, and AI engineering projects.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p className="flex items-center gap-1.5">
            <span>© {currentYear} Mukesh Pramanik. All rights reserved.</span>
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
