// utils/musicUtils.ts
import { INSTRUMENT_LABELS, type Instrument } from '@/lib/instruments';
import type { PieceSummary, SortKey } from '@/lib/types';

export const LEVEL_ORDER = [
  'Early Beginner',
  'Beginner',
  'Late Beginner',
  'Early Intermediate',
  'Intermediate',
  'Late Intermediate',
  'Early Advanced',
  'Advanced',
  'Professional',
  'Various',
];

export const MIN_YEAR = 1600;
export const CURRENT_YEAR = new Date().getFullYear();

export const removeDiacritics = (str: string): string =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '');

export const normalizeForSearch = (str: string): string =>
  removeDiacritics(str.toLowerCase()).replace(/[.'’]/g, '').replace(/\s+/g, ' ').trim();

/** Strip qualifiers such as "(Book 2)" so levels group and sort together. */
export const baseLevel = (level: string): string => level.replace(/\s*\(.*\)/, '').trim();

export const levelRank = (level: string): number => {
  const index = LEVEL_ORDER.indexOf(baseLevel(level));
  return index === -1 ? LEVEL_ORDER.length : index;
};

/** Extract a usable year from values like "1890", "c. 1890", "1890-95" or "0000". */
export const parseYear = (value: string | undefined): number | null => {
  const match = value?.match(/\d{4}/);
  if (!match) return null;
  const year = Number(match[0]);
  return year > 0 ? year : null;
};

export const convertDurationToSeconds = (duration: string): number | null => {
  const parts = duration.split(':');
  if (parts.length !== 3) return null;
  const [hours, minutes, seconds] = parts.map(Number);
  if ([hours, minutes, seconds].some(Number.isNaN)) return null;
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
};

/** Formats "HH:MM:SS" as e.g. 5'30'' or 1hr 5'. Returns null when unknown. */
export const formatDuration = (duration: string | undefined): string | null => {
  if (!duration) return null;
  const total = convertDurationToSeconds(duration);
  if (total === null) return duration.includes(':') ? null : duration;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const ms = seconds > 0 ? `${minutes}'${seconds}''` : `${minutes}'`;
  return hours > 0 ? `${hours}hr ${ms}` : ms;
};

const SPECIAL_COMPOSERS = ['Various', 'Traditional', 'Anonymous', 'Other'];

/** "Last, First", or a single word for collective attributions like "Traditional". */
export const formatComposerName = (first: string | undefined, last: string | undefined): string => {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  for (const special of SPECIAL_COMPOSERS) {
    const lower = special.toLowerCase();
    if (f.toLowerCase().includes(lower) || l.toLowerCase().includes(lower)) return special;
  }
  if (!f) return l || 'Unknown';
  if (!l) return f;
  return `${l}, ${f}`;
};

export const hostnameOf = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/** Extract a YouTube video id from watch, short, embed and youtu.be links. */
export const youtubeId = (link: string): string | null => {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] ?? null;
  }
  return id && /^[\w-]{6,20}$/.test(id) ? id : null;
};

// ---------------------------------------------------------------------------
// Instrumentation categories
// ---------------------------------------------------------------------------

type InstrumentationCategory = 'piano' | 'solo' | 'duet' | 'ensemble' | 'orchestra' | 'other';

export function instrumentationOptions(instrument: Instrument): string[] {
  const label = INSTRUMENT_LABELS[instrument];
  return [
    `${label} and Piano`,
    `${label} Solo`,
    `${label} Duet`,
    `${label} Ensemble`,
    `${label} and Orchestra`,
    'Other',
  ];
}

const OPTION_SUFFIXES: [string, InstrumentationCategory][] = [
  [' and piano', 'piano'],
  [' solo', 'solo'],
  [' duet', 'duet'],
  [' ensemble', 'ensemble'],
  [' and orchestra', 'orchestra'],
];

const optionCategory = (option: string): InstrumentationCategory => {
  const lower = option.toLowerCase();
  return OPTION_SUFFIXES.find(([suffix]) => lower.endsWith(suffix))?.[1] ?? 'other';
};

/** Older URLs stored "Cello" for the "Cello Solo" option. */
export const normalizeInstrumentationOption = (value: string, instrument: Instrument): string =>
  value.toLowerCase() === instrument ? `${INSTRUMENT_LABELS[instrument]} Solo` : value;

export function instrumentationCategories(
  instrumentation: string[],
  instrument: Instrument
): Set<InstrumentationCategory> {
  const parts = instrumentation
    .map((part) => part.trim().toLowerCase())
    .map((part) => (part === `${instrument} solo` ? instrument : part));
  const allSame = parts.length > 0 && parts.every((part) => part === instrument);
  const categories = new Set<InstrumentationCategory>();

  if (parts.length === 1 && allSame) categories.add('solo');
  if (parts.length === 2 && allSame) categories.add('duet');
  if (parts.includes(`${instrument} ensemble`) || (parts.length >= 3 && allSame)) categories.add('ensemble');
  if (parts.includes(instrument) && parts.includes('piano')) categories.add('piano');
  if (parts.includes(instrument) && parts.includes('orchestra')) categories.add('orchestra');
  if (categories.size === 0 || parts.includes('other')) categories.add('other');
  return categories;
}

export const matchesInstrumentationOption = (
  categories: Set<InstrumentationCategory>,
  option: string
): boolean => categories.has(optionCategory(option));

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'level-asc', label: 'Level (easiest first)' },
  { value: 'level-desc', label: 'Level (hardest first)' },
  { value: 'title-asc', label: 'Title (A–Z)' },
  { value: 'title-desc', label: 'Title (Z–A)' },
  { value: 'composer-asc', label: 'Composer (A–Z)' },
  { value: 'composer-desc', label: 'Composer (Z–A)' },
  { value: 'year-asc', label: 'Year (oldest first)' },
  { value: 'year-desc', label: 'Year (newest first)' },
  { value: 'duration-asc', label: 'Duration (shortest first)' },
  { value: 'duration-desc', label: 'Duration (longest first)' },
];

export const isSortKey = (value: unknown): value is SortKey =>
  SORT_OPTIONS.some((option) => option.value === value);

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

/** Compare two possibly-missing numbers, always placing missing values last. */
const compareNullable = (a: number | null, b: number | null, dir: 1 | -1): number => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
};

export function sortPieces<T extends PieceSummary>(pieces: T[], sort: SortKey): T[] {
  const [field, direction] = sort.split('-') as [string, 'asc' | 'desc'];
  const dir = direction === 'asc' ? 1 : -1;

  const primary = (a: T, b: T): number => {
    switch (field) {
      case 'title':
        return collator.compare(a.title, b.title) * dir;
      case 'composer':
        return collator.compare(a.composer_last_name || a.composer, b.composer_last_name || b.composer) * dir;
      case 'level':
        return (levelRank(a.level) - levelRank(b.level)) * dir;
      case 'year':
        return compareNullable(parseYear(a.composition_year), parseYear(b.composition_year), dir);
      case 'duration':
        return compareNullable(convertDurationToSeconds(a.duration), convertDurationToSeconds(b.duration), dir);
      default:
        return 0;
    }
  };

  return [...pieces].sort((a, b) => primary(a, b) || collator.compare(a.title, b.title));
}
