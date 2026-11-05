/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // The share-image routes (lib/og.tsx) read their fonts and pictures from disk.
  outputFileTracingIncludes: {
    '/api/og/**': ['./lib/og-fonts/*.woff', './public/assets/*.png', './public/covers/**/*'],
  },

  async redirects() {
    return [
      // Search now lives on the Cello Music page. Query strings are passed through,
      // and the page understands the old `?query=` parameter.
      { source: '/search-results', destination: '/cello-music', permanent: true },
      { source: '/coming-soon', destination: '/', permanent: false },
    ];
  },

  async headers() {
    return [
      {
        // Illustrations rarely change; let browsers and the CDN cache them for a week.
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ];
  },
};

module.exports = nextConfig;
