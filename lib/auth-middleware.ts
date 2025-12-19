import type { NextApiRequest } from 'next';
import clientPromise from './mongodb';
import { verifyToken } from './jwt';

export interface User {
  _id: any;
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  savedPieces: SavedPiece[];
}

export interface SavedPiece {
  pieceId: number;
  instrument: string;
  savedAt: Date;
}

/**
 * Middleware to require authentication for API routes
 * Verifies JWT token from cookie and returns the authenticated user
 * @param req - Next.js API request object
 * @returns The authenticated user object
 * @throws Error if not authenticated or user not found
 */
export async function requireAuth(req: NextApiRequest): Promise<User> {
  // Extract token from cookie
  const token = req.cookies.token;

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  try {
    // Verify token
    const payload = verifyToken(token);

    // Fetch user from database
    const client = await clientPromise;
    const db = client.db('repertoire');
    const user = await db.collection<User>('users').findOne({ id: payload.userId });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unauthorized: ${error.message}`);
    }
    throw new Error('Unauthorized');
  }
}

/**
 * Helper to get user from request without throwing
 * Returns null if not authenticated
 * @param req - Next.js API request object
 * @returns The authenticated user object or null
 */
export async function getAuthUser(req: NextApiRequest): Promise<User | null> {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}
