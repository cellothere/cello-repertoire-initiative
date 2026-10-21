import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';
import { isUnauthorized, requireAuth } from '@/lib/auth-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const user = await requireAuth(req);

    return res.status(200).json({
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      savedPiecesCount: user.savedPieces.length,
    });
  } catch (error) {
    if (isUnauthorized(error)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
