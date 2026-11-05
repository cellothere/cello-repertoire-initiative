import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronRight, FaSlidersH } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Seo, { SITE_URL } from '@/components/seo';
import ShareButton from '@/components/share-button';
import MusicCard from '@/components/music-card';
import { GRID_CLASSES } from '@/components/piece-results';
import { portraitFor } from '@/lib/composer-portraits';
import { composerDatabaseSlugs } from '@/lib/database-names';
import { featuredDatabases } from '@/lib/featured-databases';
import { composerWorksHref } from '@/lib/instruments';
import { getComposerPage } from '@/lib/repertoire';
import { pageShareContent, versionedImage } from '@/lib/share';
import { composerPath, databasePath, lifeDates } from '@/lib/slugs';
import type { ComposerSummary, PieceSummary } from '@/lib/types';
import { LEVEL_ORDER, baseLevel, sortPieces } from '@/utils/musicUtils';

interface Props {
  composer: ComposerSummary;
  pieces: PieceSummary[];
}

// Pages are built the first time someone visits them and refreshed every ten minutes.
export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' });

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const page = slug ? await getComposerPage(slug) : null;
  if (!page) return { notFound: true, revalidate: 600 };
  return { props: { composer: page.composer, pieces: sortPieces(page.pieces, 'level-asc') }, revalidate: 600 };
};

const plural = (count: number, word: string) => `${count.toLocaleString()} ${word}${count === 1 ? '' : 's'}`;

const ComposerPage: NextPage<Props> = ({ composer, pieces }) => {
  const name = composer.composer_full_name;
  const dates = lifeDates(composer);
  const path = composerPath(composer.slug);
  const portrait = portraitFor(name);
  const databases = featuredDatabases(null).filter((d) => composerDatabaseSlugs(composer).includes(d.slug));

  // How many pieces at each level, in level order, for the summary chips.
  const levels = LEVEL_ORDER.map((level) => ({ level, count: pieces.filter((p) => baseLevel(p.level) === level).length })).filter(
    (entry) => entry.count > 0
  );
  const range =
    levels.length > 1 ? `${levels[0].level} to ${levels[levels.length - 1].level}` : levels.length === 1 ? levels[0].level : '';
  const browseHref = composerWorksHref('cello', name) ?? '/cello-music';

  const facts = [dates, composer.nationality.join(', ')].filter(Boolean).join(' · ');
  const titles = pieces.slice(0, 3).map((p) => p.title);
  const description = `${name}${dates ? ` (${dates})` : ''}${composer.nationality.length ? `, ${composer.nationality.join(', ')}` : ''}: ${plural(
    pieces.length,
    'cello piece'
  )}${range ? ` from ${range}` : ''}, including ${titles.join(', ')}.`.slice(0, 300);
  const image = versionedImage(`/api/og/composer/${composer.slug}`, [name, dates, composer.nationality.join('|'), pieces.length, range]);

  // Structured data so search engines know the page is about this person and their cello works.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `${SITE_URL}${path}`,
    ...(composer.born ? { birthDate: composer.born } : {}),
    ...(composer.died ? { deathDate: composer.died } : {}),
    ...(composer.nationality.length ? { nationality: composer.nationality.join(', ') } : {}),
    ...(composer.bio_link ? { sameAs: [composer.bio_link] } : {}),
    jobTitle: 'Composer',
  };

  return (
    <>
      <Seo title={`${name}: Cello Music`} path={path} description={description} image={image} imageAlt={`${name}: ${plural(pieces.length, 'cello piece')}`} />
      <Head>
        <script key="composer-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <header className="parallax-scope relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent" aria-hidden="true" />
        <div className="parallax-fg container relative z-10 mx-auto px-4 py-6 md:py-12">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-400 md:mb-4">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/composers" className="hover:text-white hover:underline">
                  Composers
                </Link>
              </li>
              <li aria-hidden="true">
                <FaChevronRight className="h-2.5 w-2.5" />
              </li>
              <li aria-current="page" className="line-clamp-1 text-gray-300">
                {name}
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            {portrait && (
              <Image
                src={`/assets/portraits/${portrait.slug}.jpg`}
                alt={`Portrait of ${name}`}
                width={240}
                height={240}
                priority
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-white/30 md:h-28 md:w-28"
                style={portrait.focus ? { objectPosition: portrait.focus } : undefined}
              />
            )}
            <div className="min-w-0">
              <h1 className="break-words text-[1.75rem] font-bold leading-tight tracking-tight md:text-5xl">{name}</h1>
              {facts && <p className="mt-1.5 text-lg text-gray-300 md:mt-2">{facts}</p>}
            </div>
          </div>

          {databases.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Featured databases">
              {databases.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={databasePath(d.slug)}
                    className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20"
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
            <ShareButton
              heading={`Share ${name}'s page`}
              image={image}
              iconOnlyOnPhone={false}
              content={pageShareContent({
                path,
                name: `${name}: cello music`,
                line: [plural(pieces.length, 'cello piece'), range].filter(Boolean).join(' · '),
              })}
            />
            {composer.bio_link && (
              <a
                href={composer.bio_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20"
              >
                Biography
                <FiExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{plural(pieces.length, 'cello piece')}</h2>
            {range && <p className="mt-1 text-gray-600">{range}</p>}
          </div>
          <Link href={browseHref} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline">
            <FaSlidersH className="h-3.5 w-3.5" aria-hidden="true" />
            Filter and sort in Cello Music
          </Link>
        </div>

        {levels.length > 1 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Pieces by level">
            {levels.map(({ level, count }) => (
              <li key={level}>
                <Link
                  href={`${browseHref}&level=${encodeURIComponent(level)}`}
                  className="chip transition-colors hover:bg-teal-50 hover:text-teal-900"
                >
                  {level} <span className="text-gray-500">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className={`mt-6 ${GRID_CLASSES}`}>
          {pieces.map((piece, index) => (
            <MusicCard key={piece.id} {...piece} priority={index < 4} index={index} />
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-600">
          <Link href="/composers" className="font-semibold text-teal-700 hover:underline">
            Browse all composers
          </Link>
          {databases.map((d) => (
            <span key={d.slug}>
              {' · '}
              <Link href={databasePath(d.slug)} className="font-semibold text-teal-700 hover:underline">
                {d.label}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </>
  );
};

export default ComposerPage;
