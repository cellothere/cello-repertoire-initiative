import type { Instrument } from './instruments';

/** The fields needed to list, filter and sort a piece. Shared by the API and the UI. */
export interface PieceSummary {
  id: number;
  instrument: Instrument;
  title: string;
  composer: string;
  composer_first_name: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
  nationality: string[];
  composition_year: string;
  duration: string;
  technique_focus: string[];
  tags: string[];
  composer_tags: string[];
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
  composer: {
    full_name: string;
    bio_link: string | null;
  };
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
