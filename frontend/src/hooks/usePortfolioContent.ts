'use client';

import { useState, useEffect, useMemo } from 'react';
import defaultContent from '@/data/portfolioContent.json';
import type {
  Skill,
  Project,
  Education,
  Experience,
  Certification,
  Achievement,
  Testimonial,
  BlogPost,
} from '@/types';
import { withBasePath } from '@/lib/utils';
import { getAutoProjectImage } from '@/lib/projectImages';

export const PORTFOLIO_SYNC_EVENT = 'portfolio-content-updated';
export const PORTFOLIO_SYNC_CHANNEL = 'portfolio_sync_channel';
export const PORTFOLIO_STORAGE_KEY = 'mukesh_portfolio_synced_content_v1';

export const DEFAULT_INTERESTS: string[] = [
  'Data Analytics',
  'Python Development',
  'Machine Learning & AI',
  'Software Development',
  'Relational Databases',
  'Data Visualization',
];

// Reusable singleton broadcast channel to avoid creating and tearing down instances
let sharedBroadcastChannel: BroadcastChannel | null = null;
function getSharedBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!sharedBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      sharedBroadcastChannel = new BroadcastChannel(PORTFOLIO_SYNC_CHANNEL);
    } catch {
      sharedBroadcastChannel = null;
    }
  }
  return sharedBroadcastChannel;
}

/**
 * Strips raw template tokens (e.g. "YOUR_CITY_HERE, India", "YOUR_EMAIL_HERE", "YOUR_COLLEGE_NAME_HERE")
 * and returns clean, human-friendly fallbacks while preserving real user edits.
 */
export function sanitizePlaceholder(val?: string, fallback: string = ''): string {
  if (!val || typeof val !== 'string') return fallback;
  if (val.length > 200 || val.startsWith('data:')) return val;
  if (val.includes('YOUR_') && val.includes('_HERE')) {
    const cleaned = val.replace(/YOUR_[A-Z_]+_HERE,?\s*/gi, '').trim();
    return cleaned || fallback;
  }
  return val;
}

/**
 * Global helper to save and broadcast portfolio content across the application,
 * persist to localStorage, and write directly to disk via API endpoint.
 */
