import type { NextApiRequest, NextApiResponse } from 'next';
import type { Document, WithId } from 'mongodb';
import { adminHandler, applyEdit, EditError, logEdit } from '@/lib/admin';
import { PIECE_FIELDS, normalizeFields } from '@/lib/admin-fields';
import { collectionFor, isInstrument, pieceHref, type Instrument } from '@/lib/instruments';
import { getDb } from '@/lib/mongodb';
import { getPieceDetail } from '@/lib/repertoire';
import type { User } from '@/lib/auth-middleware';

const isUrl = (value: unknown): value is string => typeof value === 'string' && /^https?:\/\/\S+$/i.test(value);

/** Composer bio links are stored as a string, a list (the first link is used) or null. */
function firstLink(value: unknown): string {
  const items = Array.isArray(value) ? value : [value];
  return items.find(isUrl) ?? '';
}

function target(source: Record<string, unknown>): { instrument: Instrument; id: number } {
  const id = Number(source.id);
  if (!isInstrument(source.instrument) || !Number.isInteger(id) || id < 0) throw new EditError('Unknown piece.');
  return { instrument: source.instrument, id };
}

async function loadPiece(instrument: Instrument, id: number) {
  const db = await getDb();
  const doc = await db.collection(collectionFor(instrument)).findOne({ id });
  if (!doc) throw new EditError('That piece no longer exists.', 404);
  const ids: number[] = (Array.isArray(doc.composer_ids) && doc.composer_ids.length ? doc.composer_ids : [doc.composer_id])
    .map(Number)
    .filter(Number.isInteger);
  const found = await db.collection('composers').find({ id: { $in: ids } }).toArray();
  const composers = ids
    .map((composerId) => found.find((c) => Number(c.id) === composerId))
    .filter((c): c is WithId<Document> => Boolean(c));
  return { doc, composers };
}

type BioLinkUpdate = { composer: Document; before: unknown; after: unknown };

/**
 * Checks submitted composer bio links before anything is saved, and returns the ones that changed. A link edited on
 * one piece changes it for all of that composer's pieces.
 */
function planBioLinks(composers: Document[], submitted: unknown): BioLinkUpdate[] {
  if (submitted === undefined) return [];
  if (!Array.isArray(submitted)) throw new EditError('Composer links: expected a list.');
  const updates: BioLinkUpdate[] = [];
  for (const entry of submitted) {
    const composer = composers.find((c) => Number(c.id) === Number(entry?.id));
    if (!composer) throw new EditError('Composer links: that composer is not credited on this piece.');
    const link = typeof entry.bio_link === 'string' ? entry.bio_link.trim() : '';
    if (link && !isUrl(link)) throw new EditError(`Composer link for ${composer.composer_full_name}: must start with http:// or https://`);
    const before = composer.bio_link ?? null;
    const old = firstLink(before);
    if (link === old) continue;
    // Keep the stored shape: lists keep any other entries after the main link.
    const after = Array.isArray(before) ? [...(link ? [link] : []), ...before.filter((v: unknown) => v !== old)] : link || null;
    updates.push({ composer, before, after });
  }
  return updates;
}

async function saveBioLinks(user: User, updates: BioLinkUpdate[]) {
  const db = await getDb();
  for (const { composer, before, after } of updates) {
    await db.collection('composers').updateOne({ _id: composer._id }, { $set: { bio_link: after } });
    await logEdit(user, 'composers', { _id: composer._id }, { bio_link: { before, after } });
  }
}

async function editorData(instrument: Instrument, id: number) {
  const { doc, composers } = await loadPiece(instrument, id);
  return {
    fields: normalizeFields(PIECE_FIELDS, doc),
    composers: composers.map((c) => ({ id: Number(c.id), full_name: String(c.composer_full_name ?? ''), bio_link: firstLink(c.bio_link) })),
  };
}

/**
 * GET ?instrument=cello&id=1764: the piece's editable fields as stored, for the admin edit form.
 * PATCH { instrument, id, changes, composers? }: saves the changed fields (and composer bio links), refreshes the
 * piece page, and returns the page's new data plus the stored fields.
 */
export default adminHandler(['GET', 'PATCH'], async (req: NextApiRequest, res: NextApiResponse, user) => {
  if (req.method === 'GET') {
    const { instrument, id } = target(req.query);
    res.status(200).json(await editorData(instrument, id));
    return;
  }

  const body = req.body ?? {};
  const { instrument, id } = target(body);
  const { composers } = await loadPiece(instrument, id);
  const linkUpdates = planBioLinks(composers, body.composers);
  const { changed } = await applyEdit({
    user,
    collection: collectionFor(instrument),
    filter: { id },
    specs: PIECE_FIELDS,
    changes: body.changes ?? {},
  });
  await saveBioLinks(user, linkUpdates);
  const linksChanged = linkUpdates.length > 0;

  if (changed.length > 0 || linksChanged) {
    try {
      await res.revalidate(pieceHref(instrument, id));
    } catch (error) {
      // The page still refreshes on its own within a minute (see lib/piece-static.ts).
      console.error('Revalidate after admin edit failed:', error);
    }
  }

  res.status(200).json({
    changed: [...changed, ...(linksChanged ? ['composer links'] : [])],
    piece: await getPieceDetail(instrument, id),
    ...(await editorData(instrument, id)),
  });
});
