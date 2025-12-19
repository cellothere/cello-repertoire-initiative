import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);

    // Return user profile (without password hash)
    return res.status(200).json({
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      savedPiecesCount: user.savedPieces.length
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
