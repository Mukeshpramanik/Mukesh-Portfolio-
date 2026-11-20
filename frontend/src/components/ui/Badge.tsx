import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'default';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  onRemove?: () => void;
  interactive?: boolean;
}

const variantClasses: Record<BadgeVariant, { badge: string; dot: string }> = {
  primary: {
    badge:
      'bg-primary/10 text-primary border border-primary/30',
    dot: 'bg-primary',
  },
  accent: {
    badge:
      'bg-accent/10 text-accent border border-accent/30',
    dot: 'bg-accent',
  },
  success: {
    badge:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25',
    dot: 'bg-amber-500',
  },
  default: {
    badge:
      'bg-surface-elevated text-muted border border-border/80 hover:border-border',
    dot: 'bg-slate-400',
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium gap-1.5',
  md: 'text-xs px-3 py-1 rounded-full font-medium gap-2',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  onRemove,
  interactive = false,
  className,
  ...props
}: BadgeProps) {
  const currentVariant = variantClasses[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center transition-colors select-none whitespace-nowrap',
        currentVariant.badge,
        sizeClasses[size],
        interactive && 'cursor-pointer hover:opacity-85',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0 animate-pulse',
            currentVariant.dot
          )}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Remove badge"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

export default Badge;
