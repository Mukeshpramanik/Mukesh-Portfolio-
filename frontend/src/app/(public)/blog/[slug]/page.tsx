import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Share2,
  BookOpen,
  User,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { blogPostsData, profileData } from '@/data/profile';
import { fetchBlogPost } from '@/lib/api';
import type { BlogPost } from '@/types';

export const dynamicParams = false;

export async function generateStaticParams() {
  return blogPostsData.map((post) => ({
    slug: post.slug,
  }));
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostDetailPage({
  params,
}: BlogPostPageProps) {
  const { slug } = params;

  let post: BlogPost | undefined = blogPostsData.find((p) => p.slug === slug);

  if (!post) {
    try {
      const res = await fetchBlogPost(slug);
      if (res?.data) {
        post = res.data;
      }
    } catch {
      // Handled below
    }
  }

  if (!post) {
    notFound();
  }

  const shareUrl = `https://mukeshpramanik.com/blog/${slug}`;
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    post.title
  )}&url=${encodeURIComponent(shareUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <PageTransition>
      <article className="py-24 sm:py-32 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to all articles</span>
            </Link>
          </div>

          {/* Article Header Card */}
          <div className="glass-card p-6 sm:p-10 border-border/80 mb-10 relative overflow-hidden">
            {/* Background glowing gradient */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted mb-6">
              <span className="inline-flex items-center gap-1.5 text-accent">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt || post.createdAt}
              </span>

              <span>•</span>

              <span className="inline-flex items-center gap-1.5 text-primary">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes || 4} min read
              </span>

              <span>•</span>

              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted" />
                {profileData.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-foreground tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
              {post.tags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="default"
                  size="sm"
                  className="bg-surface-elevated text-xs"
                >
                  <Tag className="w-3 h-3 mr-1 opacity-70" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Markdown Content */}
          <div className="glass-card p-6 sm:p-12 border-border/80 mb-12">
            <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-2xl prose-h2:text-foreground prose-h3:text-xl prose-h3:text-accent prose-p:text-muted prose-p:leading-relaxed prose-li:text-muted prose-strong:text-foreground prose-code:text-accent prose-code:bg-surface-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-surface-elevated prose-pre:border prose-pre:border-border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Social Share & Back */}
          <div className="glass-card p-6 border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-accent" />
                Share this post:
              </span>
              <Button
                variant="outline"
                size="sm"
                href={shareTwitter}
                external
                className="text-xs"
              >
                Twitter / X
              </Button>
              <Button
                variant="outline"
                size="sm"
                href={shareLinkedIn}
                external
                className="text-xs"
              >
                LinkedIn
              </Button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              href="/blog"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5 mr-1" />}
            >
              All Articles
            </Button>
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
