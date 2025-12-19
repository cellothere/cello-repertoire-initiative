import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUser } from '@/lib/auth-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to get authenticated user (returns null if not authenticated)
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(200).json({ user: null });
    }

    // Return user data (without password hash)
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        savedPieces: user.savedPieces
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
