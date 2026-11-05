import { LEVEL_ORDER } from '@/utils/musicUtils';

/** "Hägg, Jakob Adolf" → "hagg-jakob-adolf": lowercase ASCII words joined by hyphens. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[øØ]/g, 'o')
    .replace(/[łŁ]/g, 'l')
    .replace(/[æÆ]/g, 'ae')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Each composer's page address (/composers/<slug>), from their name. Names that slugify the same (or to nothing, e.g.
 * names in other scripts) get the record id added, the lowest id keeping the plain form, so addresses stay stable as
 * composers are added.
 */
export function composerSlugMap(composers: { id: number; name: string }[]): Map<number, string> {
  const byId = [...composers].sort((a, b) => a.id - b.id);
  const taken = new Set<string>();
  const slugs = new Map<number, string>();
  for (const { id, name } of byId) {
    const base = slugify(name) || 'composer';
    const slug = taken.has(base) || base === 'composer' ? `${base}-${id}` : base;
    taken.add(slug);
    slugs.set(id, slug);
  }
  return slugs;
}

export const composerPath = (slug: string) => `/composers/${slug}`;

/** Levels with their own page under /cello-music/<slug> ("Various" is a catch-all, not a level). */
export const PAGE_LEVELS = LEVEL_ORDER.filter((level) => level !== 'Various');

export const levelSlug = (level: string) => slugify(level);

export const levelFromSlug = (slug: string): string | null => PAGE_LEVELS.find((level) => levelSlug(level) === slug) ?? null;

export const levelPath = (level: string) => `/cello-music/${levelSlug(level)}`;

/** "1887–1953", "b. 1963", or '' when the dates aren't known. */
export function lifeDates(composer: { born: string; died: string }): string {
  const born = composer.born.trim();
  const died = composer.died.trim();
  if (born && died) return `${born}–${died}`;
  if (born) return `b. ${born}`;
  if (died) return `d. ${died}`;
  return '';
}

export const databasePath = (slug: string) => `/featured-databases/${slug}`;
