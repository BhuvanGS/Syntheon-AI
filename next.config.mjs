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
  allowedDevOrigins:
    process.env.NODE_ENV === 'development' ? [process.env.NGROK_URL].filter(Boolean) : [],
};

export default nextConfig;
