import type { Instrument } from './instruments';

/** A composer as attached to a piece. Co-written works list several, lead composer first. */
export interface ComposerRef {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
}

/** The fields needed to list, filter and sort a piece. Shared by the API and the UI. */
export interface PieceSummary {
  id: number;
  instrument: Instrument;
  title: string;
  /** Every composer of the piece, lead first. */
  composers: ComposerRef[];
  /** The lead composer, used for sorting. */
  composer: string;
  composer_first_name: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
  /** Arranger credits, so a search for the arranger's name finds the piece. */
  arrangers: string[];
  /** Combined across all of the piece's composers. */
  nationality: string[];
  composition_year: string;
  duration: string;
  technique_focus: string[];
  tags: string[];
  /** Combined across all of the piece's composers. */
  composer_tags: string[];
  /** "public-domain", "from-composer" or ''; see lib/copyright.ts. */
  free_download: string;
  /** Four-digit year of first publication, or '' if unpublished or unknown. */
  first_published: string;
  /** Each composer's death year (null if living or unknown), for the public-domain check. */
  composer_died: (number | null)[];
  /** ISO date derived from the document's ObjectId; only set by the recently-added endpoint. */
  added_at?: string;
}

export interface PieceDetail {
  id: number;
  instrument: Instrument;
  title: string;
  composition_year: string;
  level: string;
  instrumentation: string[];
  publisher_info: string;
  description: string;
  technical_overview: string;
  technique_focus: string[];
  where_to_buy_or_download: string[];
  audio_link: string[];
  duration: string;
  /** Who arranged it, when the piece is an arrangement; shown under the composer line. */
  arrangers: string[];
  /** Lead composer first. Empty when the composer record is missing. */
  composers: {
    id: number;
    full_name: string;
    bio_link: string | null;
  }[];
}

export interface ComposerSummary {
  id: number;
  composer_full_name: string;
  composer_first_name: string;
  composer_last_name: string;
  born: string;
  died: string;
  nationality: string[];
  tags: string[];
  bio_link: string | null;
  cello_works: number;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  url: string;
}

export type SortKey =
  | 'level-asc'
  | 'level-desc'
  | 'title-asc'
  | 'title-desc'
  | 'composer-asc'
  | 'composer-desc'
  | 'year-asc'
  | 'year-desc'
  | 'duration-asc'
  | 'duration-desc';

export type ViewMode = 'grid' | 'list';
