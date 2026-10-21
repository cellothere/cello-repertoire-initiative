import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods, USERNAME_PATTERN, USERNAME_RULES } from '@/lib/api';
import { getUsersCollection, isUnauthorized, requireAuth } from '@/lib/auth-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['PATCH'])) return;

  try {
    const user = await requireAuth(req);
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!USERNAME_PATTERN.test(username)) {
      return res.status(400).json({ error: USERNAME_RULES });
    }

    const users = await getUsersCollection();

    const existingUser = await users.findOne({ username }, { projection: { id: 1 } });
    if (existingUser && existingUser.id !== user.id) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    await users.updateOne({ id: user.id }, { $set: { username, updatedAt: new Date() } });

    return res.status(200).json({ success: true, username });
  } catch (error) {
    if (isUnauthorized(error)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Update username error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
