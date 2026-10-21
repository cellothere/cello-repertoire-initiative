import type { NextApiRequest } from 'next';
import { getDb } from './mongodb';
import { verifyToken } from './jwt';
import type { Instrument } from './instruments';

export interface SavedPiece {
  pieceId: number;
  instrument: Instrument;
  savedAt: Date;
}

export interface User {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  savedPieces: SavedPiece[];
}

export async function getUsersCollection() {
  return (await getDb()).collection<User>('users');
}

/**
 * Middleware to require authentication for API routes
 * Verifies JWT token from cookie and returns the authenticated user
 * @param req - Next.js API request object
 * @returns The authenticated user object
 * @throws Error if not authenticated or user not found
 */
export async function requireAuth(req: NextApiRequest): Promise<User> {
  const token = req.cookies.token;

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  try {
    const payload = verifyToken(token);
    const user = await (await getUsersCollection()).findOne({ id: payload.userId });

    if (!user) {
      throw new Error('User not found');
    }

    return { ...user, savedPieces: user.savedPieces ?? [] };
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

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof Error && error.message.startsWith('Unauthorized');
