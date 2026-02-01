/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Allow remote images from ImageKit and Pexels (for <Image> and <img>)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/ericmwangi/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ts*.mm.bing.net',   // for thumbnails in your ImagAPI
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn*.gstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Temporarily ignore ESLint errors during build
  // (remove this line after fixing the unescaped quotes and hooks warnings)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;