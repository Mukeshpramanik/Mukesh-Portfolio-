'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { blogPostsData } from '@/data/profile';
import { cn } from '@/lib/utils';

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Collect unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    blogPostsData.forEach((post) => {
      post.tags?.forEach((tag) => set.add(tag));
    });
    return ['All', ...Array.from(set).sort()];
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return blogPostsData.filter((post) => {
      if (selectedTag !== 'All' && !post.tags.includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchesTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedTag]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTag('All');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedTag !== 'All';

  return (
    <PageTransition>
      <div className="py-24 sm:py-32 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <SectionHeading
            badge="Articles & Insights"
            title="Technical Blog"
            subtitle="Thoughts, tutorials, and practical explorations in Python development, data analytics, and algorithmic engineering."
            align="center"
          />

          {/* Search & Tag Filter Toolbar */}
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            <div className="relative">
              <Input
                inputType="search"
                placeholder="Search articles by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface/80"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tags Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-surface-elevated/50 text-muted hover:text-foreground border border-border/60 hover:bg-surface-elevated'
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Posts Grid or Empty State */}
          {filteredPosts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="h-full flex"
                  >
                    <Card
                      variant="glass"
                      padding="none"
                      hoverLift={true}
                      className="flex flex-col w-full group border-border/80 hover:border-primary/40 overflow-hidden"
                    >
                      {/* Cover Image Placeholder */}
                      <div className="relative h-44 w-full bg-gradient-to-br from-primary/20 via-surface-elevated to-accent/15 border-b border-border/60 p-5 flex flex-col justify-between overflow-hidden">
                        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-accent bg-accent/10 border border-accent/30">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTimeMinutes || 4} min read</span>
                          </div>

                          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {post.publishedAt || post.createdAt}
                          </span>
                        </div>

                        <div className="relative z-10 w-10 h-10 rounded-xl bg-surface/80 border border-white/10 flex items-center justify-center text-primary shadow-md">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="group-hover:text-primary transition-colors"
                          >
                            <h3 className="text-xl font-bold font-display text-foreground tracking-tight mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                          </Link>

                          <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-5">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {post.tags.map((tag, i) => (
                              <Badge
                                key={i}
                                variant="default"
                                size="sm"
                                className="text-[11px] bg-surface-elevated/80"
                              >
                                <Tag className="w-2.5 h-2.5 mr-1 opacity-60" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border/40">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                          >
                            <span>Read Article</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={FileText}
                title="No blog posts yet. Check back soon!"
                description="Articles and tutorials are currently being drafted. Stay tuned for updates on Python, data analytics, and machine learning."
                action={
                  hasActiveFilters
                    ? {
                        label: 'Clear Filters',
                        onClick: resetFilters,
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
