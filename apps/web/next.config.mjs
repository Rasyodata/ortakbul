/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // Aynı origin'den API sunumu: /api/* isteklerini yerel NestJS'e proxy'le.
  // Böylece tek public link (tünel) yeterli olur, CORS gerekmez.
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' },
    ];
  },
};

export default nextConfig;
