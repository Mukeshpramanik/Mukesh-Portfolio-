'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  external?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:from-primary-light hover:to-primary active:from-primary-dark active:to-primary-dark border border-white/20',
  secondary:
    'bg-surface-elevated text-foreground hover:bg-surface border border-border shadow-sm hover:border-primary/40',
  outline:
    'border border-border/80 bg-transparent text-foreground hover:border-primary hover:bg-primary/10 active:bg-primary/20',
  ghost:
    'bg-transparent text-muted hover:text-foreground hover:bg-surface-elevated/60 active:bg-surface-elevated',
  danger:
    'bg-red-600/90 text-white hover:bg-red-500 active:bg-red-700 shadow-lg shadow-red-600/20 border border-red-500/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8 font-medium',
  md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10 font-medium',
  lg: 'text-base px-6 py-3 rounded-xl gap-2.5 h-12 font-semibold',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      href,
      external = false,
      fullWidth = false,
      disabled,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseClasses = cn(
      'inline-flex items-center justify-center transition-colors duration-200 select-none relative overflow-hidden',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
      className
    );

    const content = (
      <>
        {isLoading && (
          <LoadingSpinner
            size={size === 'lg' ? 'md' : 'sm'}
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
            className="mr-1"
          />
        )}
        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {leftIcon}
          </span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {rightIcon}
          </span>
        )}
      </>
    );

    if (href && !isDisabled) {
      if (external) {
        return (
          <motion.a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClasses}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.a>
        );
      }

      return (
        <Link href={href} passHref legacyBehavior>
          <motion.a
            ref={ref as React.Ref<HTMLAnchorElement>}
            className={baseClasses}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.a>
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={baseClasses}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15 }}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
