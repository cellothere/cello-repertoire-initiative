import { publicJsonHandler } from '@/lib/api';
import { getTechniqueKeywords } from '@/lib/technique-keywords';

/** GET: the technique-focus chip names, in list order (see lib/technique-keywords.ts). */
export default publicJsonHandler('technique keywords', () => getTechniqueKeywords());
