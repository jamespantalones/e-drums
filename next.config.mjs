import PWA from 'next-pwa';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const config = {
  assetPrefix: BASE_PATH,
  basePath: BASE_PATH,
  reactStrictMode: false,
};

const withPWA = PWA({
  dest: 'public',
  scope: '/edrums/',
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(config);
