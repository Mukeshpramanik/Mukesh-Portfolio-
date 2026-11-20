import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Calendar,
  Sparkles,
  FolderGit2,
  Tag,
  Share2,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { projectsData } from '@/data/profile';
import { fetchProject, fetchProjects } from '@/lib/api';
import { withBasePath } from '@/lib/utils';
import type { Project } from '@/types';

export const dynamicParams = false;

export async function generateStaticParams() {
  return projectsData.map((project) => ({
    slug: project.slug,
  }));
}

interface ProjectDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = params;

  // Find project in static data or fetch from backend
  let project: Project | undefined = projectsData.find((p) => p.slug === slug);

  if (!project) {
    try {
      const res = await fetchProject(slug);
      if (res?.data) {
        project = res.data;
      }
    } catch {
      // Handled below
    }
  }

  if (!project) {
    notFound();
  }

  // Related projects
  const relatedProjects = projectsData
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '2024';

  return (
    <PageTransition>
      <article className="py-24 sm:py-32 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to all projects</span>
            </Link>
          </div>

          {/* Project Header Card */}
          <div className="glass-card p-6 sm:p-10 border-border/80 mb-12 relative overflow-hidden">
            {/* Background glowing gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/15 via-accent/10 to-transparent blur-3xl pointer-events-none" />

            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <Badge variant="accent" size="md">
                {project.category}
              </Badge>

              {project.featured && (
                <Badge variant="warning" size="md">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Featured Project
                </Badge>
              )}

              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted ml-auto">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                {formattedDate}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-foreground tracking-tight mb-4 leading-tight">
              {project.title}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-xl text-muted leading-relaxed max-w-3xl mb-8">
              {project.description}
            </p>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.technologies.map((tech, i) => (
                <Badge
                  key={i}
                  variant="primary"
                  size="md"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Tag className="w-3 h-3 mr-1 opacity-70" />
                  {tech}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border/40">
              {project.githubUrl && (
                <Button
                  variant="primary"
                  href={project.githubUrl}
                  external
                  leftIcon={<Github className="w-4 h-4 mr-1" />}
                >
                  View Source Code
                </Button>
              )}

              {project.liveUrl && (
                <Button
                  variant="secondary"
                  href={project.liveUrl}
                  external
                  leftIcon={<ExternalLink className="w-4 h-4 mr-1 text-accent" />}
                >
                  Live Interactive Demo
                </Button>
              )}

              <Button
                variant="ghost"
                href="#contact"
                className="text-xs font-mono"
              >
                Discuss this project
              </Button>
            </div>
          </div>

          {/* Project Preview Image Showcase */}
          {project.imageUrl && (
            <div className="glass-card p-2 sm:p-3 border-border/80 mb-12 overflow-hidden rounded-2xl group shadow-2xl shadow-primary/20">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-surface-elevated border border-border/50">
                <img
                  src={withBasePath(project.imageUrl)}
                  alt={`${project.title} Preview Interface`}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
            </div>
          )}

          {/* Long Description Markdown Section */}
          <div className="glass-card p-6 sm:p-12 border-border/80 mb-16">
            <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h3:text-2xl prose-h3:text-foreground prose-h4:text-lg prose-h4:text-accent prose-p:text-muted prose-p:leading-relaxed prose-li:text-muted prose-strong:text-foreground prose-code:text-accent prose-code:bg-surface-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-surface-elevated prose-pre:border prose-pre:border-border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.longDescription || project.description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Related Projects Section */}
          {relatedProjects.length > 0 && (
            <div className="pt-8 border-t border-border/40">
              <h2 className="text-2xl font-bold font-display text-foreground tracking-tight mb-6">
                Other Featured Work
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/projects/${rel.slug}`}
                    className="block group"
                  >
                    <Card
                      variant="glass"
                      padding="md"
                      hoverLift={true}
                      className="h-full border-border/80 group-hover:border-primary/40 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[11px] font-mono text-accent block mb-2">
                          {rel.category}
                        </span>
                        <h3 className="text-base font-bold font-display text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                          {rel.title}
                        </h3>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {rel.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-4 pt-3 border-t border-border/40">
                        <span>Read Case Study</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </PageTransition>
  );
}
