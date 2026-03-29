// lib/webhook.ts
import crypto from 'crypto';

export function verifyWebhookSignature(options: {
  secret: string;
  payload: string;
  signature: string;
}): boolean {
  const { secret, payload, signature } = options;

  // Create HMAC-SHA256
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  // Constant-time comparison (prevents timing attacks)
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}
