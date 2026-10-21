export const INSTRUMENTS = ['cello', 'violin', 'viola', 'bass'] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  cello: 'Cello',
  violin: 'Violin',
  viola: 'Viola',
  bass: 'Bass',
};

/** Instruments that have a browsable listing page. */
export const LISTING_PATHS: Partial<Record<Instrument, string>> = {
  cello: '/cello-music',
  violin: '/violin-music',
};

export function isInstrument(value: unknown): value is Instrument {
  return typeof value === 'string' && (INSTRUMENTS as readonly string[]).includes(value);
}

export function collectionFor(instrument: Instrument): string {
  return `${instrument}_pieces`;
}

export function pieceHref(instrument: Instrument, id: number): string {
  return `/${instrument}-piece/${id}`;
}

/** Link to the listing page filtered to a single composer, if that instrument has a listing. */
export function composerWorksHref(instrument: Instrument, composer: string): string | null {
  const base = LISTING_PATHS[instrument];
  return base ? `${base}?composer=${encodeURIComponent(composer)}` : null;
}
