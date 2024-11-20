import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

type MusicPiece = {
  id: number;
  title: string;
  composer: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('music_pieces');

    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid query parameter' });
    }

    const searchRegex = new RegExp(query, 'i'); // Case-insensitive regex for partial matching

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
          $match: {
            $or: [
              { title: searchRegex }, // Match title
              { 'composerDetails.composer_full_name': searchRegex }, // Match full composer name
              { 'composerDetails.composer_last_name': searchRegex }, // Match last composer name
            ],
          },
        },
        {
          $project: {
            id: 1,
            title: 1,
            composer: '$composerDetails.composer_full_name',
            composer_last_name: '$composerDetails.composer_last_name',
            level: 1,
            instrumentation: 1,
          },
        },
        {
          $sort: {
            title: 1, // Sort results alphabetically by title
          },
        },
      ])
      .toArray();

    res.status(200).json(musicPieces);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
}
