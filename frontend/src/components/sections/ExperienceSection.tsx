'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, Sparkles, Building2 } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { experienceData } from '@/data/profile';
import type { Experience } from '@/types';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

export interface ExperienceSectionProps {
  initialExperience?: Experience[];
  showEmptyPlaceholder?: boolean;
}

export function ExperienceSection({
  initialExperience,
  showEmptyPlaceholder = false,
}: ExperienceSectionProps) {
  const { experience: synchronizedExperience } = usePortfolioContent();
  const activeExperience = synchronizedExperience && synchronizedExperience.length > 0 ? synchronizedExperience : (initialExperience || experienceData);
  const hasExperience = activeExperience && activeExperience.length > 0;

  if (!hasExperience && !showEmptyPlaceholder) {
    return null;
  }

  return (
    <section id="experience" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Career"
          title="Work Experience"
          subtitle="Internships, industry exposure, and hands-on software development roles."
          align="center"
        />

        {hasExperience ? (
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute top-0 bottom-0 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-primary via-accent/30 to-transparent" />

            <div className="space-y-8">
              {activeExperience.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex items-start gap-4 sm:gap-6 pl-2 sm:pl-4"
                >
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-surface border-2 border-primary shadow-[0_0_20px_var(--glow-color)] text-primary shrink-0">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <Card
                    variant="glass"
                    padding="lg"
                    hoverLift={true}
                    className="flex-1 group border-border/80 hover:border-primary/40 relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight group-hover:text-primary transition-colors">
                            {exp.role}
                          </h3>
                          <Badge variant="accent" size="sm" className="capitalize">
                            {exp.type}
                          </Badge>
                        </div>
                        <p className="text-sm sm:text-base font-medium text-accent flex items-center gap-1.5 mt-1">
                          <Building2 className="w-4 h-4" />
                          <span>{exp.company}</span>
                          {exp.location && (
                            <>
                              <span className="text-muted">•</span>
                              <span className="text-xs text-muted flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {exp.location}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-primary bg-primary/10 border border-primary/20 self-start sm:self-center">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {exp.description}
                    </p>

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/40">
                        {exp.technologies.map((tech, i) => (
                          <Badge
                            key={i}
                            variant="default"
                            size="sm"
                            className="text-[11px] bg-surface-elevated/80"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center glass-card p-8 sm:p-10 border-border/80">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-display text-foreground mb-2">
              Seeking Internship Opportunities
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Currently an active B.Tech CSE student (2023–2027) actively seeking software development and data analytics internship opportunities.
            </p>
            <Button variant="primary" href="#contact" size="md">
              Get in Touch
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ExperienceSection;
