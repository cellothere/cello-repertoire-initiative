import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';
import { isInstrument, INSTRUMENT_LABELS } from '@/lib/instruments';
import { Chip, clip, logoPicture, OgFrame, publicPicture, sendOgImage } from '@/lib/og';
import { pieceIllustration } from '@/lib/piece-image';
import { getPieceDetail } from '@/lib/repertoire';
import { instrumentationLabel } from '@/lib/share';
import { joinNames, parseYear } from '@/utils/musicUtils';
import siteImage from '../site';

/** Larger type for short titles; long ones step down and are cut to three lines' worth. */
function titleStyle(title: string) {
  if (title.length <= 28) return { fontSize: 70, text: title };
  if (title.length <= 55) return { fontSize: 58, text: title };
  if (title.length <= 90) return { fontSize: 46, text: title };
  return { fontSize: 42, text: clip(title, 120) };
}

/** GET /api/og/cello/1764: the branded link-preview image for a piece page (see lib/share.ts for its URL). */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['GET', 'HEAD'])) return;
  const id = Number(req.query.id);
  const instrument = req.query.instrument;
  const piece = isInstrument(instrument) && Number.isInteger(id) && id >= 0 ? await getPieceDetail(instrument, id).catch(() => null) : null;
  if (!piece) return siteImage(req, res);

  try {
    const [logo, picture] = await Promise.all([
      logoPicture(),
      publicPicture(piece.cover_image || pieceIllustration(piece.level, piece.instrumentation), 330, 470),
    ]);
    const title = titleStyle(piece.title);
    const composers = joinNames(piece.composers.map((c) => c.full_name));
    const arrangers = piece.arrangers.filter((name) => !/\s(by|the)\s|\.$/.test(name));
    const year = parseYear(piece.composition_year);

    await sendOgImage(
      res,
      <OgFrame logo={logo} picture={picture}>
        <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#5eead4', textTransform: 'uppercase' }}>
          {`${INSTRUMENT_LABELS[piece.instrument]} music`}
        </div>
        <div style={{ display: 'flex', marginTop: 14, fontSize: title.fontSize, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1 }}>
          {title.text}
        </div>
        {composers && (
          <div style={{ display: 'flex', marginTop: 18, fontSize: 32, color: '#d1d5db' }}>
            {clip(`by ${composers}${arrangers.length ? `, arr. ${joinNames(arrangers)}` : ''}`, 70)}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 18 }}>
          {piece.level !== 'Unknown' && <Chip strong>{piece.level}</Chip>}
          {piece.instrumentation.length > 0 && <Chip>{clip(instrumentationLabel(piece.instrumentation), 34)}</Chip>}
          {year ? <Chip>{String(year)}</Chip> : null}
        </div>
      </OgFrame>
    );
  } catch (error) {
    console.error('Piece share image failed:', error);
    return siteImage(req, res);
  }
}
