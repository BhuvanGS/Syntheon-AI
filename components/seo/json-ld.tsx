import { DOC_SEO } from '@/lib/docs-seo';

const BASE = 'https://syntheonhub.com';
const APP = 'https://app.syntheonhub.com';

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Syntheon Hub',
  alternateName: 'Syntheon Hub',
  url: BASE,
  logo: `${BASE}/syntheon-logo.png`,
  image: `${BASE}/og-image.png`,
  description:
    'Syntheon Hub joins your meetings, extracts action items, and creates organized tickets automatically.',
  email: 'support@syntheonhub.com',
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
    'AI-powered project management that joins Google Meet, Zoom, and Microsoft Teams meetings, transcribes them, and extracts structured tickets onto a Kanban board with dependencies, sprints, and analytics.',
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
    'Organization and role management',
  ],
  creator: {
    '@type': 'Organization',
    name: 'Syntheon Hub',
    url: BASE,
  },
};

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Syntheon Hub',
  url: BASE,
  description: 'Turn meetings into tickets automatically with AI-powered project management.',
  publisher: {
    '@type': 'Organization',
    name: 'Syntheon Hub',
    logo: {
      '@type': 'ImageObject',
      url: `${BASE}/syntheon-logo.png`,
    },
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE}/docs/{search_term_string}`,
    'query-input': 'required name=search_term_string',
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
