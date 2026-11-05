import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';
import { DATABASE_PAGES } from '@/lib/collections';
import { databaseComposers } from '@/lib/database-names';
import { featuredDatabases } from '@/lib/featured-databases';
import { Chip, clip, logoPicture, OgFrame, publicPicture, sendOgImage } from '@/lib/og';
import { listComposers, listPieces } from '@/lib/repertoire';
import siteImage from '../site';

/** GET /api/og/database/women: the link-preview image for a Featured Database page. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET', 'HEAD'])) return;
  const database = featuredDatabases(null).find((d) => d.slug === req.query.slug);
  if (!database) return siteImage(req, res);

  try {
    const [pieces, composers, logo, picture] = await Promise.all([
      listPieces('cello'),
      listComposers(),
      logoPicture(),
      publicPicture('/assets/cellist2.png', 330, 470),
    ]);
    const count = pieces.filter(database.matches).length;
    const people = databaseComposers(database, pieces, composers).length;
    const page = DATABASE_PAGES[database.slug];

    await sendOgImage(
      res,
      <OgFrame logo={logo} picture={picture}>
        <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#5eead4', textTransform: 'uppercase' }}>
          Featured database
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 14,
            fontSize: page.title.length <= 34 ? 58 : 48,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -1,
          }}
        >
          {page.title}
        </div>
        <div style={{ display: 'flex', marginTop: 16, fontSize: 26, lineHeight: 1.35, color: '#d1d5db' }}>{clip(page.intro.split(/(?<=\.)\s/)[0], 120)}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 14 }}>
          <Chip strong>{`${count.toLocaleString()} pieces`}</Chip>
          {people > 0 && <Chip>{`${people.toLocaleString()} composers`}</Chip>}
        </div>
      </OgFrame>
    );
  } catch (error) {
    console.error('Database share image failed:', error);
    return siteImage(req, res);
  }
}
