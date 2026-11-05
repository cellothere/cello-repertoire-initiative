import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';
import { portraitFor } from '@/lib/composer-portraits';
import { composerDatabaseSlugs } from '@/lib/database-names';
import { featuredDatabases } from '@/lib/featured-databases';
import { Chip, clip, logoPicture, OgFrame, publicPicture, sendOgImage } from '@/lib/og';
import { getComposerPage } from '@/lib/repertoire';
import { LEVEL_ORDER, baseLevel } from '@/utils/musicUtils';
import siteImage from '../site';
import { lifeDates } from '@/lib/slugs';

/** GET /api/og/composer/florence-price: the link-preview image for a composer's page. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET', 'HEAD'])) return;
  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
  const page = slug ? await getComposerPage(slug).catch(() => null) : null;
  if (!page) return siteImage(req, res);

  try {
    const { composer, pieces } = page;
    const name = composer.composer_full_name;
    const portrait = portraitFor(name);
    const [logo, picture] = await Promise.all([
      logoPicture(),
      publicPicture(portrait ? `/assets/portraits/${portrait.slug}.jpg` : '/assets/cellist2.png', 330, 470),
    ]);
    const levels = LEVEL_ORDER.filter((level) => pieces.some((p) => baseLevel(p.level) === level));
    const range = levels.length > 1 ? `${levels[0]} to ${levels[levels.length - 1]}` : (levels[0] ?? '');
    const dates = lifeDates(composer);
    const databases = featuredDatabases(null).filter((d) => composerDatabaseSlugs(composer).includes(d.slug));
    const size = name.length <= 22 ? 68 : name.length <= 40 ? 56 : 44;

    await sendOgImage(
      res,
      <OgFrame logo={logo} picture={picture}>
        <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#5eead4', textTransform: 'uppercase' }}>
          Composer
        </div>
        <div style={{ display: 'flex', marginTop: 14, fontSize: size, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1 }}>
          {clip(name, 70)}
        </div>
        {(dates || composer.nationality.length > 0) && (
          <div style={{ display: 'flex', marginTop: 16, fontSize: 30, color: '#d1d5db' }}>
            {clip([dates, composer.nationality.join(', ')].filter(Boolean).join(' · '), 60)}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 18 }}>
          <Chip strong>{`${pieces.length} cello ${pieces.length === 1 ? 'piece' : 'pieces'}`}</Chip>
          {range && <Chip>{range}</Chip>}
          {databases.slice(0, 1).map((d) => (
            <Chip key={d.slug}>{d.label}</Chip>
          ))}
        </div>
      </OgFrame>
    );
  } catch (error) {
    console.error('Composer share image failed:', error);
    return siteImage(req, res);
  }
}
