import type { GetServerSideProps } from 'next';
import { SITE_URL } from '@/components/seo';
import { INSTRUMENTS, pieceHref } from '@/lib/instruments';
import { DATABASE_SLUGS } from '@/lib/featured-databases';
import { listComposers, listPieces } from '@/lib/repertoire';
import { PAGE_LEVELS, composerPath, databasePath, levelPath } from '@/lib/slugs';

// Public pages worth indexing; account pages are left out.
const PAGES = [
  '/',
  '/cello-music',
  '/violin-music',
  '/composers',
  '/recently-added',
  '/resources',
  '/literature',
  '/about-us',
  '/contribute',
  '/contact',
];

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

/**
 * The sitemap search engines read: the main pages, each level and Featured Database, every composer with cello works,
 * and every piece page, built from the database.
 */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [pieces, composers] = await Promise.all([Promise.all(INSTRUMENTS.map(listPieces)).then((all) => all.flat()), listComposers()]);
  const paths = [
    ...PAGES,
    ...PAGE_LEVELS.map(levelPath),
    ...DATABASE_SLUGS.map(databasePath),
    ...composers
      .filter((c) => c.cello_works > 0 && c.slug && c.id !== 0 && c.composer_full_name !== 'Various')
      .map((c) => composerPath(c.slug)),
    ...pieces.map((piece) => pieceHref(piece.instrument, piece.id)),
  ];
  const urls = paths.map((path) => `  <url><loc>${escapeXml(SITE_URL + path)}</loc></url>`).join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // New pieces show up within the hour; the database is only read when the cache is refreshed.
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  res.end();
  return { props: {} };
};

export default function Sitemap() {
  return null;
}
