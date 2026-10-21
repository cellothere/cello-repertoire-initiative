import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Seo from './seo';
import PageHeader from './page-header';
import FilterPanel, { type FilterOptions, type ListFilterKey } from './filter-panel';
import PieceResults, { CardSkeletonGrid, SortSelect, ViewToggle } from './piece-results';
import { EmptyState, ErrorState } from './state-messages';
import { useJson } from '@/lib/use-json';
import { useBrowseState } from '@/lib/use-browse-state';
import { EMPTY_FILTERS, isYearFilterActive, type BrowseFilters } from '@/lib/browse-state';
import { INSTRUMENT_LABELS, type Instrument } from '@/lib/instruments';
import type { PieceSummary } from '@/lib/types';
import techniqueKeywords from '@/utils/techniqueKeywords';
import {
  LEVEL_ORDER,
  SORT_OPTIONS,
  baseLevel,
  formatComposerName,
  instrumentationCategories,
  instrumentationOptions,
  matchesInstrumentationOption,
  normalizeForSearch,
  parseYear,
  sortPieces,
} from '@/utils/musicUtils';

interface RepertoireBrowserProps {
  instrument: Instrument;
  apiPath: string;
  path: string;
}

const NO_PIECES: PieceSummary[] = [];
const collator = new Intl.Collator('en', { sensitivity: 'base' });
const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

