import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUser } from '@/lib/auth-middleware';
import { allowMethods } from '@/lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET'])) return;

  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        savedPieces: user.savedPieces,
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
