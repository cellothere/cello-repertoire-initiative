import type { GetStaticPaths, GetStaticProps } from 'next';
import type { Instrument } from './instruments';
import type { PieceDetail } from './types';
import { getPieceDetail } from './repertoire';

const REVALIDATE_SECONDS = 60;

export const getPieceStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' });

export function makeGetPieceStaticProps(instrument: Instrument): GetStaticProps<{ piece: PieceDetail }> {
  return async ({ params }) => {
    const id = Number(params?.id);
    if (!Number.isInteger(id) || id < 0) {
      return { notFound: true };
    }

    const piece = await getPieceDetail(instrument, id);
    if (!piece) {
      return { notFound: true, revalidate: REVALIDATE_SECONDS };
    }

    return { props: { piece }, revalidate: REVALIDATE_SECONDS };
  };
}
