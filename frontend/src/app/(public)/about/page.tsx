import React from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { AboutSection } from '@/components/sections/AboutSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { CertificationsSection } from '@/components/sections/CertificationsSection';
import { achievementsData, certificationsData } from '@/data/profile';
import { AchievementsSection } from '@/components/sections/AchievementsSection';

export const metadata = {
  title: 'About Me',
  description:
    'Learn about Mukesh Pramanik — B.Tech CSE student, programming background, technical skill sets, and education.',
};

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="pt-16 pb-20">
        <AboutSection />
        <SkillsSection />
        <EducationSection />
        <CertificationsSection
          initialCertifications={certificationsData}
          showEmptyPlaceholder={true}
        />
        <AchievementsSection
          initialAchievements={achievementsData}
          showEmptyPlaceholder={true}
        />
      </div>
    </PageTransition>
  );
}
