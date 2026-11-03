import type { ComposerSummary, PieceSummary } from './types';
import type { DatabaseSlug, FeaturedDatabase } from './featured-databases';
import { isIndigenousNationality } from './composer-groups';

type IdentitySlug = Exclude<DatabaseSlug, 'living' | 'free'>;

// Who belongs to each identity database, judged on the composer's own record rather than the piece's combined tags,
// so a co-composer outside the group doesn't appear.
const BELONGS: Record<IdentitySlug, (composer: ComposerSummary) => boolean> = {
  women: (c) => c.tags.includes('Woman'),
  'disabled-neurodivergent': (c) => c.tags.includes('Disabled') || c.tags.includes('Neurodivergent'),
  queer: (c) => c.tags.includes('LGBTQIA+'),
  black: (c) => c.tags.includes('Black'),
  indigenous: (c) => c.nationality.some(isIndigenousNationality),
};

// Household names who do belong to a database (e.g. Beethoven, deaf, in Disabled & Neurodivergent) but are left out
// of the header: its imagery is for off-the-beaten-path composers, not the canon.
const CANON = new Set([
  'Aaron Copland',
  'Bedřich Smetana',
  'Benjamin Britten',
  'Francis Poulenc',
  'Frederick Delius',
  'Gabriel Fauré',
  'Gustav Holst',
  'Darius Milhaud',
  'Joaquín Rodrigo',
  'John Cage',
  'Leonard Bernstein',
  'Ludwig van Beethoven',
  'Pyotr Ilyich Tchaikovsky',
  'Ralph Vaughan Williams',
  'Robert Schumann',
  'Samuel Barber',
]);

const inAnyGroup = (composer: ComposerSummary) => Object.values(BELONGS).some((belongs) => belongs(composer));

/**
 * The composer names shown drifting behind the Featured Databases header: the composers of the database's pieces.
 * The Living and Free Music databases also take in canonical composers, so for those only composers who belong to
 * one of the identity databases are named, and the canon is left out everywhere, so the header imagery stays with
 * under-recognised composers.
 */
export function databaseNames(database: FeaturedDatabase, pieces: PieceSummary[], composers: ComposerSummary[]): string[] {
  const ids = new Set<number>();
  for (const piece of pieces) {
    if (database.matches(piece)) piece.composers.forEach((composer) => ids.add(composer.id));
  }
  const belongs =
    database.slug === 'living'
      ? (c: ComposerSummary) => !c.died.trim() && inAnyGroup(c)
      : database.slug === 'free'
        ? inAnyGroup
        : BELONGS[database.slug];
  const names = composers
    .filter((c) => c.id !== 0 && ids.has(c.id) && c.composer_full_name !== 'Various' && !CANON.has(c.composer_full_name.trim()) && belongs(c))
    .map((c) => c.composer_full_name.trim());
  return Array.from(new Set(names));
}
