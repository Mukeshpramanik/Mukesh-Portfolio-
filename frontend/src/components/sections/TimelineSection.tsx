'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface TimelineItem {
  id?: string | number;
  date: string;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  icon?: React.ReactNode;
  badge?: string;
}

export interface TimelineSectionProps {
  items: TimelineItem[];
  className?: string;
  alternating?: boolean;
}

export function TimelineSection({
  items,
  className,
  alternating = true,
}: TimelineSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn('relative max-w-5xl mx-auto py-8', className)}>
      {/* Central / Left line */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent/40 to-transparent',
          alternating
            ? 'left-4 sm:left-6 md:left-1/2 -translate-x-1/2'
            : 'left-4 sm:left-6 -translate-x-1/2'
        )}
      />

      <div className="space-y-8 sm:space-y-12">
        {items.map((item, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={item.id ?? index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative flex items-start gap-4 sm:gap-6',
                alternating
                  ? 'flex-col md:flex-row md:items-center'
                  : 'flex-row'
              )}
            >
              {/* Timeline Dot Marker */}
              <div
                className={cn(
                  'absolute z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary bg-surface shadow-[0_0_15px_var(--glow-color)] transition-transform hover:scale-110',
                  alternating
                    ? 'left-4 sm:left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-auto'
                    : 'left-4 sm:left-6 -translate-x-1/2 top-4'
                )}
              >
                {item.icon ? (
                  <span className="text-primary w-4 h-4 flex items-center justify-center">
                    {item.icon}
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                )}
              </div>

              {/* Desktop Left Side Card or Date */}
              {alternating && (
                <div
                  className={cn(
                    'hidden md:block w-1/2 pl-0 pr-10',
                    isEven ? 'text-right' : 'order-2 pl-10 pr-0 text-left'
                  )}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-accent bg-accent/10 border border-accent/20 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                </div>
              )}

              {/* Content Card Container */}
              <div
                className={cn(
                  'w-full pl-12 sm:pl-16',
                  alternating
                    ? 'md:w-1/2 md:pl-0' +
                        (isEven
                          ? ' md:pl-10 md:order-2'
                          : ' md:pr-10 md:text-right')
                    : ''
                )}
              >
                <div className="glass-card p-6 sm:p-7 relative group hover:border-primary/40 transition-all duration-300">
                  {/* Glowing background hint on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur -z-10" />

                  {/* Mobile Date Badge */}
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-accent bg-accent/10 border border-accent/20 mb-3',
                      alternating ? 'md:hidden' : 'flex'
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>

                  {item.badge && (
                    <div className="mb-2">
                      <Badge variant="primary" size="sm">
                        {item.badge}
                      </Badge>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-foreground font-display tracking-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="text-sm font-medium text-accent mt-1">
                      {item.subtitle}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-sm text-muted mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div
                      className={cn(
                        'flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/40',
                        alternating && !isEven ? 'md:justify-end' : 'justify-start'
                      )}
                    >
                      {item.tags.map((tag, tagIdx) => (
                        <Badge
                          key={tagIdx}
                          variant="default"
                          size="sm"
                          className="text-[11px] bg-surface/80"
                        >
                          <Tag className="w-2.5 h-2.5 mr-1 opacity-60" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default TimelineSection;
