import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';
import { LEVEL_SUMMARIES } from '@/lib/collections';
import { Chip, clip, logoPicture, OgFrame, publicPicture, sendOgImage } from '@/lib/og';
import { pieceIllustration } from '@/lib/piece-image';
import { listPieces } from '@/lib/repertoire';
import { levelFromSlug } from '@/lib/slugs';
import { baseLevel } from '@/utils/musicUtils';
import siteImage from '../site';

/** GET /api/og/level/early-beginner: the link-preview image for a level page. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET', 'HEAD'])) return;
  const level = levelFromSlug(typeof req.query.slug === 'string' ? req.query.slug : '');
  if (!level) return siteImage(req, res);

  try {
    const [pieces, logo, picture] = await Promise.all([
      listPieces('cello'),
      logoPicture(),
      publicPicture(pieceIllustration(level, ['Cello']), 330, 470),
    ]);
    const count = pieces.filter((piece) => baseLevel(piece.level) === level).length;

    await sendOgImage(
      res,
      <OgFrame logo={logo} picture={picture}>
        <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#5eead4', textTransform: 'uppercase' }}>
          Cello music by level
        </div>
        <div style={{ display: 'flex', marginTop: 14, fontSize: 60, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1 }}>
          {`${level} Cello Music`}
        </div>
        <div style={{ display: 'flex', marginTop: 16, fontSize: 26, lineHeight: 1.35, color: '#d1d5db' }}>
          {clip(LEVEL_SUMMARIES[level] ?? '', 120)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 14 }}>
          <Chip strong>{`${count.toLocaleString()} pieces`}</Chip>
        </div>
      </OgFrame>
    );
  } catch (error) {
    console.error('Level share image failed:', error);
    return siteImage(req, res);
  }
}
