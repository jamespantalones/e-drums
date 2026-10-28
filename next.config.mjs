import PWA from 'next-pwa';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const config = {
  assetPrefix: BASE_PATH,
  basePath: BASE_PATH,
  reactStrictMode: false,
  async redirects() {
    if (!BASE_PATH) return [];

    // Old root URLs (e.g. e-drums.biz/<id>) move to the main site.
    // sw.js/workbox are left to 404 so old root-scoped service workers unregister.
    const destination = `https://www.jamespants.com${BASE_PATH}`;
    return [
      { source: '/', destination, basePath: false, permanent: false },
      {
        source: `/:path((?!${BASE_PATH.slice(1)}(?:/|$)|sw\\.js$|workbox-).+)`,
        destination: `${destination}/:path`,
        basePath: false,
        permanent: false,
      },
    ];
  },
};

const withPWA = PWA({
  dest: 'public',
  scope: `${BASE_PATH}/`,
  disable: process.env.NODE_ENV === 'development',
  // Next 16 lists this in the build manifest but never serves it, and one
  // missing file fails the whole precache install
  buildExcludes: [/dynamic-css-manifest\.json$/],
});

export default withPWA(config);
