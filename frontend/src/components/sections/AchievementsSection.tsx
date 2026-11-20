'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Star, Target, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { achievementsData } from '@/data/profile';
import type { Achievement } from '@/types';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

export interface AchievementsSectionProps {
  initialAchievements?: Achievement[];
  showEmptyPlaceholder?: boolean;
}

export function AchievementsSection({
  initialAchievements,
  showEmptyPlaceholder = false,
}: AchievementsSectionProps) {
  const { achievements: synchronizedAchievements } = usePortfolioContent();
  const activeAchievements = synchronizedAchievements && synchronizedAchievements.length > 0 ? synchronizedAchievements : (initialAchievements || achievementsData);
  const hasAchievements =
    activeAchievements && activeAchievements.length > 0;

  if (!hasAchievements && !showEmptyPlaceholder) {
    return null;
  }

  return (
    <section id="achievements" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Milestones"
          title="Achievements & Honors"
          subtitle="Recognition, coding competitions, hackathons, and academic milestones."
          align="center"
        />

        {hasAchievements ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {activeAchievements.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  variant="glass"
                  padding="md"
                  hoverLift={true}
                  className="h-full flex flex-col justify-between group border-border/80 hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <Badge variant="accent" size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold font-display text-foreground tracking-tight group-hover:text-primary transition-colors mb-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      {item.date}
                    </span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center glass-card p-8 sm:p-10 border-border/80">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 text-accent">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-display text-foreground mb-2">
              Competitive Milestones in Progress
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Participating in campus hackathons, coding challenges, and open source initiatives. Milestones and awards will be highlighted here as achievements are unlocked.
            </p>
            <Button variant="outline" href="#projects" size="md">
              Explore Projects
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default AchievementsSection;
