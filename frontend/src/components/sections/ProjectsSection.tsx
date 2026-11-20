'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  ExternalLink,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Code2,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { projectsData } from '@/data/profile';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

const categories = [
  'All',
  'Web Development',
  'AI/ML',
  'Data Analysis',
  'Automation',
];

export function ProjectsSection({
  initialProjects,
}: {
  initialProjects?: Project[];
}) {
  const { projects: synchronizedProjects, websiteText } = usePortfolioContent();
  const allProjects = synchronizedProjects?.length > 0 ? synchronizedProjects : (initialProjects || projectsData);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects =
    activeCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Portfolio"
          title={websiteText?.projectsTitle || "Featured Projects"}
          subtitle={websiteText?.projectsSubtitle || "Explore some of the applications, machine learning models, and data pipelines I've engineered."}
          align="center"
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 sm:mb-16">
          {categories.map((category) => {
            const isSelected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 select-none',
                  isSelected
                    ? 'text-white font-semibold'
                    : 'text-muted hover:text-foreground bg-surface-elevated/40 hover:bg-surface-elevated border border-border/60'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeProjectPill"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg shadow-primary/25 border border-white/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="h-full flex"
              >
                <Card
                  variant="glass"
                  padding="none"
                  hoverLift={true}
                  className="flex flex-col w-full group border-border/80 hover:border-primary/40 overflow-hidden"
                >
                  {/* Visual Header / Cover banner */}
                  <div className="relative h-44 sm:h-48 w-full bg-gradient-to-br from-primary/20 via-surface-elevated to-accent/15 border-b border-border/60 p-5 flex flex-col justify-between overflow-hidden">
                    {/* Project Visual Image Preview */}
                    {project.imageUrl && (
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={project.imageUrl}
                          alt={`${project.title} Preview Interface`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Subtle edge vignette: clear in center so UI mockup is vivid, soft dark edges for badge readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-black/30 pointer-events-none" />
                      </div>
                    )}

                    {/* Decorative pattern for non-image fallback */}
                    {!project.imageUrl && (
                      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                    )}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary/15 blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-accent bg-background/85 border border-accent/40 backdrop-blur-md shadow-md">
                        {project.category}
                      </span>

                      {project.featured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold text-amber-300 bg-background/85 border border-amber-500/50 backdrop-blur-md shadow-md">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-background/85 border border-white/15 flex items-center justify-center text-primary shadow-md backdrop-blur-md">
                          <FolderGit2 className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-mono text-muted bg-background/85 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/10 shadow-sm">
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2024'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="group-hover:text-primary transition-colors"
                      >
                        <h3 className="text-xl font-bold font-display text-foreground tracking-tight mb-2 line-clamp-1">
                          {project.title}
                        </h3>
                      </Link>

                      <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-5">
                        {project.description}
                      </p>

                      {/* Tech tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.technologies.map((tech, i) => (
                          <Badge
                            key={i}
                            variant="default"
                            size="sm"
                            className="text-[11px] bg-surface-elevated/80 border-border/70"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`GitHub source for ${project.title}`}
                            className="p-2 rounded-lg text-muted hover:text-white hover:bg-surface-elevated transition-colors border border-transparent hover:border-border"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}

                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Live demo for ${project.title}`}
                            className="p-2 rounded-lg text-muted hover:text-accent hover:bg-surface-elevated transition-colors border border-transparent hover:border-border"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                      >
                        <span>Case Study</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Projects CTA */}
        <div className="mt-14 sm:mt-16 text-center">
          <Button
            href="/projects"
            variant="secondary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            className="hover:border-primary/40 shadow-sm"
          >
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
