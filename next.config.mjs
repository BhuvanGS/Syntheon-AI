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
  
  // ── Performance Optimizations ─────────────────────
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Optimize package imports (tree-shaking)
  experimental: {
    optimizePackageImports: ['lucide-react'],
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

  // ── Turbopack config (Next.js 16+) ────────────────
  turbopack: {
    // Empty config to acknowledge we're using Turbopack
    // HMR works well with Turbopack by default
  },

  // ── Note about ngrok ──────────────────────────────
  // ngrok free tier blocks WebSocket connections for HMR
  // If you see WebSocket errors when using ngrok:
  // 1. Use localhost for development (recommended)
  // 2. Or upgrade to ngrok paid tier
  // 3. Or use manual refresh when on ngrok
};

export default nextConfig;
