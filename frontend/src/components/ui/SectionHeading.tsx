'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  gradientTitle?: boolean;
  align?: 'left' | 'center';
  decorativeLine?: boolean;
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  gradientTitle = true,
  align = 'left',
  decorativeLine = true,
  className,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'relative mb-12 sm:mb-16',
        isCenter ? 'text-center mx-auto max-w-2xl' : 'text-left max-w-3xl',
        className
      )}
    >
      {badge && (
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider uppercase mb-3',
            'bg-primary/10 text-primary border border-primary/20'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {badge}
        </div>
      )}

      <h2
        className={cn(
          'text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight leading-tight',
          gradientTitle ? 'gradient-text' : 'text-foreground'
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-muted font-normal leading-relaxed">
          {subtitle}
        </p>
      )}

      {decorativeLine && (
        <div
          className={cn(
            'mt-5 flex items-center gap-1.5',
            isCenter && 'justify-center'
          )}
        >
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />
          <div className="h-1 w-2 rounded-full bg-accent/60" />
          <div className="h-1 w-1 rounded-full bg-primary/40" />
        </div>
      )}
    </motion.div>
  );
}

export default SectionHeading;
