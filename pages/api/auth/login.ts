import type { NextApiRequest, NextApiResponse } from 'next';
import { comparePassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';
import { allowMethods, setAuthCookie } from '@/lib/api';
import { getUsersCollection } from '@/lib/auth-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // The token only lives in an httpOnly cookie; it is never exposed to client JS.
    setAuthCookie(res, generateToken(user.id, user.email));

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
