import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) {
      return <Inbox className="w-8 h-8 text-violet-400" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-8 h-8 text-violet-400" />;
  };

  return (
    <div
      className={cn(
        'glass-card flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 text-violet-400 shadow-inner">
        {renderIcon()}
      </div>

      <h3 className="text-xl font-semibold text-foreground font-display tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-muted leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={action.onClick}
          href={action.href}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
