import { useEffect, useMemo, useRef } from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';
import Seo from '@/components/seo';
import ShareButton from '@/components/share-button';
import PageHeader from '@/components/page-header';
import RepertoireBrowser from '@/components/repertoire-browser';
import NameDrift from '@/components/name-drift';
import { useJson } from '@/lib/use-json';
import type { ComposerSummary, PieceSummary } from '@/lib/types';
import { isFreeIn } from '@/lib/copyright';
import { DATABASE_SLUGS, featuredDatabases, type DatabaseSlug } from '@/lib/featured-databases';
import { databaseComposers, databaseNames } from '@/lib/database-names';
import { useFreeMusicCountry } from '@/lib/use-free-music-country';
import { DATABASE_PAGES } from '@/lib/collections';
import { listComposers, listPieces } from '@/lib/repertoire';
import { pageShareContent, versionedImage } from '@/lib/share';
import { composerPath, databasePath } from '@/lib/slugs';

interface Props {
  category: DatabaseSlug;
  /** Counted without a country, so Free Music here means free everywhere. */
  pieceCount: number;
  /** The database's composers, linked from the bottom of the page (and read by search engines). */
  composers: { name: string; slug: string }[];
}

/** One page per database (/featured-databases/women, …), built ahead and refreshed hourly. */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: DATABASE_SLUGS.map((category) => ({ params: { category } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const category = DATABASE_SLUGS.find((slug) => slug === params?.category);
  if (!category) return { notFound: true };
  const [pieces, composers] = await Promise.all([listPieces('cello'), listComposers()]);
  const database = featuredDatabases(null).find((d) => d.slug === category)!;
  return {
    props: {
      category,
      pieceCount: pieces.filter(database.matches).length,
      composers: databaseComposers(database, pieces, composers).map((c) => ({ name: c.composer_full_name, slug: c.slug })),
    },
    revalidate: 3600,
  };
};

function ComposerIndex({ composers, label }: { composers: Props['composers']; label: string }) {
  if (composers.length === 0) return null;
  return (
    <section className="container mx-auto px-4 pb-10" aria-labelledby="collection-composers">
      <details className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <summary className="cursor-pointer list-none text-lg font-bold text-gray-900 [&::-webkit-details-marker]:hidden">
          <span id="collection-composers">Composers in {label}</span>{' '}
          <span className="font-normal text-gray-500">({composers.length})</span>
          <span className="ml-2 text-sm font-semibold text-teal-700 group-open:hidden">Show all</span>
        </summary>
        <ul className="mt-4 columns-2 gap-6 text-sm sm:columns-3 lg:columns-4">
          {composers.map((composer) => (
            <li key={composer.slug} className="break-inside-avoid py-1">
              <Link href={composerPath(composer.slug)} className="text-gray-700 hover:text-teal-700 hover:underline">
                {composer.name}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

const NO_PIECES: PieceSummary[] = [];
const NO_COMPOSERS: ComposerSummary[] = [];

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

const FeaturedDatabases: NextPage<Props> = ({ category, pieceCount, composers: collectionComposers }) => {
  const router = useRouter();
  const { data, error, loading } = useJson<PieceSummary[]>('/api/celloMusic');
  const pieces = data ?? NO_PIECES;
  // Only for the names drifting behind the header; the page works without them.
  const { data: composerData } = useJson<ComposerSummary[]>('/api/composers');
  const composers = composerData ?? NO_COMPOSERS;
  const { country, detected, choose } = useFreeMusicCountry();
  const databases = useMemo(() => featuredDatabases(country), [country]);

  // Each database is its own page (/featured-databases/<category>); filters ride along in the query string.
  const keepQuery = useMemo((): Record<string, string> => ({ category }), [category]);
  const page = DATABASE_PAGES[category];
  const activeTab = useRef<HTMLAnchorElement>(null);

  // On phones the tabs scroll sideways, so bring the selected one into view (e.g. when opened from a link).
  useEffect(() => {
    activeTab.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [category]);

  // Each tab links to that database's page, keeping the other filters but going back to the first page. Real links,
  // so search engines can follow them too.
  const tabHref = (slug: DatabaseSlug) => {
    const query: ParsedUrlQuery = { ...router.query, category: slug };
    delete query.page;
    return { pathname: '/featured-databases/[category]', query };
  };

  const counts = useMemo(
    () => Object.fromEntries(databases.map((d) => [d.slug, pieces.filter(d.matches).length])) as Record<DatabaseSlug, number>,
    [pieces, databases]
  );
  const selected = databases.find((d) => d.slug === category) ?? databases[0];
  const names = useMemo(() => databaseNames(selected, pieces, composers), [selected, pieces, composers]);

  // Public-domain pieces that are free somewhere, but not in the chosen country.
  const freeElsewhere = useMemo(
    () => pieces.filter((piece) => piece.free_download === 'public-domain' && !isFreeIn(piece, country)).length,
    [pieces, country]
  );

  const header = (
    <>
      <Seo
        title={page.title}
        path={databasePath(category)}
        description={page.description}
        image={versionedImage(`/api/og/database/${category}`, [pieceCount, collectionComposers.length])}
        imageAlt={`${page.title}: ${pieceCount} pieces`}
      />
      <PageHeader title={page.title} subtitle={page.intro} background={<NameDrift key={category} names={names} />}>
        <div className="mt-4 flex justify-center">
          <ShareButton
            heading="Share this database"
            image={versionedImage(`/api/og/database/${category}`, [pieceCount, collectionComposers.length])}
            content={pageShareContent({
              path: databasePath(category),
              name: page.title,
              line: `${pieceCount.toLocaleString()} pieces by ${collectionComposers.length.toLocaleString()} composers`,
            })}
            iconOnlyOnPhone={false}
            className="px-3 py-1.5 text-sm"
          />
        </div>
        {/* Swipeable on phones. */}
        <div className="-mx-4 mt-5 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mt-8 [&::-webkit-scrollbar]:hidden">
          <nav className="mx-auto flex w-max gap-2" aria-label="Featured databases">
            {databases.map((d) => (
              <Link
                key={d.slug}
                ref={category === d.slug ? activeTab : undefined}
                href={tabHref(d.slug)}
                scroll={false}
                aria-current={category === d.slug ? 'page' : undefined}
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
              </Link>
            ))}
          </nav>
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
      footer={<ComposerIndex composers={collectionComposers} label={selected.label} />}
      notice={
        category === 'free' && (
          <FreeMusicNote country={country} detected={detected} onChoose={choose} elsewhere={freeElsewhere} />
        )
      }
    />
  );
};

export default FeaturedDatabases;
