/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // ── Dev HMR stability ─────────────────────────────
  // Rule: pick ONE origin per dev session (localhost:3000 OR ngrok).
  // Mixing origins causes Clerk cookie/session mismatches + HMR drops.
  // We list all common origins so whichever you pick works end-to-end.
  allowedDevOrigins:
    process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          'https://localhost:3000',
          'http://127.0.0.1:3000',
          'https://127.0.0.1:3000',
          process.env.NGROK_URL,
        ].filter(Boolean)
      : [],
};

export default nextConfig;
