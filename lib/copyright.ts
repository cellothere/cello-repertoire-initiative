// Whether a free-download piece can be downloaded legally in a visitor's country.
//
// A piece's `free_download` says why it is free:
// - "from-composer": the composer or rights holder gives it away (or licenses it freely), so it is free everywhere.
// - "public-domain": free only where its copyright has run out, worked out from the composers' death years and,
//   for the United States, the year it was first published.
// This is a guide for finding music, not legal advice; the rules below are deliberately cautious.

export const FREE_DOWNLOAD_KINDS = ['public-domain', 'from-composer'] as const;

export interface CopyrightFacts {
  free_download: string;
  /** Four-digit year, or '' when unpublished or unknown. */
  first_published: string;
  /** Death year of each composer, or null if living or unknown. */
  composer_died: (number | null)[];
}

// Years of protection after the author's death, for countries that differ from the usual 70.
// Countries not listed here are assumed to protect for 70 years, the most common term.
const TERM_AFTER_DEATH: Record<string, number> = {
  CN: 50, HK: 50, MO: 50, TW: 50, EG: 50, ZA: 50, PH: 50, TH: 50, MY: 50, PK: 50, IR: 50, SA: 50, AE: 50,
  KE: 50, VN: 50, IN: 60, VE: 60, BD: 60, GT: 75, HN: 75, CO: 80, JM: 95, CI: 99, MX: 100,
};

// The longest term anywhere (Mexico), so a work this old is free in every country.
const LONGEST_TERM = 100;

// Countries that lengthened their term without reviving copyrights that had already run out: authors who died
// on or before the year given are free under the old, shorter term; later deaths get 70 years.
const EXPIRED_BEFORE_EXTENSION: Record<string, number> = { CA: 1971, JP: 1967, NZ: 1972 };

/** Whether every composer died long enough ago for the given term, as of `year`. */
function allDiedBefore(died: (number | null)[], term: number, year: number): boolean {
  return died.length > 0 && died.every((d) => d !== null && d + term < year);
}

function freeInUnitedStates(facts: CopyrightFacts, year: number): boolean {
  // Works published 95+ years ago are free. Without a publication year, only count works whose composers died
  // that long ago, since anything they published in their lifetime is then old enough too.
  const published = Number(facts.first_published) || null;
  if (published) return published + 95 < year;
  return allDiedBefore(facts.composer_died, 95, year);
}

/**
 * Whether the piece is a free download in `country` (an ISO 3166 code such as "US").
 * With no country, only pieces that are free everywhere count.
 */
export function isFreeIn(facts: CopyrightFacts, country: string | null, year = new Date().getFullYear()): boolean {
  if (facts.free_download === 'from-composer') return true;
  if (facts.free_download !== 'public-domain') return false;

  if (allDiedBefore(facts.composer_died, LONGEST_TERM, year) && freeInUnitedStates(facts, year)) return true;
  if (!country) return false;
  const code = country.toUpperCase();

  if (code === 'US') return freeInUnitedStates(facts, year);
  const cutoff = EXPIRED_BEFORE_EXTENSION[code];
  if (cutoff && facts.composer_died.length && facts.composer_died.every((d) => d !== null && d <= cutoff)) return true;
  // Spain kept 80 years for authors who died before 7 December 1987.
  const spainOldTerm = code === 'ES' && facts.composer_died.some((d) => d !== null && d < 1988);
  const term = spainOldTerm ? 80 : TERM_AFTER_DEATH[code] ?? 70;
  return allDiedBefore(facts.composer_died, term, year);
}

/** A free piece that is still under copyright somewhere, so the country matters. */
export function dependsOnCountry(facts: CopyrightFacts): boolean {
  return facts.free_download === 'public-domain' && !isFreeIn(facts, null);
}

/** A four-digit year from strings like "1931" or "c. 1931", or null. */
export function deathYear(value: unknown): number | null {
  const match = String(value ?? '').match(/\d{4}/);
  return match ? Number(match[0]) : null;
}
