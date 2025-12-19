import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth-middleware';

interface SavedPiece {
  pieceId: number;
  instrument: string;
  savedAt: Date;
}

interface User {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  savedPieces: SavedPiece[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await requireAuth(req);
    const client = await clientPromise;
    const db = client.db('repertoire');
    const usersCollection = db.collection<User>('users');

    // GET: Return all saved pieces with full details
    if (req.method === 'GET') {
      const pieceIds = user.savedPieces.map(sp => sp.pieceId);

      if (pieceIds.length === 0) {
        return res.status(200).json({ pieces: [] });
      }

      // Aggregate to get piece details from all instrument collections
      const collections = ['cello_pieces', 'violin_pieces', 'viola_pieces', 'bass_pieces'];
      const pieces: any[] = [];

      for (const collectionName of collections) {
        const piecesData = await db.collection(collectionName).aggregate([
          { $match: { id: { $in: pieceIds }, disabled: false } },
          {
            $lookup: {
              from: 'composers',
              localField: 'composer_id',
              foreignField: 'id',
              as: 'composerDetails'
            }
          },
          { $unwind: { path: '$composerDetails', preserveNullAndEmptyArrays: true } }
        ]).toArray();

        pieces.push(...piecesData);
      }

      return res.status(200).json({ pieces });
    }

    // POST: Save a piece
    if (req.method === 'POST') {
      const { pieceId, instrument } = req.body;

      if (!pieceId || !instrument) {
        return res.status(400).json({ error: 'pieceId and instrument are required' });
      }

      // Add piece to savedPieces array (idempotent with $addToSet)
      const result = await usersCollection.findOneAndUpdate(
        { id: user.id },
        {
          $addToSet: {
            savedPieces: {
              pieceId,
              instrument,
              savedAt: new Date()
            }
          },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );

      return res.status(200).json({
        success: true,
        savedPieces: result?.savedPieces || []
      });
    }

    // DELETE: Unsave a piece
    if (req.method === 'DELETE') {
      const { pieceId } = req.body;

      if (!pieceId) {
        return res.status(400).json({ error: 'pieceId is required' });
      }

      // Remove piece from savedPieces array
      const result = await usersCollection.findOneAndUpdate(
        { id: user.id },
        {
          $pull: {
            savedPieces: { pieceId }
          },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );

      return res.status(200).json({
        success: true,
        savedPieces: result?.savedPieces || []
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Saved pieces error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
