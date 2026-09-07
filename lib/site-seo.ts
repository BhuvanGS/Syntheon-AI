/** Canonical marketing SEO copy — one owner per query cluster. */

export const SITE_ORIGIN = 'https://syntheonhub.com';
export const APP_ORIGIN = 'https://app.syntheonhub.com';

/** Homepage owns this query. Do not reuse as another page's title/H1. */
export const HOME_SEO = {
  title: 'Syntheon Hub — Meetings become tickets before the call ends',
  description:
    'A bot joins Google Meet, Zoom, or Microsoft Teams. Transcripts become titled, assigned tickets on your board. No Chrome extension. 7-day free trial.',
  ogAlt: 'Syntheon Hub — Meetings become tickets before the call ends',
} as const;

export const HOW_IT_WORKS_SEO = {
  title: 'How Syntheon Hub works',
  description:
    'Step-by-step: connect a calendar, let the bot join Meet, Zoom, or Teams, then review extracted tickets on the board. No browser extension.',
} as const;

export const FAQ_SEO = {
  title: 'FAQ',
  description:
    'Answers on meeting limits, ticket extraction, plans, the 7-day trial, and whether you need an extension. Syntheon Hub FAQ.',
} as const;

export const DOCS_INDEX_SEO = {
  title: 'Docs',
  description:
    'Product documentation for Syntheon Hub — meetings, ticket extraction, boards, dependencies, sprints, and organizations.',
} as const;

/** Short keywords for Bing / lesser crawlers. Google ignores this tag. */
export const HOME_KEYWORDS = [
  'meeting bot creates tickets',
  'AI meeting to tickets',
  'Google Meet Zoom Teams tickets',
  'automatic ticket extraction',
  'Syntheon Hub',
] as const;
