import { publicJsonHandler } from '@/lib/api';
import { listLiterature } from '@/lib/repertoire';

export default publicJsonHandler('literature', listLiterature);
