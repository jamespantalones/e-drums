import PWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
};

const withPWA = PWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(config);
