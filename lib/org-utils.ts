import { extractDomain, isPublicDomain } from './public-domains';

/**
 * Check if an email address uses a public domain
 */
export function isPublicDomainEmail(email: string): boolean {
  const domain = extractDomain(email);
  return domain ? isPublicDomain(domain) : false;
}

/**
 * Generate a clean org name from an email address and optional user name
 * For public domain users, prefer the user's name, fall back to email username
 */
export function generatePersonalOrgName(email: string, userDisplayName?: string): string {
  if (userDisplayName && userDisplayName.trim()) {
    const name = userDisplayName.trim();
    return `${name}'s Workspace`;
  }

  const username = email.split('@')[0];
  // Capitalize first letter, remove special characters
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanUsername.length < 2) {
    return `user-${cleanUsername}`;
  }
  // Capitalize first letter for a cleaner look
  return `${cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)}'s Workspace`;
}

/**
 * Generate a friendly organization name from an email domain
 * e.g. syntheonhub.com -> Syntheonhub, acme-corp.io -> Acme Corp
 */
export function generateOrgNameFromDomain(domain: string): string {
  const base = domain.split('.')[0];
  return base.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generate a unique org slug by appending a number if needed
 */
export function generateOrgSlug(baseName: string, existingSlugs: string[] = []): string {
  let slug = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let counter = 1;
  let finalSlug = slug;

  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }

  return finalSlug;
}

/**
 * Build metadata for a personal organization
 */
export function buildPersonalOrgMetadata(email: string): Record<string, unknown> {
  return {
    type: 'personal',
    source: 'public-domain-signup',
    emailDomain: extractDomain(email),
  };
}
