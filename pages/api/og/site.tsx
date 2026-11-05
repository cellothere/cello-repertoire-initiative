import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';
import { Chip, logoPicture, OgFrame, publicPicture, sendOgImage } from '@/lib/og';

/** GET /api/og/site: the branded link-preview image for pages that don't have their own. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET', 'HEAD'])) return;
  try {
    const [logo, picture] = await Promise.all([logoPicture(), publicPicture('/assets/cellist3.png', 330, 470)]);
    await sendOgImage(
      res,
      <OgFrame logo={logo} picture={picture}>
        <div style={{ display: 'flex', fontSize: 54, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>
          Find the right cello music for every student
        </div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 26, lineHeight: 1.4, color: '#d1d5db' }}>
          A free, searchable catalogue of level-appropriate repertoire, featuring under-recognized and
          underrepresented composers.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 14 }}>
          <Chip strong>Cello music</Chip>
          <Chip>Composers</Chip>
          <Chip>Resources</Chip>
        </div>
      </OgFrame>
    );
  } catch (error) {
    console.error('Site share image failed:', error);
    res.status(500).json({ error: 'Failed to draw the image' });
  }
}
