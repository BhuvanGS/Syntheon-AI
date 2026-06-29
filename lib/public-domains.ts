/**
 * Public email domain blocklist
 * Prevents these domains from being added as verified organization domains
 */
export const PUBLIC_EMAIL_DOMAINS = [
  // Major providers
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'msn.com',

  // Regional providers
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'sohu.com',
  'naver.com',
  'daum.net',
  'hanmail.net',

  // Privacy-focused
  'protonmail.com',
  'proton.me',
  'tutanota.com',
  'tuta.io',
  'mailfence.com',
  'posteo.de',
  'fastmail.com',
  'runbox.com',

  // Temporary/Disposable
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'getnada.com',
  'maildrop.cc',

  // Other common providers
  'zoho.com',
  'mail.com',
  'gmx.com',
  'gmx.net',
  'web.de',
  'inbox.com',
  'rediffmail.com',
] as const;

/**
 * Check if a domain is a public email domain
 */
export function isPublicDomain(domain: string): boolean {
  const normalizedDomain = domain.toLowerCase().trim();
  return PUBLIC_EMAIL_DOMAINS.includes(normalizedDomain as any);
}

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  const match = email.match(/@(.+)$/);
  return match ? match[1].toLowerCase().trim() : null;
}

/**
 * Validate if an email's domain can be used for organization verification
 */
export function canVerifyDomain(email: string): {
  valid: boolean;
  domain: string | null;
  error?: string;
} {
  const domain = extractDomain(email);

  if (!domain) {
    return { valid: false, domain: null, error: 'Invalid email format' };
  }

  if (isPublicDomain(domain)) {
    return { valid: false, domain, error: 'Public email domains cannot be verified' };
  }

  return { valid: true, domain };
}
