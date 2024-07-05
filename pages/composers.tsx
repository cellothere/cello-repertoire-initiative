// pages/api/composers.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../lib/mongodb';

// Define the Composer type
type Composer = {
  composer_name: string;
  composer_bio: string;
  wikipedia_article: string;
};

// Define the GroupedComposers type
type GroupedComposers = {
  _id: string;
  composers: Composer[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('composers');

    const composers = await collection
      .aggregate<GroupedComposers>([
        {
          $sort: {
            composer_name: 1,
          },
        },
        {
          $group: {
            _id: {
              $toLower: { $substrCP: ['$composer_name', 0, 1] },
            },
            composers: {
              $push: {
                composer_name: '$composer_name',
                composer_bio: '$composer_bio',
                wikipedia_article: '$wikipedia_article',
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

    res.status(200).json(composers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch composers' });
  }
}
