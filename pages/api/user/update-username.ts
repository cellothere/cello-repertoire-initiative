import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);
    const { username } = req.body;

    // Validation
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Username validation (3-20 chars, alphanumeric + underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      });
    }

    const client = await clientPromise;
    const db = client.db('repertoire');
    const usersCollection = db.collection('users');

    // Check if username is already taken (by another user)
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser && existingUser.id !== user.id) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Update username
    await usersCollection.updateOne(
      { id: user.id },
      {
        $set: {
          username,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      username
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Update username error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
