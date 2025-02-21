import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

type MusicPiece = {
  id: number;
  title: string;
  composer: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
  nationality: string;
  composition_year: string;
  duration: string;
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
              $toLower: { $substrCP: ['$composerDetails.composer_last_name', 0, 1] },
            },
            musicPieces: {
              $push: {
                id: '$id',
                title: '$title',
                composer: '$composerDetails.composer_full_name',
                composer_last_name: '$composerDetails.composer_last_name',
                composition_year: '$composition_year',
                level: '$level',
                instrumentation: '$instrumentation', // Preserve the instrumentation array
                nationality: '$composerDetails.nationality', // Include nationality
                duration: '$duration'
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
    console.error('Error fetching music pieces:', error);
    res.status(500).json({ error: 'Failed to fetch music pieces' });
  }
}
