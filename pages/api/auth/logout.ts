import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods, setAuthCookie } from '@/lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  setAuthCookie(res, null);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
