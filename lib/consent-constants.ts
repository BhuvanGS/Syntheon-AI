/** Terms acceptance recorded when a user signs in / signs up (legal line on auth pages). */
export const CURRENT_CONSENT_VERSION = 'terms-v1';

export const TERMS_ACCEPTANCE_PURPOSES = ['terms_of_service', 'privacy_policy'] as const;

export type TermsAcceptancePurpose = (typeof TERMS_ACCEPTANCE_PURPOSES)[number];
