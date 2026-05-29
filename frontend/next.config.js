/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // react-body-highlighter ships as ESM — transpile so Next.js can bundle it
  transpilePackages: ['react-body-highlighter'],
  env: {
    NEXT_PUBLIC_API_URL:  process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:4000/api',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://fightmatch.duckdns.org',
  },
};

module.exports = nextConfig;
