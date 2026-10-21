import type { ParsedUrlQuery } from 'querystring';
import type { Instrument } from './instruments';
import type { SortKey, ViewMode } from './types';
import { CURRENT_YEAR, MIN_YEAR, isSortKey, normalizeInstrumentationOption } from '@/utils/musicUtils';

export interface BrowseFilters {
  q: string;
  composer: string[];
  level: string[];
  instrumentation: string[];
  country: string[];
  focus: string[];
  from: number;
  to: number;
}

export interface BrowseState extends BrowseFilters {
  sort: SortKey;
  view: ViewMode;
  page: number;
}

export const DEFAULT_BROWSE_STATE: BrowseState = {
  q: '',
  composer: [],
  level: [],
  instrumentation: [],
  country: [],
  focus: [],
  from: MIN_YEAR,
  to: CURRENT_YEAR,
  sort: 'level-asc',
  view: 'grid',
  page: 1,
};

export const EMPTY_FILTERS: BrowseFilters = {
  q: '',
  composer: [],
  level: [],
  instrumentation: [],
  country: [],
  focus: [],
  from: MIN_YEAR,
  to: CURRENT_YEAR,
};

export const isYearFilterActive = (state: Pick<BrowseFilters, 'from' | 'to'>) =>
  state.from > MIN_YEAR || state.to < CURRENT_YEAR;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const list = (...values: (string | string[] | undefined)[]): string[] => {
  const items = values.flatMap((value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]));
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
};

const year = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, MIN_YEAR), CURRENT_YEAR) : fallback;
};

/**
 * Read browse state from the URL. Also accepts the parameter names used by older versions of
 * the site (selectedComposers, minYear, viewMode, ...) and /search-results?query=, so existing
 * bookmarks and shared links keep working.
 */
export function parseBrowseQuery(query: ParsedUrlQuery, instrument: Instrument): BrowseState {
  const q = first(query.q) ?? first(query.filter) ?? first(query.query) ?? '';

  const legacySort =
    isSortKey(`${first(query.sortField)}-${first(query.sortDirection)}`) &&
    (`${first(query.sortField)}-${first(query.sortDirection)}` as SortKey);
  const sortParam = first(query.sort);
  const sort = isSortKey(sortParam) ? sortParam : legacySort || DEFAULT_BROWSE_STATE.sort;

  const viewParam = first(query.view) ?? first(query.viewMode);
  const view: ViewMode = viewParam === 'list' ? 'list' : 'grid';

  let from = year(first(query.from) ?? first(query.minYear), MIN_YEAR);
  let to = year(first(query.to) ?? first(query.maxYear), CURRENT_YEAR);
  if (from > to) [from, to] = [to, from];

  const page = Number(first(query.page));

  return {
    q: q.slice(0, 200),
    composer: list(query.composer, query.selectedComposers),
    level: list(query.level, query.selectedLevels),
    instrumentation: list(query.instrumentation, query.selectedInstruments).map((value) =>
      normalizeInstrumentationOption(value, instrument)
    ),
    country: list(query.country, query.selectedCountries),
    focus: list(query.focus, query.selectedTechnicalFocus),
    from,
    to,
    sort,
    view,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Serialise only the values that differ from the defaults, keeping URLs short and shareable. */
export function browseStateToQuery(state: BrowseState): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  if (state.q.trim()) query.q = state.q.trim();
  if (state.composer.length) query.composer = state.composer;
  if (state.level.length) query.level = state.level;
  if (state.instrumentation.length) query.instrumentation = state.instrumentation;
  if (state.country.length) query.country = state.country;
  if (state.focus.length) query.focus = state.focus;
  if (state.from !== MIN_YEAR) query.from = String(state.from);
  if (state.to !== CURRENT_YEAR) query.to = String(state.to);
  if (state.sort !== DEFAULT_BROWSE_STATE.sort) query.sort = state.sort;
  if (state.view !== DEFAULT_BROWSE_STATE.view) query.view = state.view;
  if (state.page > 1) query.page = String(state.page);
  return query;
}

/** Order-independent key for comparing queries; `?a=x` and `{ a: ['x'] }` compare equal. */
export function queryKey(query: Record<string, string | string[] | undefined>): string {
  return JSON.stringify(
    Object.keys(query)
      .filter((key) => query[key] !== undefined)
      .sort()
      .map((key) => [key, ([] as string[]).concat(query[key] as string | string[])])
  );
}
