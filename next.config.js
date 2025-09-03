/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  experimental: {
    // Enable if needed for better performance
    // optimizeCss: true,
  },
  // Note: We use custom API route handlers for backend proxying
  // to have better control over timeouts and error handling
  // Supabase auth might require headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
