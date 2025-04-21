/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Output standalone build for better compatibility with Azure
  output: 'standalone',
  // Ensure environment variables are properly set
  env: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'https://humblemeplz.azurewebsites.net',
  },
  // Disable telemetry in production
  experimental: {
    disableOptimizedLoading: true,
  },
}

module.exports = nextConfig