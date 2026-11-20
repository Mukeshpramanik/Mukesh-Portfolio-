import type {
  ApiResponse,
  PaginatedResponse,
  Profile,
  Project,
  Skill,
  Education,
  Experience,
  Certification,
  Achievement,
  BlogPost,
  Testimonial,
  ContactMessage,
  SearchResult,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
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

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Inject auth token if available in client localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...customHeaders,
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
          errorMessage = typeof (errorData as any).detail === 'string'
            ? (errorData as any).detail
            : JSON.stringify((errorData as any).detail);
        }
      } catch {
        // Fallback to text or status text
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

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// ============================================================================
// Concrete API Functions
// ============================================================================

export async function fetchProfile(): Promise<ApiResponse<Profile>> {
  return apiClient.get<ApiResponse<Profile>>('/profile');
}

export async function fetchProjects(params?: {
  category?: string;
  featured?: boolean;
}): Promise<ApiResponse<Project[]>> {
  return apiClient.get<ApiResponse<Project[]>>('/projects', { params });
}

export async function fetchProject(slug: string): Promise<ApiResponse<Project>> {
  return apiClient.get<ApiResponse<Project>>(`/projects/${slug}`);
}

export async function fetchSkills(
  category?: string
): Promise<ApiResponse<Skill[]>> {
  return apiClient.get<ApiResponse<Skill[]>>('/skills', {
    params: { category },
  });
}

export async function fetchEducation(): Promise<ApiResponse<Education[]>> {
  return apiClient.get<ApiResponse<Education[]>>('/education');
}

export async function fetchExperience(): Promise<ApiResponse<Experience[]>> {
  return apiClient.get<ApiResponse<Experience[]>>('/experience');
}

export async function fetchCertifications(): Promise<ApiResponse<Certification[]>> {
  return apiClient.get<ApiResponse<Certification[]>>('/certifications');
}

export async function fetchAchievements(): Promise<ApiResponse<Achievement[]>> {
  return apiClient.get<ApiResponse<Achievement[]>>('/achievements');
}

export async function fetchBlogPosts(params?: {
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<BlogPost>> {
  return apiClient.get<PaginatedResponse<BlogPost>>('/blog', { params });
}

export async function fetchBlogPost(
  slug: string
): Promise<ApiResponse<BlogPost>> {
  return apiClient.get<ApiResponse<BlogPost>>(`/blog/${slug}`);
}

export async function fetchTestimonials(): Promise<ApiResponse<Testimonial[]>> {
  return apiClient.get<ApiResponse<Testimonial[]>>('/testimonials');
}

export async function submitContact(
  data: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.post<ApiResponse<{ id: string }>>('/contact', data);
}

export async function trackAnalytics(data: {
  event: string;
  path: string;
  metadata?: Record<string, unknown>;
}): Promise<ApiResponse<{ tracked: boolean }>> {
  return apiClient.post<ApiResponse<{ tracked: boolean }>>('/analytics/track', data);
}

export async function searchContent(
  query: string
): Promise<ApiResponse<SearchResult[]>> {
  return apiClient.get<ApiResponse<SearchResult[]>>('/search', {
    params: { q: query },
  });
}
