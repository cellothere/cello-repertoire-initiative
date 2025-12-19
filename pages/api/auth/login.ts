import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { comparePassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const client = await clientPromise;
    const db = client.db('repertoire');
    const usersCollection = db.collection('users');

    // Find user by email (case-insensitive)
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    // Set httpOnly cookie
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}`
    );

    // Return user data (without password hash)
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token // Also return token for client-side storage if needed
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
