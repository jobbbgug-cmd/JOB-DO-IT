/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: '.next',
  output: 'standalone',
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

module.exports = nextConfig;
