import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

type MusicPiece = {
  id: number;
  title: string;
  composer: string;
  composer_last_name: string;
  composer_first_name: string;
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
        // Only include music pieces that are not disabled
        { $match: { disabled: false } },
        {
          $lookup: {
            from: 'composers',
            localField: 'composer_id',
            foreignField: 'id',
            as: 'composerDetails',
          },
        },
        { $unwind: '$composerDetails' },
        // Filter out pieces where the composer is disabled
        { $match: { "composerDetails.disabled": false } },
        {
          $group: {
            // Group by first letter of composer's last name
            _id: {
              $toLower: { $substrCP: ['$composerDetails.composer_last_name', 0, 1] },
            },
            // Ensure each piece appears only once
            musicPieces: {
              $addToSet: {
                id: '$id',
                title: '$title',
                composer: '$composerDetails.composer_full_name',
                composer_last_name: '$composerDetails.composer_last_name',
                composer_first_name: '$composerDetails.composer_first_name',
                composition_year: '$composition_year',
                level: '$level',
                instrumentation: '$instrumentation',
                nationality: '$composerDetails.nationality',
                duration: '$duration',
                tags: '$tags'
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    res.status(200).json(musicPieces);
  } catch (error) {
    console.error('Error fetching music pieces:', error);
    res.status(500).json({ error: 'Failed to fetch music pieces' });
  }
}
