/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: {
    ignoreWarnings: [
      { module: /\.css$/ },
    ],
  },
};

module.exports = nextConfig;
