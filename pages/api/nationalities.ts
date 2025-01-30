import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Fetching nationalities with music pieces...");

    const client = await clientPromise;
    const db = client.db('cello_repertoire');

    const nationalities = await db.collection('composers')
      .aggregate([
        // Join with music_pieces collection on composer_id
        {
          $lookup: {
            from: "music_pieces",
            localField: "id",
            foreignField: "composer_id",
            as: "pieces"
          }
        },
        // Only include composers who have at least one music piece
        {
          $match: {
            nationality: { $exists: true, $ne: "" },
            pieces: { $ne: [] } // Ensures composers have pieces
          }
        },
        // Group by distinct nationalities
        {
          $group: {
            _id: "$nationality"
          }
        },
        // Project for cleaner output
        {
          $project: {
            _id: 0,
            nationality: "$_id"
          }
        },
        // Sort alphabetically
        {
          $sort: { nationality: 1 }
        }
      ])
      .toArray();

    res.status(200).json(nationalities);
  } catch (error) {
    console.error('Error fetching nationalities:', error);
    res.status(500).json({ error: 'Failed to fetch nationalities' });
  }
}
