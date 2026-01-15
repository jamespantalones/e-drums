import PWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const config = {
  basePath: '/edrums',
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/edrums',
        permanent: false,
      },
    ];
  },
};

const withPWA = PWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(config);
