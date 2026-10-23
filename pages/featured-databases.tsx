import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import PieceResults, { CardSkeletonGrid, SortSelect, ViewToggle } from '@/components/piece-results';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useJson } from '@/lib/use-json';
import type { PieceSummary, SortKey, ViewMode } from '@/lib/types';
import { indigenousKeywords } from '@/utils/indigenousKeywords';
import { sortPieces } from '@/utils/musicUtils';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Short keywords (e.g. "moro", "san") must match whole words so that "Moroccan" isn't
// treated as Indigenous; longer ones match anywhere so "Anishinaabek" still matches.
const indigenousPatterns = indigenousKeywords.map((keyword) => {
  const escaped = escapeRegExp(keyword.toLowerCase());
  return keyword.length <= 4 ? new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'iu') : new RegExp(escaped, 'i');
});

const isIndigenous = (piece: PieceSummary) =>
  piece.nationality.some((nationality) => indigenousPatterns.some((pattern) => pattern.test(nationality)));

const CATEGORIES = [
  {
    slug: 'women',
    label: 'Women Composers',
    matches: (piece: PieceSummary) => piece.composer_tags.includes('Woman'),
  },
  {
    slug: 'queer',
    label: 'Queer Composers',
    matches: (piece: PieceSummary) => piece.composer_tags.includes('LGBTQIA+'),
  },
  {
    slug: 'black',
    label: 'Black Composers',
    matches: (piece: PieceSummary) =>
      piece.composer_tags.includes('Black') ||
      (piece.composers.some((c) => c.full_name === 'Traditional') &&
        (piece.tags.includes('Black Spiritual') || piece.tags.includes('Black Spirtuals'))),
  },
  {
    slug: 'indigenous',
    label: 'Indigenous Composers',
    matches: isIndigenous,
  },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];
const NO_PIECES: PieceSummary[] = [];

const FeaturedDatabases: NextPage = () => {
  const router = useRouter();
  const { data, error, loading, retry } = useJson<PieceSummary[]>('/api/celloMusic');
  const pieces = data ?? NO_PIECES;

  // The category lives in the URL so each database has a shareable link. Old ?category=non-binary
  // links (the database's earlier name) still open the queer database.
  const requested = router.query.category === 'non-binary' ? 'queer' : router.query.category;
  const category: CategorySlug = CATEGORIES.find((c) => c.slug === requested)?.slug ?? 'women';
  const [sort, setSort] = useState<SortKey>('level-asc');
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);

  const selectCategory = (slug: CategorySlug) => {
    setPage(1);
    router.replace({ pathname: router.pathname, query: { category: slug } }, undefined, { shallow: true, scroll: false });
  };

  const byCategory = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.slug, pieces.filter(c.matches)])) as Record<CategorySlug, PieceSummary[]>,
    [pieces]
  );

  const featured = useMemo(() => sortPieces(byCategory[category], sort), [byCategory, category, sort]);
  const active = CATEGORIES.find((c) => c.slug === category)!;

  return (
    <>
      <Seo
        title="Featured Databases"
        path="/featured-databases"
        description="Explore curated databases of cello music by women, queer, Black, and Indigenous composers."
      />
      <PageHeader title="Featured Databases" subtitle="Curated collections celebrating composers from all backgrounds.">
        {/* Swipeable on phones. */}
        <div className="-mx-4 mt-5 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mt-8 [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max gap-2" role="group" aria-label="Choose a database">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => selectCategory(c.slug)}
                aria-pressed={category === c.slug}
                className={`snap-start whitespace-nowrap rounded-full px-4 py-2.5 text-[0.9375rem] font-medium transition-colors md:px-5 md:text-base ${
                  category === c.slug ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {c.label}
                {!loading && !error && (
                  <span className={`ml-2 text-sm ${category === c.slug ? 'text-gray-500' : 'text-white/60'}`}>
                    {byCategory[c.slug].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-5 md:py-8">
        <div className="mb-4 flex flex-wrap items-center gap-3 md:mb-6">
          <h2 className="text-xl font-bold">{active.label}</h2>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SortSelect
              id="featured-sort"
              value={sort}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {error ? (
          <ErrorState message="We couldn't load the featured databases. Please try again." onRetry={retry} />
        ) : loading ? (
          <CardSkeletonGrid />
        ) : featured.length === 0 ? (
          <EmptyState title="No pieces yet">This collection is still growing. Check back soon!</EmptyState>
        ) : (
          <PieceResults
            pieces={featured}
            view={view}
            page={page}
            onPageChange={setPage}
            sort={sort}
            onSortChange={(value) => {
              setSort(value);
              setPage(1);
            }}
          />
        )}
      </div>
    </>
  );
};

export default FeaturedDatabases;
