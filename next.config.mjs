/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  async rewrites() {
    return [
      {
        source: '/questionnaire/:token',
        destination: '/questionnaire/:token',
      },
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
}

export default nextConfig;
