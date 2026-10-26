import { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import PieceResults, { CardSkeletonGrid, SortSelect, ViewToggle } from '@/components/piece-results';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useJson } from '@/lib/use-json';
import type { PieceSummary, SortKey, ViewMode } from '@/lib/types';
import { COMPOSER_GROUPS, type ComposerGroupSlug } from '@/lib/composer-groups';
import { isFreeIn } from '@/lib/copyright';
import { sortPieces } from '@/utils/musicUtils';

const CATEGORIES = [...COMPOSER_GROUPS.map(({ slug, label }) => ({ slug, label })), { slug: 'free', label: 'Free Music' }] as const;

type CategorySlug = ComposerGroupSlug | 'free';
const NO_PIECES: PieceSummary[] = [];

// Countries offered in the "free in" picker; the visitor's detected country is added if it isn't here.
const COUNTRY_CHOICES = [
  'AR', 'AU', 'AT', 'BD', 'BE', 'BR', 'CA', 'CL', 'CN', 'CO', 'CU', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GH', 'GR',
  'GT', 'HK', 'HU', 'IN', 'IE', 'IL', 'IT', 'JM', 'JP', 'KE', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PK', 'PE', 'PH',
  'PL', 'PT', 'RO', 'RU', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'UA', 'GB', 'US', 'VE', 'VN',
];
const COUNTRY_KEY = 'freeMusicCountry';

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * The country whose copyright rules decide which public-domain pieces count as free: the visitor's own choice if
 * they made one, otherwise the country Vercel detects. Null means unknown, so only music free everywhere is shown.
 */
function useFreeMusicCountry() {
  const [detected, setDetected] = useState<string | null>(null);
  // undefined = the visitor hasn't chosen; '' was saved for "every country".
  const [chosen, setChosen] = useState<string | null | undefined>(() => {
    try {
      const saved = typeof window === 'undefined' ? null : localStorage.getItem(COUNTRY_KEY);
      return saved === null ? undefined : saved || null;
    } catch {
      return undefined; // Storage can be unavailable (private windows); the detected country still works.
    }
  });

  useEffect(() => {
    fetch('/api/region')
      .then((response) => (response.ok ? response.json() : { country: null }))
      .then((data: { country: string | null }) => setDetected(data.country))
      .catch(() => setDetected(null));
  }, []);

  const choose = (code: string | null) => {
    setChosen(code);
    try {
      localStorage.setItem(COUNTRY_KEY, code ?? '');
    } catch {
      // Not remembered across visits, but still applied now.
    }
  };

  return { country: chosen === undefined ? detected : chosen, detected, choose };
}

function FreeMusicNote({
  country,
  detected,
  onChoose,
  elsewhere,
}: {
  country: string | null;
  detected: string | null;
  onChoose: (code: string | null) => void;
  elsewhere: number;
}) {
  const codes = Array.from(new Set([...COUNTRY_CHOICES, ...(detected ? [detected] : []), ...(country ? [country] : [])]));
  const options = codes.map((code) => ({ code, name: countryName(code) })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>Free sheet music you can download legally in</span>
        <label htmlFor="free-country" className="sr-only">
          Country
        </label>
        <select
          id="free-country"
          value={country ?? ''}
          onChange={(event) => onChoose(event.target.value || null)}
          className="rounded-md border border-teal-300 bg-white px-2 py-1 font-medium text-teal-900"
        >
          <option value="">every country</option>
          {options.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1.5 text-teal-800">
        {elsewhere > 0 &&
          `${elsewhere} more ${elsewhere === 1 ? 'piece is' : 'pieces are'} free in other countries but may still be under copyright ${
            country ? `in ${countryName(country)}` : 'somewhere'
          }. `}
        Public-domain status is worked out from each composer&rsquo;s death year and the first publication date; it&rsquo;s a guide,
        not legal advice.
      </p>
    </div>
  );
}

const FeaturedDatabases: NextPage = () => {
  const router = useRouter();
  const { data, error, loading, retry } = useJson<PieceSummary[]>('/api/celloMusic');
  const pieces = data ?? NO_PIECES;
  const { country, detected, choose } = useFreeMusicCountry();

  // The category lives in the URL so each database has a shareable link. Old ?category=non-binary
  // links (the database's earlier name) still open the queer database.
  const requested = router.query.category === 'non-binary' ? 'queer' : router.query.category;
  const category: CategorySlug = CATEGORIES.find((c) => c.slug === requested)?.slug ?? 'women';
  const [sort, setSort] = useState<SortKey>('level-asc');
  const activeTab = useRef<HTMLButtonElement>(null);

  // On phones the tabs scroll sideways, so bring the selected one into view (e.g. when opened from a link).
  useEffect(() => {
    activeTab.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [category]);
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);

  const selectCategory = (slug: CategorySlug) => {
    setPage(1);
    router.replace({ pathname: router.pathname, query: { category: slug } }, undefined, { shallow: true, scroll: false });
  };

  const byCategory = useMemo(
    () =>
      ({
        ...Object.fromEntries(COMPOSER_GROUPS.map((group) => [group.slug, pieces.filter(group.matches)])),
        free: pieces.filter((piece) => isFreeIn(piece, country)),
      }) as Record<CategorySlug, PieceSummary[]>,
    [pieces, country]
  );
  // Public-domain pieces that are free somewhere, but not in the chosen country.
  const freeElsewhere = useMemo(
    () => pieces.filter((piece) => piece.free_download === 'public-domain' && !isFreeIn(piece, country)).length,
    [pieces, country]
  );

  const featured = useMemo(() => sortPieces(byCategory[category], sort), [byCategory, category, sort]);
  const active = CATEGORIES.find((c) => c.slug === category)!;

  return (
    <>
      <Seo
        title="Featured Databases"
        path="/featured-databases"
        description="Explore curated databases of cello music by women, queer, Black, Indigenous, and disabled and neurodivergent composers, plus free sheet music you can download."
      />
      <PageHeader title="Featured Databases" subtitle="Curated collections celebrating composers from all backgrounds.">
        {/* Swipeable on phones. */}
        <div className="-mx-4 mt-5 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mt-8 [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max gap-2" role="group" aria-label="Choose a database">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                ref={category === c.slug ? activeTab : undefined}
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

        {category === 'free' && !loading && !error && (
          <FreeMusicNote country={country} detected={detected} onChoose={choose} elsewhere={freeElsewhere} />
        )}

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
