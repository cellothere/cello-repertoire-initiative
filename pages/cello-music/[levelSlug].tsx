import { useMemo } from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import RepertoireBrowser from '@/components/repertoire-browser';
import ScoreRibbons from '@/components/score-ribbons';
import ShareButton from '@/components/share-button';
import { LEVEL_SUMMARIES } from '@/lib/collections';
import { listComposers, listPieces } from '@/lib/repertoire';
import { pageShareContent, versionedImage } from '@/lib/share';
import { PAGE_LEVELS, composerPath, levelFromSlug, levelPath, levelSlug } from '@/lib/slugs';
import { modalLevelText } from '@/utils/modalLevelTexts';
import { baseLevel } from '@/utils/musicUtils';

interface Props {
  level: string;
  pieceCount: number;
  /** Composers with the most pieces at this level, linked from the bottom of the page. */
  composers: { name: string; slug: string; count: number }[];
  composerCount: number;
}

const TOP_COMPOSERS = 48;

/** One page per level (/cello-music/early-beginner, …), built ahead and refreshed hourly. */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: PAGE_LEVELS.map((level) => ({ params: { levelSlug: levelSlug(level) } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const level = levelFromSlug(String(params?.levelSlug ?? ''));
  if (!level) return { notFound: true };
  const [pieces, composers] = await Promise.all([listPieces('cello'), listComposers()]);
  const atLevel = pieces.filter((piece) => baseLevel(piece.level) === level);
  const counts = new Map<number, number>();
  for (const piece of atLevel) piece.composers.forEach((c) => counts.set(c.id, (counts.get(c.id) ?? 0) + 1));
  const withPages = composers
    .filter((c) => c.id !== 0 && c.composer_full_name !== 'Various' && c.slug && counts.has(c.id))
    .map((c) => ({ name: c.composer_full_name, slug: c.slug, count: counts.get(c.id)! }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return {
    props: { level, pieceCount: atLevel.length, composers: withPages.slice(0, TOP_COMPOSERS), composerCount: withPages.length },
    revalidate: 3600,
  };
};

function LevelFooter({ level, composers, composerCount }: Pick<Props, 'level' | 'composers' | 'composerCount'>) {
  const rubric = modalLevelText[level as keyof typeof modalLevelText];
  return (
    <section className="container mx-auto grid gap-4 px-4 pb-10 sm:gap-6 lg:grid-cols-2">
      {rubric && (
        <div className="card p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">What {level} means</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{rubric.replace(/^ {2}/gm, '')}</p>
        </div>
      )}
      {composers.length > 0 && (
        <div className="card p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            Composers with {level} pieces <span className="font-normal text-gray-500">({composerCount})</span>
          </h2>
          <ul className="columns-2 gap-6 text-sm">
            {composers.map((composer) => (
              <li key={composer.slug} className="break-inside-avoid py-1">
                <Link href={composerPath(composer.slug)} className="text-gray-700 hover:text-teal-700 hover:underline">
                  {composer.name}
                </Link>{' '}
                <span className="text-gray-400">{composer.count}</span>
              </li>
            ))}
          </ul>
          {composerCount > composers.length && (
            <p className="mt-3 text-sm text-gray-500">
              And {composerCount - composers.length} more; use the Composer filter above to see them all.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

const LevelPage: NextPage<Props> = ({ level, pieceCount, composers, composerCount }) => {
  const slug = levelSlug(level);
  const keepQuery = useMemo(() => ({ levelSlug: slug }), [slug]);
  const title = `${level} Cello Music`;
  const summary = LEVEL_SUMMARIES[level] ?? '';
  const image = versionedImage(`/api/og/level/${slug}`, [pieceCount]);

  const header = (
    <>
      <Seo
        title={title}
        path={levelPath(level)}
        description={`${pieceCount.toLocaleString()} ${level.toLowerCase()} cello pieces, searchable by instrumentation, composer and technique. ${summary}`}
        image={image}
        imageAlt={`${title}: ${pieceCount} pieces`}
      />
      <PageHeader size="compact" align="left" background={<ScoreRibbons />} title={title} subtitle={summary}>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ShareButton
            heading={`Share ${level} cello music`}
            image={image}
            iconOnlyOnPhone={false}
            className="px-3 py-1.5 text-sm"
            content={pageShareContent({
              path: levelPath(level),
              name: title,
              line: `${pieceCount.toLocaleString()} pieces. ${summary}`,
            })}
          />
        </div>
        {/* Every level, so visitors (and search engines) can move between them. */}
        <nav aria-label="Levels" className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max gap-2">
            {PAGE_LEVELS.map((other) => (
              <li key={other}>
                <Link
                  href={levelPath(other)}
                  aria-current={other === level ? 'page' : undefined}
                  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    other === level ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {other}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
    </>
  );

  return (
    <RepertoireBrowser
      instrument="cello"
      apiPath="/api/celloMusic"
      path={levelPath(level)}
      header={header}
      level={level}
      keepQuery={keepQuery}
      footer={<LevelFooter level={level} composers={composers} composerCount={composerCount} />}
    />
  );
};

export default LevelPage;
