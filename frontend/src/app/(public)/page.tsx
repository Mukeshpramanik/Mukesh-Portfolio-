import React from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { CertificationsSection } from '@/components/sections/CertificationsSection';
import { AchievementsSection } from '@/components/sections/AchievementsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import {
  skillsData,
  projectsData,
  educationData,
  experienceData,
  certificationsData,
  achievementsData,
  testimonialsData,
} from '@/data/profile';
import {
  fetchSkills,
  fetchProjects,
  fetchEducation,
  fetchExperience,
  fetchCertifications,
  fetchAchievements,
  fetchTestimonials,
} from '@/lib/api';

export const dynamic = 'force-static';

export default async function HomePage() {
  // Fetch with fallback to static data
  let skills = skillsData;
  let projects = projectsData;
  let education = educationData;
  let experience = experienceData;
  let certifications = certificationsData;
  let achievements = achievementsData;
  let testimonials = testimonialsData;

  try {
    const [
      skillsRes,
      projectsRes,
      eduRes,
      expRes,
      certsRes,
      achieveRes,
      testRes,
    ] = await Promise.allSettled([
      fetchSkills(),
      fetchProjects(),
      fetchEducation(),
      fetchExperience(),
      fetchCertifications(),
      fetchAchievements(),
      fetchTestimonials(),
    ]);

    if (skillsRes.status === 'fulfilled' && skillsRes.value?.data?.length) {
      skills = skillsRes.value.data;
    }
    if (projectsRes.status === 'fulfilled' && projectsRes.value?.data?.length) {
      projects = projectsRes.value.data;
    }
    if (eduRes.status === 'fulfilled' && eduRes.value?.data?.length) {
      education = eduRes.value.data;
    }
    if (expRes.status === 'fulfilled' && expRes.value?.data?.length) {
      experience = expRes.value.data;
    }
    if (certsRes.status === 'fulfilled' && certsRes.value?.data?.length) {
      certifications = certsRes.value.data;
    }
    if (achieveRes.status === 'fulfilled' && achieveRes.value?.data?.length) {
      achievements = achieveRes.value.data;
    }
    if (testRes.status === 'fulfilled' && testRes.value?.data?.length) {
      testimonials = testRes.value.data;
    }
  } catch {
    // If backend is unavailable, fallback data remains active
  }

  return (
    <PageTransition>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. About */}
      <AboutSection />

      {/* 3. Skills */}
      <SkillsSection initialSkills={skills} />

      {/* 4. Projects */}
      <ProjectsSection initialProjects={projects} />

      {/* 5. Education */}
      <EducationSection initialEducation={education} />

      {/* 6. Experience (reactively rendered if data exists) */}
      <ExperienceSection initialExperience={experience} />

      {/* 7. Certifications (reactively rendered if data exists) */}
      <CertificationsSection initialCertifications={certifications} />

      {/* 8. Achievements (reactively rendered if data exists) */}
      <AchievementsSection initialAchievements={achievements} />

      {/* 9. Testimonials (reactively rendered if data exists) */}
      {testimonials && testimonials.length > 0 && (
        <TestimonialsSection initialTestimonials={testimonials} />
      )}

      {/* 10. Contact */}
      <ContactSection />
    </PageTransition>
  );
}
