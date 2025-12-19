import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Username validation (3-20 chars, alphanumeric + underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' });
    }

    // Password validation (min 8 chars)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const client = await clientPromise;
    const db = client.db('repertoire');
    const usersCollection = db.collection('users');

    // Check if email already exists
    const existingEmail = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if username already exists
    const existingUsername = await usersCollection.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Get next sequential ID
    const countersCollection = db.collection('counters');
    const counterResult = await countersCollection.findOneAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const userId = counterResult?.seq || 1;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      username,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      savedPieces: []
    };

    await usersCollection.insertOne(newUser);

    // Generate JWT
    const token = generateToken(userId, email.toLowerCase());

    // Set httpOnly cookie
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}`
    );

    // Return user data (without password hash)
    return res.status(201).json({
      success: true,
      user: {
        id: userId,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
