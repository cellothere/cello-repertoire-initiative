import type { PieceSummary } from './types';
import { COMPOSER_GROUPS, type ComposerGroupSlug } from './composer-groups';
import { isFreeIn } from './copyright';

export type DatabaseSlug = ComposerGroupSlug | 'free';

export interface FeaturedDatabase {
  slug: DatabaseSlug;
  label: string;
  matches: (piece: PieceSummary) => boolean;
}

/**
 * The featured databases, in the order the site shows them. Free Music depends on copyright rules, so it needs the
 * visitor's country (null: only music that's free everywhere).
 */
export const featuredDatabases = (country: string | null): FeaturedDatabase[] => [
  ...COMPOSER_GROUPS,
  { slug: 'free', label: 'Free Music', matches: (piece) => isFreeIn(piece, country) },
];

export const DATABASE_SLUGS: DatabaseSlug[] = featuredDatabases(null).map((database) => database.slug);
