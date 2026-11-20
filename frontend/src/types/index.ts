export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  website?: string;
}

export interface Profile {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  summary: string;
  resumeUrl?: string;
  socialLinks: SocialLinks;
  email: string;
  location: string;
  avatarUrl?: string;
  logoUrl?: string;
  availableForHire?: boolean;
  yearsOfExperience?: number;
  updatedAt: string;
}

export interface Project {
  id: string | number;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface Skill {
  id: string | number;
  name: string;
  category: string;
  proficiency?: number; // 0 - 100 (optional: display only where provided)
  icon?: string;
  displayOrder: number;
}

export interface Education {
  id: string | number;
  institution: string;
  degree: string;
  field: string;
  startYear: number | string;
  endYear?: number | string;
  gpa?: string | number;
  description?: string;
  displayOrder: number;
}

export interface Experience {
  id: string | number;
  company: string;
  role: string;
  type: 'full-time' | 'internship' | 'freelance';
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  current: boolean;
  displayOrder: number;
  location?: string;
}

export interface Certification {
  id: string | number;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface Achievement {
  id: string | number;
  title: string;
  description: string;
  date: string;
  category: string;
  displayOrder: number;
  icon?: string;
}

export interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  readTimeMinutes?: number;
}

export interface Testimonial {
  id: string | number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl?: string;
  visible: boolean;
  displayOrder: number;
}

export interface ContactMessage {
  id: string | number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface SearchResult {
  type: 'project' | 'blog' | 'skill' | 'page';
  title: string;
  description: string;
  url: string;
  tags?: string[];
}
