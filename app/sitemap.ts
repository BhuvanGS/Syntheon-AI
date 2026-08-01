import type { MetadataRoute } from 'next';
import { getDocSitemapSlugs } from '@/lib/docs-seo';

const BASE_URL = 'https://syntheonhub.com';

/** Public marketing / legal URLs only — no auth, join lobby, or app surfaces. */
const marketingRoutes = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/docs', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/legal', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/cookie-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/promo', priority: 0.3, changeFrequency: 'monthly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = marketingRoutes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const docs = getDocSitemapSlugs().map((section) => ({
    url: `${BASE_URL}/docs/${section}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: section === 'domains' || section === 'organizations' ? 0.65 : 0.6,
  }));

  return [...routes, ...docs];
}
