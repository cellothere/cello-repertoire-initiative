import { publicJsonHandler } from '@/lib/api';
import { listComposers } from '@/lib/repertoire';

export default publicJsonHandler('composers', listComposers);
