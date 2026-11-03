import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';
import { CardSkeletonGrid, PieceGrid } from '@/components/piece-results';
import { EmptyState, ErrorState } from '@/components/state-messages';
import { useJson } from '@/lib/use-json';
import type { PieceSummary, Resource } from '@/lib/types';
import { stripCitations } from '@/components/cited-text';
import { baseLevel, hostnameOf } from '@/utils/musicUtils';

const NO_PIECES: PieceSummary[] = [];
const RECENT_DAYS = 30;
// A short list, so the pieces stay the focus of the page (and on phones, near the top).
const RESOURCES_SHOWN = 5;
// Twelve fills whole rows at every grid width (2, 3 or 4 columns), and so does each step of 24.
const FIRST_SHOWN = 12;
const SHOW_MORE = 24;

// Broad bands, since a teacher checking what's new usually thinks "beginner", not "late beginner".
const BANDS = [
  { label: 'Beginner', levels: ['Early Beginner', 'Beginner', 'Late Beginner'] },
  { label: 'Intermediate', levels: ['Early Intermediate', 'Intermediate', 'Late Intermediate'] },
  { label: 'Advanced', levels: ['Early Advanced', 'Advanced'] },
  { label: 'Professional', levels: ['Professional'] },
];

const dayKey = (date: Date) => date.toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's time zone

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(date) === dayKey(today)) return 'Today';
  if (dayKey(date) === dayKey(yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(date.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
}

/**
 * Resources added in the last month. A sidebar on wide screens; on phones and tablets a compact list above the
 * pieces, with descriptions left out so it stays a few lines tall.
 */
function NewResources({ resources }: { resources: Resource[] }) {
  return (
    <section aria-labelledby="new-resources" className="card p-4 sm:p-5">
      <h2 id="new-resources" className="text-base font-bold text-gray-900">
        New resources
      </h2>
      <ul className="mt-3 divide-y divide-gray-100">
        {resources.slice(0, RESOURCES_SHOWN).map((resource) => (
          <li key={resource._id} className="py-2.5 first:pt-0 last:pb-0">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <span className="block font-semibold leading-snug text-gray-900 group-hover:underline">{resource.title}</span>
              <span className="mt-0.5 hidden text-sm leading-snug text-gray-600 lg:line-clamp-2">
                {stripCitations(resource.description)}
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <span className="truncate text-teal-700">{hostnameOf(resource.url)}</span>
                <FiExternalLink className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />
                <span aria-hidden="true">·</span>
                <span className="shrink-0">{dayLabel(new Date(resource.added_at!))}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Link href="/resources" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
        {resources.length > RESOURCES_SHOWN
          ? `${resources.length - RESOURCES_SHOWN} more new · Browse all resources`
          : 'Browse all resources'}
      </Link>
    </section>
  );
}

const RecentlyAdded: NextPage = () => {
  const { data, error, loading, retry } = useJson<PieceSummary[]>('/api/recentlyAdded');
  const pieces = data ?? NO_PIECES;
  const { data: allResources } = useJson<Resource[]>('/api/resources');
  const newResources = useMemo(() => {
    const since = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
    return (allResources ?? [])
      .filter((resource) => resource.added_at && new Date(resource.added_at).getTime() >= since)
      .sort((a, b) => b.added_at!.localeCompare(a.added_at!));
  }, [allResources]);
  const [band, setBand] = useState<string | null>(null);
  // How many cards each day shows; days not listed show FIRST_SHOWN.
  const [shown, setShown] = useState<Record<string, number>>({});

  const bandCounts = useMemo(
    () => Object.fromEntries(BANDS.map((b) => [b.label, pieces.filter((p) => b.levels.includes(baseLevel(p.level))).length])),
    [pieces]
  );

  const days = useMemo(() => {
    const levels = BANDS.find((b) => b.label === band)?.levels;
    const groups = new Map<string, { label: string; pieces: PieceSummary[] }>();
    for (const piece of pieces) {
      if (!piece.added_at || (levels && !levels.includes(baseLevel(piece.level)))) continue;
      const date = new Date(piece.added_at);
      const key = dayKey(date);
      if (!groups.has(key)) groups.set(key, { label: dayLabel(date), pieces: [] });
      groups.get(key)!.pieces.push(piece);
    }
    return Array.from(groups, ([key, group]) => ({ key, ...group }));
  }, [pieces, band]);

  const chooseBand = (label: string | null) => {
    setBand(label);
    setShown({});
  };

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-teal-700 text-white shadow-sm' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
    }`;

  return (
    <>
      <Seo
        title="Recently Added"
        path="/recently-added"
        description="The latest additions to the Cello Repertoire Initiative catalogue, day by day."
      />
      <PageHeader
        title="Recently Added"
        subtitle={
          pieces.length > 0
            ? `${pieces.length.toLocaleString()} ${pieces.length === 1 ? 'piece' : 'pieces'} added in the last 30 days.`
            : 'The latest additions to our repertoire database.'
        }
      />

      <div className="container mx-auto px-4 py-5 md:py-10">
        <div className={newResources.length > 0 ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-10' : ''}>
          {newResources.length > 0 && (
            <aside className="mb-6 lg:sticky lg:top-24 lg:order-last lg:mb-0">
              <NewResources resources={newResources} />
            </aside>
          )}
          <div className="min-w-0">
            {error ? (
              <ErrorState message="We couldn't load the latest additions. Please try again." onRetry={retry} />
            ) : loading ? (
              <CardSkeletonGrid count={12} />
            ) : pieces.length === 0 ? (
              <EmptyState title="Nothing new this month">
                <p className="mb-6">Check back soon, or browse the whole catalogue in the meantime.</p>
                <Link href="/cello-music" className="btn-primary">
                  Browse cello music
                </Link>
              </EmptyState>
            ) : (
              <>
                {/* Swipeable on phones. */}
                <div
                  className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
                  role="group"
                  aria-label="Show additions at one level"
                >
                  <button type="button" onClick={() => chooseBand(null)} aria-pressed={band === null} className={chipClass(band === null)}>
                    All levels
                  </button>
                  {BANDS.filter((b) => bandCounts[b.label] > 0).map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => chooseBand(b.label)}
                      aria-pressed={band === b.label}
                      className={chipClass(band === b.label)}
                    >
                      {b.label}
                      <span className={`ml-1.5 ${band === b.label ? 'text-teal-100' : 'text-gray-400'}`}>
                        {bandCounts[b.label].toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 space-y-10 md:mt-8 md:space-y-14">
                  {days.map((day) => {
                    const count = shown[day.key] ?? FIRST_SHOWN;
                    const rest = day.pieces.length - count;
                    return (
                      <section key={day.key} aria-labelledby={`day-${day.key}`}>
                        <div className="mb-4 flex items-baseline gap-3 border-b border-gray-200 pb-2 md:mb-5">
                          <h2 id={`day-${day.key}`} className="text-lg font-bold text-gray-900 md:text-xl">
                            {day.label}
                          </h2>
                          <span className="text-sm text-gray-500">
                            {day.pieces.length.toLocaleString()} {day.pieces.length === 1 ? 'piece' : 'pieces'}
                          </span>
                        </div>
                        <PieceGrid pieces={day.pieces.slice(0, count)} />
                        {rest > 0 && (
                          <div className="mt-4 flex justify-center md:mt-6">
                            <button
                              type="button"
                              onClick={() => setShown((current) => ({ ...current, [day.key]: count + SHOW_MORE }))}
                              className="btn-secondary"
                            >
                              Show {Math.min(rest, SHOW_MORE)} more
                              <span className="text-gray-500">of {rest.toLocaleString()}</span>
                            </button>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentlyAdded;
