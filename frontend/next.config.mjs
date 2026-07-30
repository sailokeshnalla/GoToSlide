/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'mqxvtuyyzzdlihislvlb.supabase.co',
      },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
