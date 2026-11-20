'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Github,
  ExternalLink,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Code2,
  Layers,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { projectsData } from '@/data/profile';
import { cn } from '@/lib/utils';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

const categories = [
  'All',
  'Web Development',
  'AI/ML',
  'Data Analysis',
  'Automation',
];

export default function ProjectsPage() {
  const { projects: synchronizedProjects } = usePortfolioContent();
  const allProjectsList = synchronizedProjects && synchronizedProjects.length > 0 ? synchronizedProjects : projectsData;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTechnology, setSelectedTechnology] = useState('All');

  // Extract all unique technologies from projects
  const allTechnologies = useMemo(() => {
    const set = new Set<string>();
    allProjectsList.forEach((p) => {
      p.technologies?.forEach((t) => set.add(t));
    });
    return ['All', ...Array.from(set).sort()];
  }, [allProjectsList]);

  // Filtered projects based on search, category, and tech
  const filteredProjects = useMemo(() => {
    return allProjectsList.filter((project) => {
      // Category filter
      if (selectedCategory !== 'All' && project.category !== selectedCategory) {
        return false;
      }

      // Tech filter
      if (
        selectedTechnology !== 'All' &&
        !project.technologies.some(
          (t) => t.toLowerCase() === selectedTechnology.toLowerCase()
        )
      ) {
        return false;
      }

      // Search query (title, description, technologies)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesDesc = project.description.toLowerCase().includes(query);
        const matchesTech = project.technologies.some((t) =>
          t.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesDesc && !matchesTech) {
          return false;
        }
      }

      return true;
    });
  }, [allProjectsList, searchQuery, selectedCategory, selectedTechnology]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTechnology('All');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedTechnology !== 'All';

  return (
    <PageTransition>
      <div className="py-24 sm:py-32 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Portfolio"
            title="Projects & Case Studies"
            subtitle="Explore my software engineering, machine learning, and data analytics work with full source code and technical breakdowns."
            align="center"
          />

          {/* Search & Filter Toolbar */}
          <div className="max-w-5xl mx-auto mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Input
                  inputType="search"
                  placeholder="Search projects by name, keyword, or technology..."
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

              {/* Technology Filter Selector */}
              <div className="w-full md:w-64">
                <select
                  value={selectedTechnology}
                  onChange={(e) => setSelectedTechnology(e.target.value)}
                  className="w-full bg-surface-elevated/70 text-foreground border border-border/80 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="All">All Technologies</option>
                  {allTechnologies
                    .filter((t) => t !== 'All')
                    .map((tech) => (
                      <option key={tech} value={tech}>
                        {tech}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Category Pills & Active Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-surface-elevated/50 text-muted hover:text-foreground border border-border/60 hover:bg-surface-elevated'
                      )}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium self-start sm:self-center"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between text-xs font-mono text-muted">
            <span>
              Showing {filteredProjects.length} of {projectsData.length} projects
            </span>
          </div>

          {/* Projects Grid or Empty State */}
          {filteredProjects.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                      {/* Visual Header */}
                      <div className="relative h-44 w-full bg-gradient-to-br from-primary/20 via-surface-elevated to-accent/15 border-b border-border/60 p-5 flex flex-col justify-between overflow-hidden">
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

                        {!project.imageUrl && (
                          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                        )}

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
                              {project.createdAt
                                ? new Date(project.createdAt).toLocaleDateString(
                                    'en-US',
                                    { month: 'short', year: 'numeric' }
                                  )
                                : '2024'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
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

                        {/* Card Bottom Links */}
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
          ) : (
            <div className="py-12">
              <EmptyState
                icon={FolderGit2}
                title="No projects match your filter"
                description="Try clearing your search query or selecting a different category or technology."
                action={{
                  label: 'Clear All Filters',
                  onClick: resetFilters,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
