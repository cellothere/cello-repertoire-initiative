import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('repertoire');

    const nationalities = await db.collection('composers')
      .aggregate([
        // Join with cello_pieces
        {
          $lookup: {
            from: "cello_pieces",
            localField: "id",
            foreignField: "composer_id",
            as: "cello_pieces"
          }
        },
        // Join with violin_pieces
        {
          $lookup: {
            from: "violin_pieces",
            localField: "id",
            foreignField: "composer_id",
            as: "violin_pieces"
          }
        },
        // Join with viola_pieces
        {
          $lookup: {
            from: "viola_pieces",
            localField: "id",
            foreignField: "composer_id",
            as: "viola_pieces"
          }
        },
        // Join with bass_pieces
        {
          $lookup: {
            from: "bass_pieces",
            localField: "id",
            foreignField: "composer_id",
            as: "bass_pieces"
          }
        },
        // Only include composers who have pieces in at least one collection
        {
          $match: {
            nationality: { $exists: true, $ne: "" },
            $or: [
              { cello_pieces: { $ne: [] } },
              { violin_pieces: { $ne: [] } },
              { viola_pieces: { $ne: [] } },
              { bass_pieces: { $ne: [] } }
            ]
          }
        },
        // Unwind nationalities in case they are arrays
        { $unwind: "$nationality" },
        // Group by nationality
        {
          $group: {
            _id: "$nationality"
          }
        },
        // Project output
        {
          $project: {
            _id: 0,
            nationality: "$_id"
          }
        },
        // Sort results
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
