/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true,
  },
  output: 'export',
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Disable telemetry
  telemetry: false,
};

module.exports = nextConfig;