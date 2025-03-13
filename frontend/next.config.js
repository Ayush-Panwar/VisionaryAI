/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google profile pictures
      'res.cloudinary.com', // For Cloudinary hosted images
      'localhost', // For local development
      'oaidalleapiprodscus.blob.core.windows.net', // For OpenAI DALL-E generated images
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
  // Disable type checking during build for better performance
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/api/auth/signin',
        permanent: true,
      },
    ];
  },
  // Configure headers for security
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 