function FilterDrawer({
  open,
  onClose,
  onClear,
  resultCount,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  resultCount: number;
  children: React.ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filter-drawer-title">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 flex w-full animate-slide-in-right flex-col bg-white shadow-2xl sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <h2 id="filter-drawer-title" className="text-lg font-bold">
            Filters
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close filters"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4">{children}</div>
        <div className="flex gap-3 border-t border-gray-200 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onClear} className="btn-secondary flex-1">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="btn-primary flex-[2]">
            Show {resultCount.toLocaleString()} {resultCount === 1 ? 'piece' : 'pieces'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RepertoireBrowser({ instrument, apiPath, path }: RepertoireBrowserProps) {
  const label = INSTRUMENT_LABELS[instrument];
  const { data, error, loading, retry } = useJson<PieceSummary[]>(apiPath);
  const pieces = data ?? NO_PIECES;
  const { state, update, ready } = useBrowseState(instrument);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Precompute everything the filters compare against once, rather than on every keystroke.
  const indexed = useMemo(
    () =>
      pieces.map((piece) => ({
        piece,
        text: normalizeForSearch(`${piece.title} ${piece.composer}`),
        level: baseLevel(piece.level),
        year: parseYear(piece.composition_year),
        categories: instrumentationCategories(piece.instrumentation, instrument),
        focus: piece.technique_focus.map(normalizeForSearch),
      })),
    [pieces, instrument]
  );

  const filters = useMemo<BrowseFilters>(
    () => ({
      q: state.q,
      composer: state.composer,
      level: state.level,
      instrumentation: state.instrumentation,
      country: state.country,
      focus: state.focus,
      from: state.from,
      to: state.to,
    }),
    [state.q, state.composer, state.level, state.instrumentation, state.country, state.focus, state.from, state.to]
  );
  // Keep typing and slider dragging responsive; results catch up a frame later.
  const deferredFilters = useDeferredValue(filters);

  const filtered = useMemo(() => {
    const f = deferredFilters;
    const tokens = normalizeForSearch(f.q).split(' ').filter(Boolean);
    const composers = new Set(f.composer);
    const levels = new Set(f.level);
    const countries = new Set(f.country);
    const focus = f.focus.map(normalizeForSearch);
    const yearActive = isYearFilterActive(f);

    return indexed
      .filter(
        (entry) =>
          tokens.every((token) => entry.text.includes(token)) &&
          (composers.size === 0 || composers.has(entry.piece.composer)) &&
          (levels.size === 0 || levels.has(entry.level)) &&
          (countries.size === 0 || entry.piece.nationality.some((n) => countries.has(n))) &&
          (f.instrumentation.length === 0 ||
            f.instrumentation.some((option) => matchesInstrumentationOption(entry.categories, option))) &&
          (focus.length === 0 || focus.some((item) => entry.focus.includes(item))) &&
          (!yearActive || (entry.year !== null && entry.year >= f.from && entry.year <= f.to))
      )
      .map((entry) => entry.piece);
  }, [indexed, deferredFilters]);

  const sorted = useMemo(() => sortPieces(filtered, state.sort), [filtered, state.sort]);

  const options = useMemo<FilterOptions>(() => {
    const composers = new Map<string, string>();
    const countries = new Set<string>();
    for (const piece of pieces) {
      if (piece.composer && !composers.has(piece.composer)) {
        composers.set(piece.composer, formatComposerName(piece.composer_first_name, piece.composer_last_name));
      }
      piece.nationality.forEach((n) => countries.add(n));
    }
    return {
      level: toOptions(LEVEL_ORDER),
      instrumentation: toOptions(instrumentationOptions(instrument)),
      composer: Array.from(composers, ([value, optionLabel]) => ({ value, label: optionLabel })).sort((a, b) =>
        collator.compare(a.label, b.label)
      ),
      country: toOptions(Array.from(countries).sort(collator.compare)),
      focus: toOptions(techniqueKeywords),
    };
  }, [pieces, instrument]);

  const toggle = useCallback(
    (key: ListFilterKey, value: string) => {
      const current = state[key];
      update({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
    },
    [state, update]
  );

  const setYears = useCallback((from: number, to: number) => update({ from, to }), [update]);
  const clearFilters = useCallback(() => update({ ...EMPTY_FILTERS }), [update]);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const composerLabels = useMemo(() => new Map(options.composer.map((o) => [o.value, o.label])), [options.composer]);
  const chips = [
    ...state.level.map((value) => ({ key: `level:${value}`, label: value, remove: () => toggle('level', value) })),
    ...state.instrumentation.map((value) => ({
      key: `inst:${value}`,
      label: value,
      remove: () => toggle('instrumentation', value),
    })),
    ...state.composer.map((value) => ({
      key: `composer:${value}`,
      label: composerLabels.get(value) ?? value,
      remove: () => toggle('composer', value),
    })),
    ...state.country.map((value) => ({ key: `country:${value}`, label: value, remove: () => toggle('country', value) })),
    ...state.focus.map((value) => ({ key: `focus:${value}`, label: value, remove: () => toggle('focus', value) })),
    ...(isYearFilterActive(state)
      ? [{ key: 'year', label: `${state.from}–${state.to}`, remove: () => setYears(EMPTY_FILTERS.from, EMPTY_FILTERS.to) }]
      : []),
  ];
  const sortLabel = SORT_OPTIONS.find((option) => option.value === state.sort)?.label ?? '';
  const hasQuery = state.q.trim().length > 0;
  const activeCount = chips.length + (hasQuery ? 1 : 0);
  const isLoading = loading || !ready;
  const resultCount = isLoading ? (
    'Loading…'
  ) : (
    <>
      <span className="font-semibold text-gray-900">{sorted.length.toLocaleString()}</span>{' '}
      {sorted.length === 1 ? 'piece' : 'pieces'}
      {activeCount > 0 && ` of ${pieces.length.toLocaleString()}`}
    </>
  );

  const panel = (idPrefix: string) => (
    <FilterPanel
      idPrefix={idPrefix}
      filters={state}
      options={options}
      onToggle={toggle}
      onYearChange={setYears}
    />
  );

  return (
    <>
      <Seo
        title={`${label} Music`}
        path={path}
        description={`Search and filter ${label.toLowerCase()} repertoire by level, instrumentation, composer, nationality, technical focus and composition year.`}
      />
      <PageHeader
        size="compact"
        align="left"
        title={`${label} Music`}
        subtitle={
          pieces.length > 0
            ? `Search ${pieces.length.toLocaleString()} pieces by level, instrumentation, composer and more.`
            : 'Search the catalogue by level, instrumentation, composer and more.'
        }
      />

      <div className="container mx-auto px-4 py-4 sm:py-6 lg:flex lg:items-start lg:gap-8">
        <aside className="hidden w-72 shrink-0 lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 py-2">
              <h2 className="text-lg font-bold">Filters</h2>
              {activeCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-sm font-medium text-teal-700 hover:underline">
                  Clear all
                </button>
              )}
            </div>
            {panel('sidebar')}
          </div>
        </aside>

        <section className="min-w-0 flex-1" aria-label={`${label} music results`}>
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={state.q}
              onChange={(e) => update({ q: e.target.value })}
              // Return closes the phone keyboard so the results are visible.
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              enterKeyHint="search"
              placeholder="Search by title or composer"
              aria-label="Search by title or composer"
              className="input pl-11 shadow-sm"
            />
          </div>

          {/* On phones and tablets this bar sticks under the header, so filters and sort stay in reach while scrolling. */}
          <div className="sticky top-14 z-30 -mx-4 mt-3 flex items-center gap-2 border-b border-gray-200 bg-gray-50/95 px-4 py-2 backdrop-blur md:top-16 lg:static lg:mx-0 lg:mt-4 lg:gap-3 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-secondary shrink-0 px-3.5 py-2 text-sm lg:hidden"
            >
              <FaFilter className="h-3.5 w-3.5" aria-hidden="true" />
              Filters
              {chips.length > 0 && (
                <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-bold text-white">{chips.length}</span>
              )}
            </button>
            <p className="hidden text-sm text-gray-600 sm:block" aria-live="polite">
              {resultCount}
            </p>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <SortSelect id="sort-select" value={state.sort} onChange={(sort) => update({ sort })} />
              <ViewToggle value={state.view} onChange={(view) => update({ view }, { keepPage: true })} />
            </div>
          </div>
          <p className="mt-3 truncate text-sm text-gray-600 sm:hidden" aria-live="polite">
            {resultCount}
            {/* The phone toolbar only says "Sort", so name the current order here. */}
            {!isLoading && <span className="text-gray-500"> · {sortLabel}</span>}
          </p>

          {chips.length > 0 && (
            // One swipeable row on phones; wraps on wider screens.
            <ul
              className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-4 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
              aria-label="Active filters"
            >
              {chips.map((chip) => (
                <li key={chip.key} className="shrink-0">
                  <button
                    type="button"
                    onClick={chip.remove}
                    className="chip bg-teal-50 text-teal-900 ring-1 ring-inset ring-teal-600/20 transition-colors hover:bg-teal-100"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <FaTimes className="h-3 w-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li className="shrink-0">
                <button type="button" onClick={clearFilters} className="chip bg-transparent text-gray-600 hover:text-gray-900 hover:underline">
                  Clear all
                </button>
              </li>
            </ul>
          )}

          <div className="mt-4 sm:mt-6">
            {error ? (
              <ErrorState message="We couldn't load the catalogue. Please check your connection and try again." onRetry={retry} />
            ) : isLoading ? (
              <CardSkeletonGrid />
            ) : sorted.length === 0 ? (
              <EmptyState icon={<FaSearch className="h-8 w-8" />} title="No pieces match your search">
                <p className="mb-6">Try removing a filter or searching for something broader.</p>
                <button type="button" onClick={clearFilters} className="btn-primary">
                  Clear all filters
                </button>
              </EmptyState>
            ) : (
              <PieceResults
                pieces={sorted}
                view={state.view}
                page={state.page}
                onPageChange={(page) => update({ page })}
                sort={state.sort}
                onSortChange={(sort) => update({ sort })}
              />
            )}
          </div>
        </section>
      </div>

      <FilterDrawer open={drawerOpen} onClose={closeDrawer} onClear={clearFilters} resultCount={sorted.length}>
        {panel('drawer')}
      </FilterDrawer>
    </>
  );
}
