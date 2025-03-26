import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const {
    query: { id },
    method,
  } = req;

  if (method === 'GET') {
    try {
      const client = await clientPromise;
      const collection = client.db('repertoire').collection('cello_pieces');

      const piece = await collection.findOne({ id: parseInt(id as string, 10) });

      if (!piece) {
        return res.status(404).json({ error: 'Piece not found' });
      }

      res.status(200).json(piece);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch piece' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
