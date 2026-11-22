
import type { MetadataRoute } from 'next';

const baseUrl =
  'https://mukeshpramanik.github.io/Mukesh-Portfolio-';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/about',
    '/projects',
    '/blog',
    '/contact',
    '/terminal',
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: page === '' ? 1 : 0.8,
  }));
}
