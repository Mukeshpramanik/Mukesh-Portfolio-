'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'glass' | 'elevated' | 'outline';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hoverLift?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface border border-border shadow-sm',
  glass:
    'glass-card bg-surface/75 backdrop-blur-xl border border-border/80 shadow-lg shadow-black/5',
  elevated:
    'bg-surface-elevated border border-border/80 shadow-md shadow-black/10',
  outline:
    'bg-transparent border border-border/80 hover:border-primary/50',
};

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export const Card = ({
  children,
  variant = 'glass',
  padding = 'md',
  hoverLift = true,
  glow = false,
  className,
  ...props
}: CardProps) => {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-300',
        variantClasses[variant],
        paddingClasses[padding],
        glow && 'hover:shadow-[0_0_30px_-5px_var(--glow-color)] hover:border-primary/40',
        hoverLift && 'hover:-translate-y-1.5 hover:shadow-xl',
        className
      )}
      {...props}
    >
      {/* Decorative gradient highlight border inside card */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/5" />
      {children}
    </motion.div>
  );
};

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-xl font-semibold tracking-tight text-foreground font-display',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted font-normal leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-border/40', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
