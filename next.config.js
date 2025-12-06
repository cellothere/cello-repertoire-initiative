/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Only lint these directories (so "Linting and checking validity of types" is fast)
  eslint: {
    dirs: ['pages', 'components', 'lib'],
    // If you need to completely skip ESLint during `next build`, uncomment:
    // ignoreDuringBuilds: true,
  },

  // You can also (temporarily) bypass TS errors on build by uncommenting:
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

module.exports = nextConfig;
