import { publicJsonHandler } from '@/lib/api';
import { listPieces } from '@/lib/repertoire';

export default publicJsonHandler('music pieces', () => listPieces('violin'));
