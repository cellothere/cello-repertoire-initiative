import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('composers');

    const nationalities = await collection
      .aggregate([
        // Match documents where nationality exists and is non-empty
        {
          $match: {
            nationality: { $exists: true, $ne: "" },
          },
        },
        // Group by distinct nationalities
        {
          $group: {
            _id: '$nationality',
          },
        },
        // Project the nationality field for clarity
        {
          $project: {
            _id: 0,
            nationality: '$_id',
          },
        },
        // Sort nationalities alphabetically (optional)
        {
          $sort: {
            nationality: 1,
          },
        },
      ])
      .toArray();

    res.status(200).json(nationalities);
  } catch (error) {
    console.error('Error fetching nationalities:', error); // Log error for debugging
    res.status(500).json({ error: 'Failed to fetch nationalities' });
  }
}
