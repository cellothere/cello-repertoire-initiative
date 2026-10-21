import { publicJsonHandler } from '@/lib/api';
import { listResources } from '@/lib/repertoire';

export default publicJsonHandler('resources', listResources);
