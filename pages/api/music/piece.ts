// pages/api/music/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

//Create the object
type MusicPiece = {
  id: number;
  title: string;
  level_id: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('music_pieces');

    const musicPiece = await collection.findOne<MusicPiece>({ id: Number(id) });

    if (!musicPiece) {
      res.status(404).json({ error: 'Music piece not found' });
      return;
    }

    res.status(200).json(musicPiece);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch music piece' });
  }
}
