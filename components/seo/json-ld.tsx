import { DOC_SEO } from '@/lib/docs-seo';

const BASE = 'https://syntheonhub.com';
const APP = 'https://app.syntheonhub.com';

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Syntheon Hub',
  alternateName: 'Syntheon Hub',
  legalName: 'BHUVAN G S',
  url: BASE,
  logo: `${BASE}/syntheon-logo.png`,
  image: `${BASE}/og-image.png`,
  description:
    'Syntheon Hub sends a meeting bot into Google Meet, Zoom, or Microsoft Teams and turns the call into structured tickets on a board — no Chrome extension.',
  email: 'support@syntheonhub.com',
  foundingDate: '2025',
  founder: {
    '@type': 'Person',
    name: 'Bhuvan GS',
    alternateName: 'BHUVAN G S',
    jobTitle: 'Founder',
    worksFor: {
      '@type': 'Organization',
      name: 'Syntheon Hub',
      url: BASE,
    },
  },
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@syntheonhub.com',
    url: `${BASE}/contact`,
  },
};

export const SOFTWARE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Syntheon Hub',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'ProjectManagementApplication',
  operatingSystem: 'Web',
  url: BASE,
  downloadUrl: `${APP}/sign-up`,
  image: `${BASE}/og-image.png`,
  screenshot: `${BASE}/og-image.png`,
  description:
    'Meeting bot for Google Meet, Zoom, and Microsoft Teams. Transcripts become titled, assigned tickets with dependencies. No browser extension. 7-day free trial.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: '7-day free trial; paid plans available',
    url: `${APP}/sign-up`,
  },
  featureList: [
    'AI meeting transcription',
    'Automatic ticket extraction',
    'Kanban board',
    'Dependency mapping',
    'Sprint-stones and analytics',
    'Organizations with join links and verified domains',
  ],
  creator: {
    '@type': 'Person',
    name: 'Bhuvan GS',
    alternateName: 'BHUVAN G S',
    jobTitle: 'Founder',
    url: BASE,
  },
  author: {
    '@type': 'Person',
    name: 'Bhuvan GS',
    alternateName: 'BHUVAN G S',
  },
};

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Syntheon Hub',
  url: BASE,
  description:
    'Meetings become tickets before the call ends. Bot joins Meet, Zoom, or Teams — no extension.',
  publisher: {
    '@type': 'Organization',
    name: 'Syntheon Hub',
    logo: {
      '@type': 'ImageObject',
      url: `${BASE}/syntheon-logo.png`,
    },
  },
};

export function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

export function buildDocsBreadcrumbJsonLd(slug?: string) {
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: BASE,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Docs',
      item: `${BASE}/docs`,
    },
  ];

  if (slug && DOC_SEO[slug]) {
    itemListElement.push({
      '@type': 'ListItem',
      position: 3,
      name: DOC_SEO[slug].title,
      item: `${BASE}/docs/${slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
