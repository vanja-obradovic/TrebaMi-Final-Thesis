/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "scontent.fbeg4-1.fna.fbcdn.net",
      "cdn.icon-icons.com",
      "firebasestorage.googleapis.com",
      "picsum.photos",
    ],
  },
};

module.exports = nextConfig;
