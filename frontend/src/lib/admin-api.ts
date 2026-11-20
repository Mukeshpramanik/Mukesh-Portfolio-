import type {
  ApiResponse,
  Project,
  Skill,
  Education,
  Experience,
  Certification,
  Achievement,
  BlogPost,
  Testimonial,
  ContactMessage,
  Profile,
} from '@/types';
import { ApiError } from '@/lib/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface DashboardStats {
  totalProjects: number;
  totalSkills: number;
  unreadMessages: number;
  totalBlogPosts: number;
  totalPageViews: number;
  recentMessages?: ContactMessage[];
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number; change?: string }[];
  viewsByDate: { date: string; views: number }[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  admin: {
    username: string;
    email?: string;
  };
}

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function adminRequest<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string | number | boolean | undefined> } = {}
): Promise<T> {
  const { params, headers: customHeaders, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const isFormData = customConfig.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...getAuthHeader(),
  };

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(customHeaders as Record<string, string>),
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData: unknown;
      try {
        errorData = await response.json();
        if (
          errorData &&
          typeof errorData === 'object' &&
          'message' in errorData
        ) {
          errorMessage = (errorData as { message: string }).message;
        } else if (
          errorData &&
          typeof errorData === 'object' &&
          'detail' in errorData
        ) {
          errorMessage =
            typeof (errorData as any).detail === 'string'
              ? (errorData as any).detail
              : JSON.stringify((errorData as any).detail);
        }
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown network error',
      0
    );
  }
}

// ============================================================================
// Auth API
// ============================================================================

export async function adminLogin(
  username: string,
  password: string
): Promise<LoginResponse> {
  return adminRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// ============================================================================
// Dashboard & Analytics
// ============================================================================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return adminRequest<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
}

export async function getAnalytics(): Promise<ApiResponse<AnalyticsSummary>> {
  return adminRequest<ApiResponse<AnalyticsSummary>>('/admin/analytics');
}

// ============================================================================
// Projects CRUD
// ============================================================================

export async function getAdminProjects(): Promise<ApiResponse<Project[]>> {
  return adminRequest<ApiResponse<Project[]>>('/admin/projects');
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt'>
): Promise<ApiResponse<Project>> {
  return adminRequest<ApiResponse<Project>>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: string | number,
  data: Partial<Project>
): Promise<ApiResponse<Project>> {
  return adminRequest<ApiResponse<Project>>(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/projects/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Skills CRUD
// ============================================================================

export async function getAdminSkills(): Promise<ApiResponse<Skill[]>> {
  return adminRequest<ApiResponse<Skill[]>>('/admin/skills');
}

export async function createSkill(
  data: Omit<Skill, 'id'>
): Promise<ApiResponse<Skill>> {
  return adminRequest<ApiResponse<Skill>>('/admin/skills', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSkill(
  id: string | number,
  data: Partial<Skill>
): Promise<ApiResponse<Skill>> {
  return adminRequest<ApiResponse<Skill>>(`/admin/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSkill(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/skills/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Education CRUD
// ============================================================================

export async function getAdminEducation(): Promise<ApiResponse<Education[]>> {
  return adminRequest<ApiResponse<Education[]>>('/admin/education');
}

export async function createEducation(
  data: Omit<Education, 'id'>
): Promise<ApiResponse<Education>> {
  return adminRequest<ApiResponse<Education>>('/admin/education', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEducation(
  id: string | number,
  data: Partial<Education>
): Promise<ApiResponse<Education>> {
  return adminRequest<ApiResponse<Education>>(`/admin/education/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEducation(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/education/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Experience CRUD
// ============================================================================

export async function getAdminExperience(): Promise<ApiResponse<Experience[]>> {
  return adminRequest<ApiResponse<Experience[]>>('/admin/experience');
}

export async function createExperience(
  data: Omit<Experience, 'id'>
): Promise<ApiResponse<Experience>> {
  return adminRequest<ApiResponse<Experience>>('/admin/experience', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExperience(
  id: string | number,
  data: Partial<Experience>
): Promise<ApiResponse<Experience>> {
  return adminRequest<ApiResponse<Experience>>(`/admin/experience/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteExperience(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/experience/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Certifications CRUD
// ============================================================================

export async function getAdminCertifications(): Promise<ApiResponse<Certification[]>> {
  return adminRequest<ApiResponse<Certification[]>>('/admin/certifications');
}

export async function createCertification(
  data: Omit<Certification, 'id'>
): Promise<ApiResponse<Certification>> {
  return adminRequest<ApiResponse<Certification>>('/admin/certifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCertification(
  id: string | number,
  data: Partial<Certification>
): Promise<ApiResponse<Certification>> {
  return adminRequest<ApiResponse<Certification>>(`/admin/certifications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCertification(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/certifications/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Achievements CRUD
// ============================================================================

export async function getAdminAchievements(): Promise<ApiResponse<Achievement[]>> {
  return adminRequest<ApiResponse<Achievement[]>>('/admin/achievements');
}

export async function createAchievement(
  data: Omit<Achievement, 'id'>
): Promise<ApiResponse<Achievement>> {
  return adminRequest<ApiResponse<Achievement>>('/admin/achievements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAchievement(
  id: string | number,
  data: Partial<Achievement>
): Promise<ApiResponse<Achievement>> {
  return adminRequest<ApiResponse<Achievement>>(`/admin/achievements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAchievement(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/achievements/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Blog Posts CRUD
// ============================================================================

export async function getAdminBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
  return adminRequest<ApiResponse<BlogPost[]>>('/admin/blog');
}

export async function createBlogPost(
  data: Omit<BlogPost, 'id' | 'createdAt'>
): Promise<ApiResponse<BlogPost>> {
  return adminRequest<ApiResponse<BlogPost>>('/admin/blog', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBlogPost(
  id: string | number,
  data: Partial<BlogPost>
): Promise<ApiResponse<BlogPost>> {
  return adminRequest<ApiResponse<BlogPost>>(`/admin/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBlogPost(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/blog/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Testimonials CRUD
// ============================================================================

export async function getAdminTestimonials(): Promise<ApiResponse<Testimonial[]>> {
  return adminRequest<ApiResponse<Testimonial[]>>('/admin/testimonials');
}

export async function createTestimonial(
  data: Omit<Testimonial, 'id'>
): Promise<ApiResponse<Testimonial>> {
  return adminRequest<ApiResponse<Testimonial>>('/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTestimonial(
  id: string | number,
  data: Partial<Testimonial>
): Promise<ApiResponse<Testimonial>> {
  return adminRequest<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/testimonials/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Messages
// ============================================================================

export async function getMessages(params?: {
  read?: boolean;
}): Promise<ApiResponse<ContactMessage[]>> {
  return adminRequest<ApiResponse<ContactMessage[]>>('/admin/messages', {
    params,
  });
}

export async function markMessageRead(
  id: string | number
): Promise<ApiResponse<ContactMessage>> {
  return adminRequest<ApiResponse<ContactMessage>>(`/admin/messages/${id}/read`, {
    method: 'PATCH',
  });
}

export async function deleteMessage(
  id: string | number
): Promise<ApiResponse<{ id: string | number }>> {
  return adminRequest<ApiResponse<{ id: string | number }>>(`/admin/messages/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Profile & Resume
// ============================================================================

export async function updateProfile(
  data: Partial<Profile>
): Promise<ApiResponse<Profile>> {
  return adminRequest<ApiResponse<Profile>>('/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function uploadResume(
  file: File
): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append('resume', file);

  return adminRequest<ApiResponse<{ url: string }>>('/admin/profile/resume', {
    method: 'POST',
    body: formData,
  });
}