export async function savePortfolioContent(updatedContent: any): Promise<{ success: boolean; error?: string }> {
  try {
    let serialized: string | undefined;

    // 1. Immediately persist to localStorage for cross-refresh & static GitHub Pages durability
    if (typeof window !== 'undefined') {
      try {
        serialized = JSON.stringify(updatedContent);
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, serialized);
      } catch (storageErr) {
        console.warn('Unable to persist to localStorage:', storageErr);
      }

      // Broadcast immediately to all active components in this window/tab
      window.dispatchEvent(
        new CustomEvent(PORTFOLIO_SYNC_EVENT, { detail: updatedContent })
      );

      // Broadcast to other open tabs/windows without recreating channels
      try {
        getSharedBroadcastChannel()?.postMessage(updatedContent);
      } catch {
        // BroadcastChannel fallback
      }
    }

    // 2. Persist directly to disk via local API endpoint, reusing already serialized payload
    const bodyPayload = serialized ?? JSON.stringify(updatedContent);
    const response = await fetch(withBasePath('/api/content'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyPayload,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      // On static GitHub Pages, the server API is unavailable (404/403), which is expected
      if (response.status === 404 || response.status === 403) {
        return { success: true };
      }
      return { success: false, error: errData.error || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    // In purely static / offline environments, local state broadcast and localStorage already succeeded
    return { success: true };
  }
}

/**
 * Reactive hook providing synchronized portfolio content.
 * Centralized data source with dual persistence:
 * 1. Single source of truth on disk: frontend/src/data/portfolioContent.json
 * 2. Persistent storage on client: localStorage (survives refreshes & GitHub Pages static export)
 */
export function usePortfolioContent() {
  const [content, setContent] = useState<any>(defaultContent);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check localStorage first for any saved user edits
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.personal || parsed.education || parsed.skills || parsed.interests)) {
          setContent(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }

    // 2. Listen for updates dispatched in current window
    // State update is performed without redundant re-serialization into localStorage
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setContent(customEvent.detail);
      }
    };

    window.addEventListener(PORTFOLIO_SYNC_EVENT, handleLocalUpdate);

    // 3. Listen for updates from other tabs
    const channel = getSharedBroadcastChannel();
    const handleChannelMessage = (event: MessageEvent) => {
      if (event.data) {
        setContent(event.data);
      }
    };
    channel?.addEventListener('message', handleChannelMessage);

    // 4. Fetch latest content from disk on initial mount (in dev mode)
    fetch(withBasePath('/api/content'), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.personal) {
          setContent(data);
          try {
            localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
          } catch {}
        } else {
          // If /api/content is unavailable (e.g. GitHub Pages static export),
          // only fallback to static file if localStorage has no saved edits
          const hasSaved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
          if (!hasSaved) {
            fetch(withBasePath('/portfolioContent.json'), { cache: 'no-store' })
              .then((r) => (r.ok ? r.json() : null))
              .then((staticData) => {
                if (staticData && staticData.personal) {
                  setContent(staticData);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {
        const hasSaved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        if (!hasSaved) {
          fetch(withBasePath('/portfolioContent.json'), { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((staticData) => {
              if (staticData && staticData.personal) {
                setContent(staticData);
              }
            })
            .catch(() => {});
        }
      });

    return () => {
      window.removeEventListener(PORTFOLIO_SYNC_EVENT, handleLocalUpdate);
      channel?.removeEventListener('message', handleChannelMessage);
    };
  }, []);

  const personal = useMemo(() => ({
    ...content.personal,
    email: sanitizePlaceholder(content.personal?.email, 'contact@mukeshpramanik.dev'),
    phone: sanitizePlaceholder(content.personal?.phone, ''),
    location: sanitizePlaceholder(content.personal?.location, 'India'),
    resumeUrl: withBasePath(content.personal?.resumeUrl || '/resume.pdf'),
    logoUrl: withBasePath(content.personal?.logoUrl || '/images/mp-logo.png'),
    avatarUrl: content.personal?.avatarUrl ? withBasePath(content.personal.avatarUrl) : '',
    socialLinks: {
      ...content.personal?.socialLinks,
      linkedin: sanitizePlaceholder(
        content.personal?.socialLinks?.linkedin,
        'https://linkedin.com/in/mukeshpramanik'
      ),
      email: content.personal?.socialLinks?.email?.includes('YOUR_EMAIL_HERE')
        ? 'mailto:contact@mukeshpramanik.dev'
        : content.personal?.socialLinks?.email || '',
    },
  }), [content.personal]);

  const skills: Skill[] = useMemo(() => (content.skills || []) as Skill[], [content.skills]);

  const projects: Project[] = useMemo(() => ((content.projects || []) as Project[]).map((p) => {
    const resolvedImage = p.imageUrl || getAutoProjectImage(p);
    return {
      ...p,
      imageUrl: resolvedImage ? withBasePath(resolvedImage) : '',
    };
  }), [content.projects]);

  const education: Education[] = useMemo(() => ((content.education || []) as Education[]).map((edu) => ({
    ...edu,
    institution: sanitizePlaceholder(edu.institution, 'College / University'),
  })), [content.education]);

  const experience: Experience[] = useMemo(() => (content.experience || []) as Experience[], [content.experience]);
  const certifications: Certification[] = useMemo(() => (content.certifications || []) as Certification[], [content.certifications]);
  const achievements: Achievement[] = useMemo(() => (content.achievements || []) as Achievement[], [content.achievements]);
  const testimonials: Testimonial[] = useMemo(() => (content.testimonials || []) as Testimonial[], [content.testimonials]);
  const blogPosts: BlogPost[] = useMemo(() => (content.blogPosts || []) as BlogPost[], [content.blogPosts]);
  const websiteText = useMemo(() => content.websiteText || {}, [content.websiteText]);
  const chatbotKnowledge = useMemo(() => content.chatbotKnowledge || [], [content.chatbotKnowledge]);
  const interests: string[] = useMemo(() => Array.isArray(content.interests) && content.interests.length > 0
    ? content.interests
    : (Array.isArray(content.personal?.interests) && content.personal.interests.length > 0
        ? content.personal.interests
        : DEFAULT_INTERESTS), [content.interests, content.personal?.interests]);

  return {
    content,
    personal,
    skills,
    projects,
    education,
    experience,
    certifications,
    achievements,
    testimonials,
    blogPosts,
    websiteText,
    chatbotKnowledge,
    interests,
  };
}

export default usePortfolioContent;
