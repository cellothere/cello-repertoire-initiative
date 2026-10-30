import { useEffect, useMemo, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import RepertoireBrowser from '@/components/repertoire-browser';
import { useJson } from '@/lib/use-json';
import type { PieceSummary } from '@/lib/types';
import { isFreeIn } from '@/lib/copyright';
import { DATABASE_SLUGS, featuredDatabases, type DatabaseSlug } from '@/lib/featured-databases';
import { useFreeMusicCountry } from '@/lib/use-free-music-country';

const NO_PIECES: PieceSummary[] = [];

// Countries offered in the "free in" picker; the visitor's detected country is added if it isn't here.
const COUNTRY_CHOICES = [
  'AR', 'AU', 'AT', 'BD', 'BE', 'BR', 'CA', 'CL', 'CN', 'CO', 'CU', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GH', 'GR',
  'GT', 'HK', 'HU', 'IN', 'IE', 'IL', 'IT', 'JM', 'JP', 'KE', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PK', 'PE', 'PH',
  'PL', 'PT', 'RO', 'RU', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'UA', 'GB', 'US', 'VE', 'VN',
];
function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
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
    <div className="mb-4 rounded-xl border border-teal-200 sm:mb-6 bg-teal-50 px-4 py-3 text-sm text-teal-900">
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
  const { data, error, loading } = useJson<PieceSummary[]>('/api/celloMusic');
  const pieces = data ?? NO_PIECES;
  const { country, detected, choose } = useFreeMusicCountry();
  const databases = useMemo(() => featuredDatabases(country), [country]);

  // The category lives in the URL so each database has a shareable link. Old ?category=non-binary
  // links (the database's earlier name) still open the queer database.
  const requested = router.query.category === 'non-binary' ? 'queer' : router.query.category;
  const category: DatabaseSlug = DATABASE_SLUGS.find((slug) => slug === requested) ?? 'women';
  const rawCategory = typeof router.query.category === 'string' ? router.query.category : undefined;
  const keepQuery = useMemo((): Record<string, string> => (rawCategory ? { category: rawCategory } : {}), [rawCategory]);
  const activeTab = useRef<HTMLButtonElement>(null);

  // On phones the tabs scroll sideways, so bring the selected one into view (e.g. when opened from a link).
  useEffect(() => {
    activeTab.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [category]);

  // Switching databases keeps the other filters but goes back to the first page.
  const selectCategory = (slug: DatabaseSlug) => {
    const query: ParsedUrlQuery = { ...router.query, category: slug };
    delete query.page;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
  };

  const counts = useMemo(
    () => Object.fromEntries(databases.map((d) => [d.slug, pieces.filter(d.matches).length])) as Record<DatabaseSlug, number>,
    [pieces, databases]
  );
  // Public-domain pieces that are free somewhere, but not in the chosen country.
  const freeElsewhere = useMemo(
    () => pieces.filter((piece) => piece.free_download === 'public-domain' && !isFreeIn(piece, country)).length,
    [pieces, country]
  );

  const header = (
    <>
      <Seo
        title="Featured Databases"
        path="/featured-databases"
        description="Explore curated databases of cello music by women, queer, Black, Indigenous, disabled and neurodivergent, and living composers, plus free sheet music you can download."
      />
      <PageHeader title="Featured Databases" subtitle="Curated collections celebrating composers from all backgrounds.">
        {/* Swipeable on phones. */}
        <div className="-mx-4 mt-5 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mt-8 [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max gap-2" role="group" aria-label="Choose a database">
            {databases.map((d) => (
              <button
                key={d.slug}
                ref={category === d.slug ? activeTab : undefined}
                type="button"
                onClick={() => selectCategory(d.slug)}
                aria-pressed={category === d.slug}
                className={`snap-start whitespace-nowrap rounded-full px-4 py-2.5 text-[0.9375rem] font-medium transition-colors md:px-5 md:text-base ${
                  category === d.slug ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {d.label}
                {!loading && !error && (
                  <span className={`ml-2 text-sm ${category === d.slug ? 'text-gray-500' : 'text-white/60'}`}>
                    {counts[d.slug]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>
    </>
  );

  return (
    <RepertoireBrowser
      instrument="cello"
      apiPath="/api/celloMusic"
      path="/featured-databases"
      header={header}
      database={category}
      freeCountry={country}
      keepQuery={keepQuery}
      notice={
        category === 'free' && (
          <FreeMusicNote country={country} detected={detected} onChoose={choose} elsewhere={freeElsewhere} />
        )
      }
    />
  );
};

export default FeaturedDatabases;
