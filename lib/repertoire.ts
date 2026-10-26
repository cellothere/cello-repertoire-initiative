import type { Document } from 'mongodb';
import { deathYear } from './copyright';
import { getDb } from './mongodb';
import { INSTRUMENTS, collectionFor, type Instrument } from './instruments';
import type { ComposerRef, ComposerSummary, PieceDetail, PieceSummary, Resource } from './types';

// ---------------------------------------------------------------------------
// Normalisers: the collections were filled by hand, so be lenient about types.
// ---------------------------------------------------------------------------

const str = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value == null ? '' : String(value);

const strArray = (value: unknown): string[] => {
  const items = Array.isArray(value) ? value : value == null ? [] : [value];
  return items.map(str).filter(Boolean);
};

const firstUrl = (value: unknown): string | null => strArray(value).find((v) => /^https?:\/\//.test(v)) ?? null;

// Pieces list their composers in `composer_ids` (lead first); documents written before co-written
// works were supported have only `composer_id`.
const composerIdsField: Document = {
  $addFields: {
    composerIds: {
      $cond: [{ $gt: [{ $size: { $ifNull: ['$composer_ids', []] } }, 0] }, '$composer_ids', ['$composer_id']],
    },
  },
};

// With an array localField, $lookup matches every composer whose id is in the list.
const composerLookup: Document[] = [
  composerIdsField,
  { $lookup: { from: 'composers', localField: 'composerIds', foreignField: 'id', as: 'composerDetails' } },
];

/** At least one of the piece's composers is enabled. */
const enabledComposerMatch: Document = { $match: { 'composerDetails.disabled': false } };

const summaryProjection = {
  _id: 1,
  id: 1,
  title: 1,
  level: 1,
  instrumentation: 1,
  arrangers: 1,
  composition_year: 1,
  duration: 1,
  technique_focus: 1,
  tags: 1,
  instrument: 1,
  free_download: 1,
  first_published: 1,
  composerIds: 1,
  'composerDetails.id': 1,
  'composerDetails.composer_full_name': 1,
  'composerDetails.composer_first_name': 1,
  'composerDetails.composer_last_name': 1,
  'composerDetails.nationality': 1,
  'composerDetails.tags': 1,
  'composerDetails.bio_link': 1,
  'composerDetails.died': 1,
  'composerDetails.disabled': 1,
};

/** The looked-up composer documents in the piece's own order (lead first); the lookup doesn't keep it. */
function composerDocs(doc: Document, { enabledOnly }: { enabledOnly: boolean }): Document[] {
  const ids: number[] = (Array.isArray(doc.composerIds) ? doc.composerIds : []).map(Number);
  const details: Document[] = Array.isArray(doc.composerDetails) ? doc.composerDetails : [];
  const byId = new Map(details.map((c) => [Number(c.id), c]));
  const ordered = Array.from(new Set(ids), (id) => byId.get(id)).filter((c): c is Document => Boolean(c));
  return enabledOnly ? ordered.filter((c) => c.disabled !== true) : ordered;
}

const union = (lists: string[][]): string[] => Array.from(new Set(lists.flat()));

function toSummary(doc: Document, instrument: Instrument): PieceSummary {
  const composers = composerDocs(doc, { enabledOnly: true });
  const refs: ComposerRef[] = composers.map((c) => ({
    id: Number(c.id),
    full_name: str(c.composer_full_name),
    first_name: str(c.composer_first_name),
    last_name: str(c.composer_last_name),
  }));
  const lead = refs[0];
  return {
    id: Number(doc.id),
    instrument,
    title: str(doc.title),
    composers: refs,
    composer: lead?.full_name ?? '',
    composer_first_name: lead?.first_name ?? '',
    composer_last_name: lead?.last_name ?? '',
    level: str(doc.level) || 'Unknown',
    instrumentation: strArray(doc.instrumentation),
    arrangers: strArray(doc.arrangers),
    nationality: union(composers.map((c) => strArray(c.nationality))),
    composition_year: str(doc.composition_year),
    duration: str(doc.duration),
    technique_focus: strArray(doc.technique_focus),
    tags: strArray(doc.tags),
    composer_tags: union(composers.map((c) => strArray(c.tags))),
    free_download: str(doc.free_download),
    first_published: str(doc.first_published),
    // "Traditional" (id 0) has no death year and doesn't hold a copyright.
    composer_died: composers.filter((c) => Number(c.id) !== 0).map((c) => deathYear(c.died)),
  };
}

function dedupeById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter((item) => !seen.has(item.id) && seen.add(item.id));
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** All enabled pieces for an instrument that have at least one enabled composer. */
export async function listPieces(instrument: Instrument): Promise<PieceSummary[]> {
  const db = await getDb();
  const docs = await db
    .collection(collectionFor(instrument))
    .aggregate([
      { $match: { disabled: false } },
      ...composerLookup,
      enabledComposerMatch,
      { $project: summaryProjection },
    ])
    .toArray();
  return dedupeById(docs.map((doc) => toSummary(doc, instrument)));
}

/** The newest pieces across every instrument collection. */
export async function listRecentlyAdded(limit = 12): Promise<PieceSummary[]> {
  const db = await getDb();
  const branch = (instrument: Instrument): Document[] => [
    { $match: { disabled: false } },
    { $addFields: { instrument } },
  ];
  const [first, ...rest] = INSTRUMENTS;

  // Sort and limit on the raw collections first so the composer lookup only runs on `limit` docs.
  const docs = await db
    .collection(collectionFor(first))
    .aggregate([
      ...branch(first),
      ...rest.map((instrument) => ({
        $unionWith: { coll: collectionFor(instrument), pipeline: branch(instrument) },
      })),
      { $sort: { _id: -1 } },
      { $limit: limit * 2 },
      ...composerLookup,
      enabledComposerMatch,
      { $limit: limit },
      { $project: summaryProjection },
    ])
    .toArray();

  return docs.map((doc) => ({
    ...toSummary(doc, doc.instrument as Instrument),
    added_at: doc._id?.getTimestamp?.().toISOString(),
  }));
}

/** Specific pieces, used for a user's saved list. Results keep the order of `refs`. */
export async function getPiecesByRefs(
  refs: { pieceId: number; instrument: Instrument }[]
): Promise<PieceSummary[]> {
  const db = await getDb();
  const byInstrument = new Map<Instrument, number[]>();
  for (const { pieceId, instrument } of refs) {
    byInstrument.set(instrument, [...(byInstrument.get(instrument) ?? []), pieceId]);
  }

  const results = await Promise.all(
    Array.from(byInstrument, async ([instrument, ids]) => {
      const docs = await db
        .collection(collectionFor(instrument))
        .aggregate([
          { $match: { id: { $in: ids }, disabled: false } },
          ...composerLookup,
          { $project: summaryProjection },
        ])
        .toArray();
      return docs.map((doc) => toSummary(doc, instrument));
    })
  );

  const lookup = new Map(results.flat().map((piece) => [`${piece.instrument}:${piece.id}`, piece]));
  return refs
    .map(({ pieceId, instrument }) => lookup.get(`${instrument}:${pieceId}`))
    .filter((piece): piece is PieceSummary => Boolean(piece));
}

export async function getPieceDetail(instrument: Instrument, id: number): Promise<PieceDetail | null> {
  const db = await getDb();
  const doc = await db
    .collection(collectionFor(instrument))
    .aggregate([
      { $match: { id, disabled: { $ne: true } } },
      { $limit: 1 },
      ...composerLookup,
    ])
    .next();

  if (!doc) return null;

  return {
    id: Number(doc.id),
    instrument,
    title: str(doc.title) || 'Untitled',
    composition_year: str(doc.composition_year),
    level: str(doc.level) || 'Unknown',
    instrumentation: strArray(doc.instrumentation),
    publisher_info: str(doc.publisher_info),
    description: str(doc.description),
    technical_overview: str(doc.technical_overview),
    technique_focus: strArray(doc.technique_focus),
    where_to_buy_or_download: strArray(doc.where_to_buy_or_download),
    audio_link: strArray(doc.audio_link),
    duration: str(doc.duration),
    arrangers: strArray(doc.arrangers),
    composers: composerDocs(doc, { enabledOnly: false }).map((c) => ({
      id: Number(c.id),
      full_name: str(c.composer_full_name) || 'Unknown Composer',
      bio_link: firstUrl(c.bio_link),
    })),
  };
}

export async function listComposers(): Promise<ComposerSummary[]> {
  const db = await getDb();
  const [composers, counts] = await Promise.all([
    db
      .collection('composers')
      .find(
        { composer_full_name: { $nin: [null, ''] }, disabled: false },
        {
          projection: {
            _id: 0,
            id: 1,
            composer_full_name: 1,
            composer_first_name: 1,
            composer_last_name: 1,
            born: 1,
            died: 1,
            nationality: 1,
            tags: 1,
            bio_link: 1,
          },
        }
      )
      .toArray(),
    db
      .collection(collectionFor('cello'))
      .aggregate<{ _id: number; count: number }>([
        { $match: { disabled: false } },
        composerIdsField,
        { $unwind: '$composerIds' },
        { $group: { _id: '$composerIds', count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const worksByComposer = new Map(counts.map(({ _id, count }) => [_id, count]));

  return dedupeById(
    composers.map((doc) => ({
      id: Number(doc.id),
      composer_full_name: str(doc.composer_full_name),
      composer_first_name: str(doc.composer_first_name),
      composer_last_name: str(doc.composer_last_name),
      born: str(doc.born),
      died: str(doc.died),
      nationality: strArray(doc.nationality),
      tags: strArray(doc.tags),
      bio_link: firstUrl(doc.bio_link),
      cello_works: worksByComposer.get(doc.id) ?? 0,
    }))
  );
}

export async function listResources(): Promise<Resource[]> {
  const db = await getDb();
  const docs = await db.collection('resources').find({ disabled: false }).sort({ title: 1 }).toArray();
  return docs.map((doc) => ({
    _id: String(doc._id),
    title: str(doc.title),
    description: str(doc.description),
    url: str(doc.url),
  }));
}
