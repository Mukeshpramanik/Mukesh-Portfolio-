'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  FolderGit2,
  Cpu,
  Sparkles,
  MapPin,
  Mail,
  FileDown,
  CheckCircle2,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

const interests = [
  'Data Analytics',
  'Python Development',
  'Machine Learning & AI',
  'Software Development',
  'Relational Databases',
  'Data Visualization',
];

export function AboutSection() {
  const { personal, projects, skills, websiteText, interests: synchronizedInterests } = usePortfolioContent();
  const activeInterests = synchronizedInterests && synchronizedInterests.length > 0 ? synchronizedInterests : interests;

  const stats = [
    {
      label: 'Projects Built',
      value: `${projects?.length || 0}+`,
      icon: <FolderGit2 className="w-5 h-5 text-primary" />,
      subtext: 'Academic & Personal',
    },
    {
      label: 'Technologies',
      value: `${skills?.length || 0}+`,
      icon: <Cpu className="w-5 h-5 text-accent" />,
      subtext: 'Languages, Tools & ML',
    },
    {
      label: 'Degree Progress',
      value: personal.yearsOfStudy || '2023–2027',
      icon: <GraduationCap className="w-5 h-5 text-primary-light" />,
      subtext: 'B.Tech CSE Student',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="About Me"
          title={websiteText?.aboutHeading || "Passion for Data & Software Craftsmanship"}
          subtitle={websiteText?.aboutSubtitle || "Get to know my academic background, technical interests, and what drives my curiosity."}
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Avatar & Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col items-center text-center"
          >
            {/* Initials Avatar with Gradient Ring */}
            <div className="relative mb-8 group">
              {/* Outer decorative pulsing glow */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary to-accent opacity-60 blur-xl group-hover:opacity-90 transition-opacity duration-500 animate-pulse-glow" />

              {/* Main Avatar Circle */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 bg-gradient-to-br from-primary via-primary-light to-accent">
                <div className="w-full h-full rounded-full bg-surface flex flex-col items-center justify-center border border-white/10 shadow-2xl overflow-hidden relative">
                  {personal.avatarUrl ? (
                    <img
                      src={personal.avatarUrl}
                      alt={personal.name || 'Mukesh Pramanik'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <>
                      {/* Subtle inner grid pattern */}
                      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

                      <span className="text-5xl sm:text-6xl font-extrabold font-display gradient-text tracking-tighter select-none">
                        MP
                      </span>
                      <span className="text-xs font-mono text-accent uppercase tracking-widest mt-1">
                        {personal.name || 'Mukesh P.'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Decorative mini float badges */}
              <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full glass-card border-primary/40 text-xs font-mono text-primary shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>B.Tech CSE</span>
              </div>
            </div>

            {/* Quick Location & Email info */}
            <div className="space-y-2 text-sm text-muted mb-6">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>{personal.location}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>{personal.email}</span>
              </div>
            </div>

            {/* Resume / Connect Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="primary"
                href="#contact"
                size="md"
                className="w-full sm:w-auto"
              >
                Hire / Contact Me
              </Button>
              <Button
                variant="outline"
                href={personal.resumeUrl}
                external
                size="md"
                leftIcon={<FileDown className="w-4 h-4 mr-1 text-cyan-400" />}
                className="w-full sm:w-auto"
              >
                Resume (PDF)
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Bio, Summary, Interests & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Bio Paragraph */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold font-display text-foreground tracking-tight">
                {websiteText?.aboutTitle || 'Engineering student driven by data, curiosity, and code.'}
              </h3>
              <p className="text-muted leading-relaxed text-base sm:text-lg">
                {personal.bio}
              </p>
              <p className="text-muted leading-relaxed text-sm sm:text-base">
                {personal.summary}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              {stats.map((stat, idx) => (
                <Card
                  key={idx}
                  variant="glass"
                  padding="sm"
                  hoverLift={true}
                  className="p-4 rounded-xl border-border/80 hover:border-primary/40"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-surface-elevated border border-border/60">
                      {stat.icon}
                    </div>
                    <span className="text-xl sm:text-2xl font-bold font-display gradient-text">
                      {stat.value}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground tracking-wide">
                    {stat.label}
                  </h4>
                  <p className="text-[11px] text-muted">{stat.subtext}</p>
                </Card>
              ))}
            </div>

            {/* Core Technical Interests */}
            <div className="pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-accent mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Core Fields of Interest</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeInterests.map((interest, i) => (
                  <Badge
                    key={`${interest}-${i}`}
                    variant={i % 2 === 0 ? 'primary' : 'accent'}
                    size="md"
                    className="cursor-default"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
