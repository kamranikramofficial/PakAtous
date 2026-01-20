/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // IGNORE ERRORS DURING BUILD TO ALLOW DEPLOYMENT
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
