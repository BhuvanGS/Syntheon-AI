import type { Metadata } from 'next';

/** Public marketing pages — allow indexing. */
export const ROBOTS_INDEX: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

/** App, auth, and alternate landings — keep out of Google results. */
export const ROBOTS_NOINDEX: NonNullable<Metadata['robots']> = {
  index: false,
  follow: true,
};

export function noindexMetadata(title: string): Metadata {
  return {
    title,
    robots: ROBOTS_NOINDEX,
  };
}
