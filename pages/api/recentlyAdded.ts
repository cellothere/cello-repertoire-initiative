import { publicJsonHandler } from '@/lib/api';
import { listRecentlyAdded } from '@/lib/repertoire';

export default publicJsonHandler('recently added music pieces', () => listRecentlyAdded());
