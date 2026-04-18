/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['uncapacious-lauraceous-verna.ngrok-free.dev'],
};

export default nextConfig;
