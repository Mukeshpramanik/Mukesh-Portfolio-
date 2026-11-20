'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn, withBasePath } from '@/lib/utils';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  imageClassName?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  withGlow?: boolean;
}

const sizeMap: Record<BrandLogoSize, { px: number; containerClass: string }> = {
  xs: { px: 24, containerClass: 'w-6 h-6' },
  sm: { px: 32, containerClass: 'w-8 h-8' },
  md: { px: 40, containerClass: 'w-10 h-10' },
  lg: { px: 48, containerClass: 'w-12 h-12' },
  xl: { px: 80, containerClass: 'w-20 h-20' },
  '2xl': { px: 112, containerClass: 'w-28 h-28' },
};

/**
 * Official Mukesh Pramanik MP Brand Logo Component
 * - Renders the official MP brand emblem
 * - Uses object-fit: contain to preserve original design, proportions, and MP lettering
 * - Includes an accessible alt attribute: "Mukesh Pramanik MP Logo"
 * - Provides an elegant silver/purple SVG fallback if the image file is unavailable
 * - Full GitHub Pages basePath compatibility
 */
export function BrandLogo({
  size = 'md',
  className,
  imageClassName,
  src,
  alt = 'Mukesh Pramanik MP Logo',
  priority = false,
  withGlow = false,
}: BrandLogoProps) {
  const { personal } = usePortfolioContent();
  const [hasError, setHasError] = useState(false);
  const sizeConfig = sizeMap[size] || sizeMap.md;

  // Resolve source: custom prop > personal.logoUrl > default path
  const rawSrc = src || personal?.logoUrl || '/images/mp-logo.png';
  const resolvedSrc = withBasePath(rawSrc);

  return (
    <div
      className={cn(
        'relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden select-none',
        sizeConfig.containerClass,
        withGlow &&
          'shadow-[0_0_20px_-3px_rgba(147,51,234,0.35)] hover:shadow-[0_0_25px_0_rgba(147,51,234,0.55)] transition-shadow duration-300',
        className
      )}
    >
      {!hasError ? (
        <Image
          src={resolvedSrc}
          alt={alt}
          width={sizeConfig.px}
          height={sizeConfig.px}
          priority={priority}
          unoptimized
          onError={() => setHasError(true)}
          className={cn(
            'w-full h-full object-contain pointer-events-none transition-transform duration-300',
            imageClassName
          )}
        />
      ) : (
        /* Fallback: High-fidelity Silver & Purple MP Orbit Emblem SVG */
        <svg
          viewBox="0 0 100 100"
          className={cn('w-full h-full object-contain', imageClassName)}
          role="img"
          aria-label={alt}
        >
          <defs>
            <linearGradient id="fallbackSilver" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="fallbackPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="fallbackRing" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#0A0A0F" stroke="#9333EA" strokeWidth="1.5" />
          <ellipse
            cx="50"
            cy="52"
            rx="42"
            ry="18"
            fill="none"
            stroke="url(#fallbackRing)"
            strokeWidth="3"
            transform="rotate(-25 50 52)"
          />
          <text
            x="36"
            y="62"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="34"
            fontWeight="900"
            fill="url(#fallbackSilver)"
            textAnchor="middle"
          >
            M
          </text>
          <text
            x="64"
            y="62"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="34"
            fontWeight="900"
            fill="url(#fallbackPurple)"
            textAnchor="middle"
          >
            P
          </text>
        </svg>
      )}
    </div>
  );
}

export default BrandLogo;
