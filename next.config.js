/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "scontent.fbeg4-1.fna.fbcdn.net",
      "cdn.icon-icons.com",
      "firebasestorage.googleapis.com",
    ],
  },
};

module.exports = nextConfig;
