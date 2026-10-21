import PieceDetailPage from '@/components/piece-detail';
import { getPieceStaticPaths, makeGetPieceStaticProps } from '@/lib/piece-static';

export const getStaticPaths = getPieceStaticPaths;
export const getStaticProps = makeGetPieceStaticProps('violin');

export default PieceDetailPage;
