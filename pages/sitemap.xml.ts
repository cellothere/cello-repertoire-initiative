import type { GetServerSideProps } from 'next';
import { SITE_URL } from '@/components/seo';
import { INSTRUMENTS, pieceHref } from '@/lib/instruments';
import { listPieces } from '@/lib/repertoire';

// Public pages worth indexing; account pages are left out.
const PAGES = [
  '/',
  '/cello-music',
  '/violin-music',
  '/featured-databases',
  '/composers',
  '/recently-added',
  '/resources',
  '/about-us',
  '/contribute',
  '/contact',
];

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

/** The sitemap search engines read: the main pages plus every piece page, built from the database. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const pieces = (await Promise.all(INSTRUMENTS.map(listPieces))).flat();
  const paths = [...PAGES, ...pieces.map((piece) => pieceHref(piece.instrument, piece.id))];
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
