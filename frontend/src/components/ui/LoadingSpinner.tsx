import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'accent' | 'white' | 'muted';
  text?: string;
  className?: string;
  textClassName?: string;
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  xs: 'w-3 h-3 border-[2px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

const colorClasses: Record<NonNullable<LoadingSpinnerProps['color']>, string> = {
  primary: 'border-violet-500/20 border-t-violet-500',
  accent: 'border-cyan-400/20 border-t-cyan-400',
  white: 'border-white/20 border-t-white',
  muted: 'border-slate-500/20 border-t-slate-400',
};

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  className,
  textClassName,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && (
        <span
          className={cn(
            'text-sm font-medium text-muted transition-colors',
            textClassName
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;
