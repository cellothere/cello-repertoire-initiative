import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

// Define the Resource type
type Resource = {
  _id: number;
  title: string;
  description: string;
  url: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const collection = client.db('cello_repertoire').collection('Resources');

    // Fetch all non-disabled resources sorted alphabetically by title
    const resources = await collection
      .find({ disabled: false })
      .sort({ title: 1 }) // Sort by title in ascending order
      .toArray();

    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
}
