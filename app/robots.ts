import type { MetadataRoute } from 'next';

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'Googlebot',
  'PerplexityBot',
  'ClaudeBot',
  'Anthropic-AI',
  'Bytespider',
  'CCBot',
  'Applebot-Extended',
];

const DISALLOW = [
  '/api/',
  '/dashboard',
  '/project',
  '/settings',
  '/pricing',
  '/sign-in',
  '/sign-up',
  '/sso-callback',
  '/accept-invite',
  '/onboarding',
  '/waitlist',
  '/admin',
  '/beta-closed',
  '/join',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt'],
        disallow: DISALLOW,
      },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: ['/', '/docs', '/faq', '/how-it-works', '/legal', '/contact', '/llms.txt'],
        disallow: DISALLOW,
      })),
    ],
    sitemap: 'https://syntheonhub.com/sitemap.xml',
    host: 'https://syntheonhub.com',
  };
}
