import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

// Define the Composer type
type Composer = {
  composer_full_name: string;
  composer_last_name: string;
  composer_first_name: string;
  id: number;
  nationality: string[];
  tags: string[];
  articles: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('composers');

    const composers = await collection
      .aggregate([
        // Match only documents where composer_full_name exists and is non-empty
        {
          $match: {
            composer_full_name: { $exists: true, $ne: null },
          },
        },
        // Sort composers by full name
        {
          $sort: {
            composer_full_name: 1,
          },
        },
        // Group by the first letter of composer_full_name (case-insensitive)
        {
          $group: {
            _id: {
              $toLower: { $substrCP: ['$composer_full_name', 0, 1] },
            },
            composers: {
              $push: {
                composer_full_name: '$composer_full_name',
                composer_last_name: '$lastName',
                composer_first_name: '$firstName',
                id: '$id',
                nationality: '$nationality',
                tags: '$tags',
                articles: '$articles',
              },
            },
            count: { $sum: 1 },
          },
        },
        // Sort groups alphabetically by _id
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .toArray();

    res.status(200).json(composers);
  } catch (error) {
    console.error('Error fetching composers:', error); // Log error for debugging
    res.status(500).json({ error: 'Failed to fetch composers' });
  }
}
