import type {
  Project,
  Skill,
  Education,
  Experience,
  Certification,
  Achievement,
  Testimonial,
  BlogPost,
} from '@/types';
import portfolioContent from './portfolioContent.json';
import { getAutoProjectImage } from '@/lib/projectImages';

export { portfolioContent };

export const profileData = {
  ...portfolioContent.personal,
  avatarUrl: portfolioContent.personal.avatarUrl || '',
  resumeUrl:
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : '') + (portfolioContent.personal.resumeUrl || '/resume.pdf'),
  logoUrl:
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : '') + (portfolioContent.personal.logoUrl || '/images/mp-logo.png'),
};

const basePath =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '';

export const skillsData: Skill[] = portfolioContent.skills as Skill[];

export const projectsData: Project[] = (portfolioContent.projects as Project[]).map((p) => {
  const resolvedImage = p.imageUrl || getAutoProjectImage(p);
  return {
    ...p,
    imageUrl: resolvedImage ? `${basePath}${resolvedImage}` : '',
  };
});

export const educationData: Education[] = portfolioContent.education as Education[];

export const experienceData: Experience[] = (portfolioContent.experience || []) as Experience[];

export const certificationsData: Certification[] = (portfolioContent.certifications || []) as Certification[];

export const achievementsData: Achievement[] = (portfolioContent.achievements || []) as Achievement[];

export const testimonialsData: Testimonial[] = (portfolioContent.testimonials || []) as Testimonial[];

export const blogPostsData: BlogPost[] = (portfolioContent.blogPosts || []) as BlogPost[];

export const interestsData: string[] = (portfolioContent as any).interests || [];

export const websiteText = portfolioContent.websiteText;

export const terminalCommands: Record<string, string> = {
  help: 'Available commands: about, skills, projects, education, interests, contact, social, resume, clear, theme, matrix',
  about: `${profileData.name} - ${profileData.yearsOfStudy}\n${profileData.bio}`,
  skills: skillsData.map((s) => s.name).join(' | '),
  interests: interestsData.join(' | '),
  projects: projectsData.map((p, i) => `${i + 1}. ${p.title}`).join('\n'),
  education: `${educationData[0]?.degree || 'B.Tech'} in ${educationData[0]?.field || 'Computer Science Engineering'} (${educationData[0]?.startYear || '2023'}-${educationData[0]?.endYear || '2027'})`,
  contact: `Email: ${profileData.email}\nGitHub: ${profileData.socialLinks.github}`,
  social: `GitHub: ${profileData.socialLinks.github}\nLinkedIn: ${profileData.socialLinks.linkedin}\nTwitter: ${profileData.socialLinks.twitter}`,
  resume: 'Opening Mukesh Pramanik verified engineering resume PDF in new tab...',
  whoami: `${profileData.name.toLowerCase().replace(/\s+/g, '')}@portfolio:~$`,
  date: new Date().toLocaleString(),
  echo: 'Usage: echo <message>',
  clear: '__CLEAR__',
  theme: '__TOGGLE_THEME__',
  matrix: '__MATRIX__',
};
