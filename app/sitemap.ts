import type { MetadataRoute } from 'next';

const BASE_URL = 'https://syntheonhub.com';

const marketingRoutes = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/docs', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/legal', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/promo', priority: 0.5, changeFrequency: 'monthly' as const },
];

const docSections = [
  'getting-started',
  'meetings',
  'meeting-states',
  'sidebar',
  'board',
  'editing-tickets',
  'ticket-fields',
  'ticket-badges',
  'ticket-extraction',
  'importing',
  'filtering',
  'bulk-actions',
  'labels',
  'dependencies',
  'cascading',
  'dependency-graph',
  'search',
  'command-palette',
  'notifications',
  'shortcuts',
  'velocity',
  'burndown',
  'cycle-time',
  'sprint-stones',
  'milestones',
  'future-viz',
  'analytics',
  'roles',
  'members',
  'organizations',
  'project-tabs',
  'project-settings',
  'preferences',
  'settings',
  'integrations',
  'domains',
  'trial',
  'transcripts',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = marketingRoutes.map((r) => ({
    url: `${BASE_URL}${r.path ? r.path : ''}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const docs = docSections.map((section) => ({
    url: `${BASE_URL}/docs/${section}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...docs];
}
