import { useDeferredValue, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { FaArrowRight, FaSearch, FaUsers } from 'react-icons/fa';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import { ExternalLink } from '@/components/linkify';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useJson } from '@/lib/use-json';
import { composerWorksHref } from '@/lib/instruments';
import type { ComposerSummary } from '@/lib/types';
import { formatComposerName, normalizeForSearch, parseYear, removeDiacritics } from '@/utils/musicUtils';

type ComposerSort = 'lastname-asc' | 'lastname-desc' | 'nationality-asc' | 'born-asc' | 'born-desc' | 'works-desc';

const SORTS: { value: ComposerSort; label: string }[] = [
  { value: 'lastname-asc', label: 'Last name (A–Z)' },
  { value: 'lastname-desc', label: 'Last name (Z–A)' },
  { value: 'works-desc', label: 'Most works' },
  { value: 'nationality-asc', label: 'Nationality (A–Z)' },
  { value: 'born-asc', label: 'Born (earliest)' },
  { value: 'born-desc', label: 'Born (latest)' },
];

const collator = new Intl.Collator('en', { sensitivity: 'base' });
const NO_COMPOSERS: ComposerSummary[] = [];

const sortName = (c: ComposerSummary) => c.composer_last_name || c.composer_full_name;
const initialOf = (c: ComposerSummary) => {
  const letter = removeDiacritics(sortName(c)).charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : '#';
};

function compareNullable(a: number | null, b: number | null, dir: number) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

function sortComposers(composers: ComposerSummary[], sort: ComposerSort) {
  const byName = (a: ComposerSummary, b: ComposerSummary) => collator.compare(sortName(a), sortName(b));
  return [...composers].sort((a, b) => {
    switch (sort) {
      case 'lastname-desc':
        return byName(b, a);
      case 'nationality-asc':
        return collator.compare(a.nationality[0] ?? '~', b.nationality[0] ?? '~') || byName(a, b);
      case 'born-asc':
        return compareNullable(parseYear(a.born), parseYear(b.born), 1) || byName(a, b);
      case 'born-desc':
        return compareNullable(parseYear(a.born), parseYear(b.born), -1) || byName(a, b);
      case 'works-desc':
        return b.cello_works - a.cello_works || byName(a, b);
      default:
        return byName(a, b);
    }
  });
}

function ComposerRow({ composer }: { composer: ComposerSummary }) {
  const worksHref = composer.cello_works > 0 ? composerWorksHref('cello', composer.composer_full_name) : null;
  const dates = composer.born ? `${composer.born}${composer.died ? `–${composer.died}` : '–'}` : '';

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="text-lg font-semibold text-gray-900">
          {formatComposerName(composer.composer_first_name, composer.composer_last_name)}
          {dates && <span className="ml-2 text-sm font-normal text-gray-500">({dates})</span>}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
          {composer.nationality.length > 0 && <span>{composer.nationality.join(', ')}</span>}
          {composer.bio_link && <ExternalLink href={composer.bio_link}>Biography</ExternalLink>}
        </div>
      </div>
      {worksHref ? (
        <Link href={worksHref} className="btn-primary shrink-0 self-start px-4 py-2 text-sm sm:self-auto">
          {composer.cello_works} {composer.cello_works === 1 ? 'work' : 'works'}
          <FaArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      ) : (
        <span className="shrink-0 text-sm text-gray-400">No cello works listed yet</span>
      )}
    </li>
  );
}

const ComposersPage: NextPage = () => {
  const { data, error, loading, retry } = useJson<ComposerSummary[]>('/api/composers');
  const composers = data ?? NO_COMPOSERS;
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ComposerSort>('lastname-asc');
  const deferredSearch = useDeferredValue(search);

  const searchable = useMemo(
    () =>
      composers.map((composer) => ({
        composer,
        text: normalizeForSearch(`${composer.composer_full_name} ${composer.nationality.join(' ')}`),
      })),
    [composers]
  );

  const visible = useMemo(() => {
    const tokens = normalizeForSearch(deferredSearch).split(' ').filter(Boolean);
    const matches = searchable.filter(({ text }) => tokens.every((token) => text.includes(token))).map(({ composer }) => composer);
    return sortComposers(matches, sort);
  }, [searchable, deferredSearch, sort]);

  // Group alphabetically when sorted by name, so the A–Z bar can jump between letters.
  const grouped = sort === 'lastname-asc' || sort === 'lastname-desc';
  const groups = useMemo(() => {
    if (!grouped) return [{ letter: '', composers: visible }];
    const map = new Map<string, ComposerSummary[]>();
    for (const composer of visible) {
      const letter = initialOf(composer);
      map.set(letter, [...(map.get(letter) ?? []), composer]);
    }
    return Array.from(map, ([letter, list]) => ({ letter, composers: list }));
  }, [visible, grouped]);

  return (
    <>
      <Seo
        title="Composers"
        path="/composers"
        description="Browse the composers in the Cello Repertoire Initiative catalogue and explore their works for cello."
      />
      <PageHeader title="Composers" subtitle="Discover the artists behind the music." />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or nationality…"
              aria-label="Search composers by name or nationality"
              className="input pl-11 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="composer-sort" className="whitespace-nowrap text-sm font-medium text-gray-600">
              Sort by
            </label>
            <select
              id="composer-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ComposerSort)}
              className="rounded-lg border border-gray-300 bg-white py-3 pl-3 pr-8 text-sm font-medium focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!loading && !error && (
          <p className="mt-4 text-sm text-gray-600" aria-live="polite">
            <span className="font-semibold text-gray-900">{visible.length.toLocaleString()}</span>{' '}
            {visible.length === 1 ? 'composer' : 'composers'}
          </p>
        )}

        {grouped && groups.length > 1 && (
          <nav aria-label="Jump to letter" className="sticky top-16 z-10 -mx-4 mt-4 overflow-x-auto border-y border-gray-200 bg-gray-50/95 px-4 py-2 backdrop-blur">
            <ul className="flex gap-1">
              {groups.map(({ letter }) => (
                <li key={letter}>
                  <a
                    href={`#letter-${letter}`}
                    className="block min-w-[2rem] rounded-md px-2 py-1 text-center text-sm font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    {letter}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-6">
          {error ? (
            <ErrorState message="We couldn't load the composer list. Please try again." onRetry={retry} />
          ) : loading ? (
            <div className="card divide-y divide-gray-100" aria-busy="true" aria-label="Loading composers">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="space-y-2 p-5">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState icon={<FaUsers className="h-8 w-8" />} title="No composers found">
              Try a different name or nationality.
            </EmptyState>
          ) : (
            <div className="space-y-6">
              {groups.map(({ letter, composers: list }) => (
                <section key={letter || 'all'} id={letter ? `letter-${letter}` : undefined} className="scroll-mt-32">
                  {letter && <h2 className="mb-2 text-lg font-bold text-gray-500">{letter}</h2>}
                  <ul className="card divide-y divide-gray-100">
                    {list.map((composer) => (
                      <ComposerRow key={composer.id} composer={composer} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ComposersPage;
