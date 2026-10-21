import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/mongodb';
import { hashPassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';
import { allowMethods, setAuthCookie, USERNAME_PATTERN, USERNAME_RULES } from '@/lib/api';
import { getUsersCollection } from '@/lib/auth-middleware';

interface Counter {
  _id: string;
  seq: number;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email: rawEmail, username: rawUsername, password } = req.body ?? {};

    if (typeof rawEmail !== 'string' || typeof rawUsername !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    const email = rawEmail.trim().toLowerCase();
    const username = rawUsername.trim();

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!USERNAME_PATTERN.test(username)) {
      return res.status(400).json({ error: USERNAME_RULES });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const users = await getUsersCollection();

    if (await users.findOne({ email }, { projection: { _id: 1 } })) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (await users.findOne({ username }, { projection: { _id: 1 } })) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const counter = await (await getDb())
      .collection<Counter>('counters')
      .findOneAndUpdate({ _id: 'userId' }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true });
    const userId = counter?.seq || 1;

    const now = new Date();
    await users.insertOne({
      id: userId,
      email,
      username,
      passwordHash: await hashPassword(password),
      createdAt: now,
      updatedAt: now,
      savedPieces: [],
    });

    setAuthCookie(res, generateToken(userId, email));

    return res.status(201).json({
      success: true,
      user: { id: userId, email, username },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
