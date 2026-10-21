import type { GetStaticPaths, GetStaticProps } from 'next';
import type { Instrument } from './instruments';
import type { PieceDetail } from './types';
import { getPieceDetail } from './repertoire';

const REVALIDATE_SECONDS = 60;

/**
 * Piece pages are rendered on first request and then cached (ISR), so builds never need the
 * database and edits appear within a minute.
 */
export const getPieceStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' });

export function makeGetPieceStaticProps(instrument: Instrument): GetStaticProps<{ piece: PieceDetail }> {
  return async ({ params }) => {
    const id = Number(params?.id);
    if (!Number.isInteger(id) || id < 0) {
      return { notFound: true };
    }

    // Database errors are thrown rather than turned into a 404, so a temporary outage doesn't
    // get cached as "not found"; on revalidation Next keeps serving the last good page.
    const piece = await getPieceDetail(instrument, id);
    if (!piece) {
      return { notFound: true, revalidate: REVALIDATE_SECONDS };
    }

    return { props: { piece }, revalidate: REVALIDATE_SECONDS };
  };
}
