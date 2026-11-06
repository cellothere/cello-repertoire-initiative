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
  removeDiacritics(str.toLowerCase()).replace(/[.'’‘ʻ]/g, '').replace(/\s+/g, ' ').trim();

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/** Does `term` occur in `text` starting at the beginning of a word and, if `wholeWord`, ending at the end of one? */
function occursAsWord(text: string, term: string, wholeWord: boolean): boolean {
  for (let at = text.indexOf(term); at !== -1; at = text.indexOf(term, at + 1)) {
    const end = at + term.length;
    const startsWord = at === 0 || !WORD_CHARACTER.test(text[at - 1]);
    if (startsWord && (!wholeWord || end === text.length || !WORD_CHARACTER.test(text[end]))) return true;
  }
  return false;
}

/**
 * Does one typed word match normalized piece text? Words of one or two letters must start a word, or "am" would find
 * "exam" and "i" nearly everything. Longer words can appear anywhere, so "cello" still finds "violoncello".
 */
export const matchesSearchWord = (text: string, word: string): boolean =>
  word.length <= 2 ? occursAsWord(text, word, false) : text.includes(word);

/** How closely a piece fits a search, best first: exact title, title opening, exact phrase, all whole words, the rest. */
export function searchRank(query: string, title: string, text: string): number {
  const phrase = normalizeForSearch(query);
  const normalizedTitle = normalizeForSearch(title);
  if (normalizedTitle === phrase) return 0;
  if (normalizedTitle.startsWith(phrase) && occursAsWord(normalizedTitle, phrase, true)) return 1;
  if (occursAsWord(text, phrase, true)) return 2;
  return phrase.split(' ').every((word) => occursAsWord(text, word, true)) ? 3 : 4;
}

/** Edit distance (swapped neighbours count as one edit), capped: anything above `max` returns max + 1. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], before[j - 2] + 1);
    }
    if (Math.min(...row) > max) return max + 1;
    before = prev;
    prev = row;
  }
  return prev[b.length];
}

/**
 * Forgiving match for filter search boxes: every word typed must start, appear in, or be a small typo of some word
 * in the label, in any order ("spicato" finds "Spiccato", "harm false" finds "False Harmonics").
 */
export function fuzzyMatches(query: string, label: string): boolean {
  const needle = normalizeForSearch(query);
  if (!needle) return true;
  const haystack = normalizeForSearch(label);
  if (haystack.includes(needle)) return true;
  const words = haystack.split(/[\s/-]+/);
  return needle.split(' ').every((part) => {
    const allowed = part.length >= 7 ? 2 : part.length >= 4 ? 1 : 0;
    return words.some(
      (word) => word.includes(part) || (allowed > 0 && editDistance(part, word.slice(0, part.length + 1), allowed) <= allowed)
        || (allowed > 0 && editDistance(part, word, allowed) <= allowed)
    );
  });
}

/** Strip qualifiers such as "(Book 2)" so levels group and sort together. */
export const baseLevel = (level: string): string => level.replace(/\s*\(.*\)/, '').trim();

export const levelRank = (level: string): number => {
  const index = LEVEL_ORDER.indexOf(baseLevel(level));
  return index === -1 ? LEVEL_ORDER.length : index;
};

/** Order pieces outward from a level: that level first, then each easier level, then each harder one up to the top. */
export function sortFromLevel<T extends { level: string }>(pieces: T[], start: string): T[] {
  const anchor = levelRank(start);
  const place = (level: string) => {
    const rank = levelRank(level);
    return rank <= anchor ? anchor - rank : rank;
  };
  return [...pieces].sort((a, b) => place(a.level) - place(b.level));
}

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

/** Every composer of a piece as "Last, First", lead first: "Blackwell, Kathy & Blackwell, David". */
export const formatComposers = (composers: { first_name: string; last_name: string }[]): string =>
  composers.length ? composers.map((c) => formatComposerName(c.first_name, c.last_name)).join(' & ') : 'Unknown';

/** Names joined for prose: "Kathy Blackwell and David Blackwell". */
export const joinNames = (names: string[]): string =>
  names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

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

/** The second a YouTube link starts at (t=141 or t=141s, or start=141), or 0 if it has none. */
export const youtubeStart = (link: string): number => {
  try {
    const url = new URL(link);
    const value = url.searchParams.get('t') ?? url.searchParams.get('start') ?? '';
    return Number(value.match(/^(\d+)s?$/)?.[1] ?? 0);
  } catch {
    return 0;
  }
};

/** A recording that can be played on the page: a streaming service's player, or an audio file. */
export type RecordingEmbed =
  | { kind: 'player'; service: 'Spotify' | 'Apple Music' | 'Deezer' | 'SoundCloud'; src: string; height: number }
  | { kind: 'audio'; src: string };

// SoundCloud profile pages that aren't a track or playlist.
const SOUNDCLOUD_PROFILE_PAGES = new Set(['tracks', 'albums', 'sets', 'reposts', 'likes', 'popular-tracks', 'followers', 'following', 'comments']);

/** The embeddable player for a Spotify, Apple Music, Deezer or SoundCloud link, or an audio file link. */
export const recordingEmbed = (link: string): RecordingEmbed | null => {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.replace(/^(www|m)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'open.spotify.com') {
    // Links may carry a locale ("/intl-de/track/…").
    const [type, id] = parts.filter((part) => !part.startsWith('intl-') && part !== 'embed');
    if (['track', 'album', 'playlist', 'episode'].includes(type) && /^[A-Za-z0-9]{22}$/.test(id ?? '')) {
      const single = type === 'track' || type === 'episode';
      return { kind: 'player', service: 'Spotify', src: `https://open.spotify.com/embed/${type}/${id}`, height: single ? 152 : 352 };
    }
  } else if (host === 'music.apple.com') {
    // /us/album/<slug>/<id>?i=<track id>, /us/song/<slug>/<id> or /us/playlist/<slug>/<id>
    const [country, type] = parts;
    const id = parts[parts.length - 1];
    const track = url.searchParams.get('i');
    if (/^[a-z]{2}$/.test(country ?? '') && ['album', 'song', 'playlist'].includes(type) && /^(\d+|pl\.[\w-]+)$/.test(id ?? '')) {
      const single = type === 'song' || Boolean(track && /^\d+$/.test(track));
      const query = type === 'album' && single ? `?i=${track}` : '';
      return { kind: 'player', service: 'Apple Music', src: `https://embed.music.apple.com${url.pathname}${query}`, height: single ? 175 : 450 };
    }
  } else if (host === 'deezer.com') {
    // /en/track/<id>, /album/<id> or /playlist/<id>
    const [type, id] = parts.filter((part) => !/^[a-z]{2}$/.test(part));
    if (['track', 'album', 'playlist'].includes(type) && /^\d+$/.test(id ?? '')) {
      return { kind: 'player', service: 'Deezer', src: `https://widget.deezer.com/widget/auto/${type}/${id}`, height: type === 'track' ? 152 : 300 };
    }
  } else if (host === 'soundcloud.com') {
    // A track (/<user>/<track>) or playlist (/<user>/sets/<name>), not a profile page.
    const isSet = parts[1] === 'sets' && parts.length >= 3;
    if (isSet || (parts.length >= 2 && !SOUNDCLOUD_PROFILE_PAGES.has(parts[1]))) {
      const page = `https://soundcloud.com/${parts.join('/')}`;
      const options = 'color=%23623d88&auto_play=false&hide_related=true&show_comments=false&show_reposts=false&visual=false';
      return { kind: 'player', service: 'SoundCloud', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(page)}&${options}`, height: isSet ? 450 : 166 };
    }
  } else if (/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)$/i.test(url.pathname)) {
    return { kind: 'audio', src: url.href };
  }
  return null;
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
