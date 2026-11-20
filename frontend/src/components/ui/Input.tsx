'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  | 'search'
  | 'number'
  | 'tel'
  | 'url';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  inputType?: InputType;
  rows?: number;
}

export const Input = forwardRef<
  HTMLInputElement & HTMLTextAreaElement,
  InputProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      icon,
      inputType = 'text',
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const isPassword = inputType === 'password';
    const isTextarea = inputType === 'textarea';
    const isSearch = inputType === 'search';

    // Resolved actual HTML input type
    const resolvedType = isPassword
      ? showPassword
        ? 'text'
        : 'password'
      : isSearch
      ? 'search'
      : inputType;

    const baseInputStyles = cn(
      'w-full bg-surface-elevated/70 text-foreground placeholder:text-muted/60',
      'border border-border/80 rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
      'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-surface',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20',
      (icon || isSearch) && 'pl-11',
      isPassword && 'pr-11',
      className
    );

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Prefix Icon */}
          {(icon || isSearch) && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted">
              {isSearch && !icon ? <Search className="w-4 h-4" /> : icon}
            </div>
          )}

          {isTextarea ? (
            <textarea
              id={inputId}
              ref={ref as any}
              rows={rows}
              disabled={disabled}
              className={cn(baseInputStyles, 'resize-y min-h-[96px]')}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              id={inputId}
              ref={ref as any}
              type={resolvedType}
              disabled={disabled}
              className={baseInputStyles}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {/* Password toggle button */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="absolute right-3.5 p-1 text-muted hover:text-foreground transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-500 font-medium mt-1 animate-fade-in">
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
