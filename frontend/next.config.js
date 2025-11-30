/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true,
  },
  // Remove output: 'export' for development mode
  // output: 'export',
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Handle trailing slashes
  trailingSlash: false,
};

module.exports = nextConfig;

module.exports = nextConfig;