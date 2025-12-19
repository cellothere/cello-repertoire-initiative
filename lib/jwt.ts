import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
  userId: number;
  email: string;
}

/**
 * Generate a JWT token for a user
 * @param userId - The user's ID
 * @param email - The user's email
 * @returns The signed JWT token
 */
export function generateToken(userId: number, email: string): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload: TokenPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
