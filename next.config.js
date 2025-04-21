/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode in production for better performance
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  env: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'https://humblemeplz.azurewebsites.net',
  },
  // Optimize image loading
  images: {
    domains: ['localhost', 'humblemeplz.azurewebsites.net'],
    minimumCacheTTL: 60,
  },
  // Optimize production builds
  experimental: {
    disableOptimizedLoading: false, // Enable optimized loading
    optimizeCss: true, // Optimize CSS
    scrollRestoration: true, // Improve scroll performance
  },
}

module.exports = nextConfig