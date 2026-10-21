import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/mongodb';
import { allowMethods } from '@/lib/api';
import { getUsersCollection, isUnauthorized, requireAuth, type SavedPiece } from '@/lib/auth-middleware';
import { collectionFor, isInstrument, type Instrument } from '@/lib/instruments';
import { getPiecesByRefs } from '@/lib/repertoire';

const MAX_SAVED_PIECES = 1000;

/** Entries saved before instruments were tracked reliably belong to the cello catalogue. */
const instrumentOf = (saved: Partial<SavedPiece>): Instrument =>
  isInstrument(saved.instrument) ? saved.instrument : 'cello';

function parseBody(req: NextApiRequest): { pieceId: number; instrument: Instrument } | null {
  const { pieceId, instrument = 'cello' } = req.body ?? {};
  const id = Number(pieceId);
  if (!Number.isInteger(id) || id < 0 || !isInstrument(instrument)) return null;
  return { pieceId: id, instrument };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET', 'POST', 'DELETE'])) return;
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const user = await requireAuth(req);
    const users = await getUsersCollection();

    if (req.method === 'GET') {
      const refs = [...user.savedPieces]
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        .map((saved) => ({ pieceId: saved.pieceId, instrument: instrumentOf(saved) }));
      const pieces = refs.length > 0 ? await getPiecesByRefs(refs) : [];
      return res.status(200).json({ pieces });
    }

    const target = parseBody(req);
    if (!target) {
      return res.status(400).json({ error: 'A valid pieceId and instrument are required' });
    }
    const { pieceId, instrument } = target;

    if (req.method === 'POST') {
      if (user.savedPieces.length >= MAX_SAVED_PIECES) {
        return res.status(400).json({ error: `You can save up to ${MAX_SAVED_PIECES} pieces` });
      }

      const exists = await (await getDb())
        .collection(collectionFor(instrument))
        .findOne({ id: pieceId }, { projection: { _id: 1 } });
      if (!exists) {
        return res.status(404).json({ error: 'Piece not found' });
      }

      // Only push when this piece isn't already saved, so repeated clicks can't create duplicates.
      await users.updateOne(
        { id: user.id, savedPieces: { $not: { $elemMatch: { pieceId, instrument } } } },
        {
          $push: { savedPieces: { pieceId, instrument, savedAt: new Date() } },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      // `null` also matches legacy entries that were saved without an instrument.
      const instruments = instrument === 'cello' ? ['cello', null] : [instrument];
      await users.updateOne(
        { id: user.id },
        {
          $pull: { savedPieces: { pieceId, instrument: { $in: instruments } } as never },
          $set: { updatedAt: new Date() },
        }
      );
    }

    const updated = await users.findOne({ id: user.id }, { projection: { savedPieces: 1 } });
    return res.status(200).json({ success: true, savedPieces: updated?.savedPieces ?? [] });
  } catch (error) {
    if (isUnauthorized(error)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Saved pieces error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
