import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Let the CDN serve public catalogue data for a few minutes (and stale for a day while it
 * refreshes in the background) so the database isn't hit on every page view.
 */
export function setPublicCache(res: NextApiResponse, maxAgeSeconds = 300) {
  res.setHeader(
    'Cache-Control',
    `public, max-age=60, s-maxage=${maxAgeSeconds}, stale-while-revalidate=86400`
  );
}

export function allowMethods(req: NextApiRequest, res: NextApiResponse, methods: string[]): boolean {
  if (req.method && methods.includes(req.method)) return true;
  res.setHeader('Allow', methods);
  res.status(405).json({ error: 'Method not allowed' });
  return false;
}

/** Wraps a read-only, public catalogue endpoint: GET only, CDN-cached, consistent errors. */
export function publicJsonHandler<T>(label: string, load: (req: NextApiRequest) => Promise<T>) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!allowMethods(req, res, ['GET'])) return;
    try {
      const data = await load(req);
      setPublicCache(res);
      res.status(200).json(data);
    } catch (error) {
      console.error(`Error fetching ${label}:`, error);
      res.status(500).json({ error: `Failed to fetch ${label}` });
    }
  };
}

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, matches the JWT expiry

export function setAuthCookie(res: NextApiResponse, token: string | null) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  const maxAge = token ? AUTH_COOKIE_MAX_AGE : 0;
  res.setHeader(
    'Set-Cookie',
    `token=${token ?? ''}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=${maxAge}`
  );
}

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
export const USERNAME_RULES = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
