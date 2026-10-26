import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';

/**
 * The visitor's country, from the header Vercel adds to every request (no IP address is looked up or stored).
 * Used to show which public-domain pieces are free to download where the visitor is. Null when unknown,
 * e.g. in local development.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  const header = req.headers['x-vercel-ip-country'];
  const country = (Array.isArray(header) ? header[0] : header)?.toUpperCase();
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country: country && /^[A-Z]{2}$/.test(country) ? country : null });
}
