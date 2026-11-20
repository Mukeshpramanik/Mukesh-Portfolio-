'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calendar, Award, BookOpen } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { educationData } from '@/data/profile';
import type { Education } from '@/types';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

export function EducationSection({
  initialEducation,
}: {
  initialEducation?: Education[];
}) {
  const { education: synchronizedEducation } = usePortfolioContent();
  const activeEducation = synchronizedEducation?.length > 0 ? synchronizedEducation : (initialEducation || educationData);

  if (!activeEducation || activeEducation.length === 0) return null;

  return (
    <section id="education" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Academics"
          title="Education & Qualifications"
          subtitle="My academic foundation in Computer Science Engineering, theoretical computer science, and practical system design."
          align="center"
        />

        <div className="max-w-4xl mx-auto relative">
          {/* Subtle vertical accent glow */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-primary via-accent/30 to-transparent" />

          <div className="space-y-8">
            {activeEducation.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex items-start gap-4 sm:gap-6 pl-2 sm:pl-4"
              >
                {/* Timeline Node Icon */}
                <div className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-surface border-2 border-primary shadow-[0_0_20px_var(--glow-color)] text-primary shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Card Container */}
                <Card
                  variant="glass"
                  padding="lg"
                  hoverLift={true}
                  className="flex-1 group border-border/80 hover:border-primary/40 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {item.degree} in {item.field}
                      </h3>
                      <p className="text-sm sm:text-base font-medium text-accent flex items-center gap-1.5 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{item.institution}</span>
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-primary bg-primary/10 border border-primary/20 self-start sm:self-center">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {item.startYear} – {item.endYear || 'Present'}
                      </span>
                    </div>
                  </div>

                  {item.gpa && item.gpa !== 0 && item.gpa !== '0' && (
                    <div className="mb-4">
                      <Badge variant="accent" size="sm">
                        <Award className="w-3 h-3 mr-1" />
                        GPA / Aggregate: {item.gpa}
                      </Badge>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-sm text-muted leading-relaxed mt-2">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-2 text-xs text-muted">
                    <span className="font-mono text-accent">Core Coursework:</span>
                    <span>Data Structures & Algorithms</span>
                    <span>•</span>
                    <span>Database Management Systems (DBMS)</span>
                    <span>•</span>
                    <span>Object Oriented Programming</span>
                    <span>•</span>
                    <span>Operating Systems</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EducationSection;
