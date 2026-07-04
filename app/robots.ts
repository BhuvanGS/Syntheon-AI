import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing', '/how-it-works', '/docs', '/faq', '/legal', '/promo'],
      disallow: [
        '/dashboard',
        '/project',
        '/settings',
        '/sign-in',
        '/sign-up',
        '/sso-callback',
        '/accept-invite',
        '/onboarding',
        '/api/',
      ],
    },
    sitemap: 'https://syntheonhub.com/sitemap.xml',
  };
}
