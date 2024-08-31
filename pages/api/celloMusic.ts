import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

type MusicPiece = {
  id: number;
  title: string;
  composer: string;
  level: string;
  instrumentation: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('music_pieces');

    const musicPieces = await collection
      .aggregate<MusicPiece>([
        {
          $lookup: {
            from: 'composers',
            localField: 'composer_id',
            foreignField: 'id',
            as: 'composerDetails',
          },
        },
        {
          $unwind: '$composerDetails',
        },
        {
          $group: {
            _id: {
              $toLower: { $substrCP: ['$composer', 0, 1] },
            },
            musicPieces: {
              $push: {
                title: '$title',
                composer: '$composerDetails.composer_full_name',
                level: '$level',
                description: '$description',
                instrumentation: '$instrumentation', // Preserve the instrumentation array
                id: '$id'
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .toArray();

    res.status(200).json(musicPieces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch music pieces' });
  }
}
