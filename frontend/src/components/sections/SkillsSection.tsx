'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Database,
  BarChart,
  Globe,
  Palette,
  TrendingUp,
  Table,
  PieChart,
  Calculator,
  LineChart,
  GitBranch,
  Braces,
  Cpu,
  Layers,
  Terminal,
  Brain,
  Wrench,
  Workflow,
  Binary,
  Sparkles,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { skillsData } from '@/data/profile';
import type { Skill } from '@/types';
import { cn } from '@/lib/utils';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

export const OFFICIAL_SKILL_CATEGORIES = [
  'Programming & Database',
  'Data Analytics',
  'Data Visualization & Business Intelligence',
  'Machine Learning & Artificial Intelligence',
  'Tools & Technologies',
];

const DEFAULT_CATEGORIES = ['All', ...OFFICIAL_SKILL_CATEGORIES];

function getCategoryIcon(category: string) {
  switch (category) {
    case 'All':
      return <Layers className="w-3.5 h-3.5 text-violet-400" />;
    case 'Programming & Database':
      return <Database className="w-3.5 h-3.5 text-cyan-400" />;
    case 'Data Analytics':
      return <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />;
    case 'Data Visualization & Business Intelligence':
      return <BarChart className="w-3.5 h-3.5 text-amber-400" />;
    case 'Machine Learning & Artificial Intelligence':
      return <Brain className="w-3.5 h-3.5 text-violet-400" />;
    case 'Tools & Technologies':
      return <Wrench className="w-3.5 h-3.5 text-emerald-400" />;
    default:
      return <Cpu className="w-3.5 h-3.5 text-muted" />;
  }
}

function getSkillIcon(iconName?: string, skillName?: string) {
  const query = `${iconName || ''} ${skillName || ''}`.toLowerCase();

  if (query.includes('brain') || query.includes('machine learning') || query.includes('scikit') || query.includes('ai') || query.includes('artificial')) {
    return <Brain className="w-5 h-5 text-violet-400" />;
  }
  if (query.includes('binary') || query.includes('supervised') || query.includes('classification')) {
    return <Binary className="w-5 h-5 text-indigo-400" />;
  }
  if (query.includes('database') || query.includes('sql') || query.includes('rdbms')) {
    return <Database className="w-5 h-5 text-cyan-400" />;
  }
  if (query.includes('pie-chart') || query.includes('power bi') || query.includes('dashboard') || query.includes('business intelligence')) {
    return <PieChart className="w-5 h-5 text-amber-400" />;
  }
  if (query.includes('bar-chart') || query.includes('seaborn')) {
    return <BarChart className="w-5 h-5 text-indigo-400" />;
  }
  if (query.includes('line-chart') || query.includes('matplotlib') || query.includes('metric') || query.includes('evaluation')) {
    return <LineChart className="w-5 h-5 text-blue-400" />;
  }
  if (query.includes('table') || query.includes('pandas') || query.includes('excel')) {
    return <Table className="w-5 h-5 text-emerald-400" />;
  }
  if (query.includes('calculator') || query.includes('numpy') || query.includes('statist')) {
    return <Calculator className="w-5 h-5 text-purple-400" />;
  }
  if (query.includes('trending') || query.includes('eda') || query.includes('data analysis') || query.includes('analytics')) {
    return <TrendingUp className="w-5 h-5 text-cyan-400" />;
  }
  if (query.includes('workflow') || query.includes('pipeline') || query.includes('cleaning') || query.includes('preprocessing') || query.includes('api')) {
    return <Workflow className="w-5 h-5 text-teal-400" />;
  }
  if (query.includes('git') || query.includes('github') || query.includes('branch')) {
    return <GitBranch className="w-5 h-5 text-orange-400" />;
  }
  if (query.includes('globe') || query.includes('html') || query.includes('web scraping') || query.includes('scraping')) {
    return <Globe className="w-5 h-5 text-emerald-400" />;
  }
  if (query.includes('palette') || query.includes('css')) {
    return <Palette className="w-5 h-5 text-fuchsia-400" />;
  }
  if (query.includes('braces') || query.includes('javascript') || query.includes('js')) {
    return <Braces className="w-5 h-5 text-yellow-400" />;
  }
  if (query.includes('terminal') || query.includes('linux') || query.includes('bash') || query.includes('jupyter') || query.includes('notebook')) {
    return <Terminal className="w-5 h-5 text-emerald-400" />;
  }
  if (query.includes('code') || query.includes('python') || query.includes('vs code')) {
    return <Code className="w-5 h-5 text-violet-400" />;
  }
  if (query.includes('wrench') || query.includes('tool')) {
    return <Wrench className="w-5 h-5 text-pink-400" />;
  }
  return <Cpu className="w-5 h-5 text-violet-400" />;
}

export function SkillsSection({ initialSkills }: { initialSkills?: Skill[] }) {
  const { skills: synchronizedSkills, websiteText } = usePortfolioContent();
  const allSkills = synchronizedSkills?.length > 0 ? synchronizedSkills : (initialSkills || skillsData);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dynamically compute category tabs to include official and any custom categories added via admin
  const categories = useMemo(() => {
    const presentCategories = Array.from(
      new Set(allSkills.map((s) => s.category).filter(Boolean))
    );
    const extraCategories = presentCategories.filter(
      (c) => !DEFAULT_CATEGORIES.includes(c)
    );
    return [...DEFAULT_CATEGORIES, ...extraCategories];
  }, [allSkills]);

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return allSkills;
    return allSkills.filter((s) => s.category === selectedCategory);
  }, [allSkills, selectedCategory]);

  return (
    <section id="skills" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Expertise"
          title={websiteText?.skillsTitle || "Skills & Competencies"}
          subtitle={websiteText?.skillsSubtitle || "A curated taxonomy of programming languages, data analytics frameworks, BI tools, and AI workflows."}
          align="center"
        />

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 sm:mb-16 max-w-5xl mx-auto">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 select-none flex items-center gap-1.5',
                  isSelected
                    ? 'text-white shadow-md'
                    : 'text-muted hover:text-foreground bg-surface-elevated/40 hover:bg-surface-elevated border border-border/60'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeSkillTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/25 border border-primary/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Skills Cards Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, index) => {
              const hasProficiency =
                typeof skill.proficiency === 'number' && skill.proficiency > 0;

              return (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.3) }}
                >
                  <Card
                    variant="glass"
                    padding="md"
                    hoverLift={true}
                    className="group hover:border-primary/40 transition-all flex flex-col justify-between h-full min-h-[100px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-surface-elevated border border-border/70 group-hover:border-primary/30 group-hover:scale-105 transition-all shrink-0">
                            {getSkillIcon(skill.icon, skill.name)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors truncate">
                              {skill.name}
                            </h4>
                            <span className="text-[11px] font-mono text-muted block truncate">
                              {skill.category}
                            </span>
                          </div>
                        </div>

                        {/* Display proficiency only where provided */}
                        {hasProficiency ? (
                          <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20 shrink-0">
                            {skill.proficiency}%
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                            Competency
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Animated Proficiency Bar rendered ONLY when proficiency is provided */}
                    {hasProficiency && (
                      <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden border border-border/40 mt-1">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary via-primary-dark to-accent"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.proficiency}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

export default SkillsSection;
