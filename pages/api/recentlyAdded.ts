// pages/api/recentlyAdded.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

type MusicPiece = {
  id: number;
  title: string;
  composer: string;
  composer_last_name: string;
  composer_first_name: string;
  composition_year: string;
  level: string;
  instrumentation: string[];
  nationality: string[];
  duration: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('cello_pieces');

    const recentlyAdded = await collection.aggregate<MusicPiece>([
      {
        $lookup: {
          from: 'composers',
          localField: 'composer_id',
          foreignField: 'id',
          as: 'composerDetails',
        },
      },
      { $unwind: '$composerDetails' },
      { $sort: { _id: -1 } }, // Newest first based on ObjectId timestamp
      { $limit: 10 },
      {
        $project: {
          id: 1,
          title: 1,
          composer: '$composerDetails.composer_full_name',
          composer_last_name: '$composerDetails.composer_last_name',
          composer_first_name: '$composerDetails.composer_first_name',
          composition_year: 1,
          level: 1,
          instrumentation: 1,
          nationality: '$composerDetails.nationality',
          duration: 1,
        },
      },
    ]).toArray();

    res.status(200).json(recentlyAdded);
  } catch (error) {
    console.error('Error fetching recently added music pieces:', error);
    res.status(500).json({ error: 'Failed to fetch recently added music pieces' });
  }
}
