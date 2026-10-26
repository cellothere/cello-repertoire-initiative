import type { PieceSummary } from './types';
import { indigenousKeywords } from '@/utils/indigenousKeywords';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Short keywords (e.g. "moro", "san") must match whole words so that "Moroccan" isn't
// treated as Indigenous; longer ones match anywhere so "Anishinaabek" still matches.
const indigenousPatterns = indigenousKeywords.map((keyword) => {
  const escaped = escapeRegExp(keyword.toLowerCase());
  return keyword.length <= 4 ? new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'iu') : new RegExp(escaped, 'i');
});

const isIndigenous = (piece: PieceSummary) =>
  piece.nationality.some((nationality) => indigenousPatterns.some((pattern) => pattern.test(nationality)));

const GROUPS = [
  {
    slug: 'women',
    label: 'Women Composers',
    matches: (piece: PieceSummary) => piece.composer_tags.includes('Woman'),
  },
  {
    slug: 'queer',
    label: 'Queer Composers',
    matches: (piece: PieceSummary) => piece.composer_tags.includes('LGBTQIA+'),
  },
  {
    slug: 'black',
    label: 'Black Composers',
    matches: (piece: PieceSummary) =>
      piece.composer_tags.includes('Black') ||
      (piece.composers.some((c) => c.full_name === 'Traditional') &&
        (piece.tags.includes('Black Spiritual') || piece.tags.includes('Black Spirtuals'))),
  },
  {
    slug: 'indigenous',
    label: 'Indigenous Composers',
    matches: isIndigenous,
  },
  {
    // Composers who identify themselves as disabled or neurodivergent (or, for historical composers, whose
    // disability was documented in their lifetime); never retrospective diagnoses.
    slug: 'disabled-neurodivergent',
    label: 'Disabled & Neurodivergent Composers',
    matches: (piece: PieceSummary) =>
      piece.composer_tags.includes('Disabled') || piece.composer_tags.includes('Neurodivergent'),
  },
] as const;

/**
 * The featured databases: which pieces count as by women, queer, Black, Indigenous, or disabled and neurodivergent
 * composers. An anthology credited to "Various" joins a database through a piece tag with the database's name
 * (e.g. "Women Composers").
 */
export const COMPOSER_GROUPS = GROUPS.map((group) => ({
  ...group,
  matches: (piece: PieceSummary) => group.matches(piece) || piece.tags.includes(group.label),
}));

export type ComposerGroupSlug = (typeof GROUPS)[number]['slug'];
