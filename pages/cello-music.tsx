import type { NextPage } from 'next';
import RepertoireBrowser from '@/components/repertoire-browser';

const CelloMusic: NextPage = () => <RepertoireBrowser instrument="cello" apiPath="/api/celloMusic" path="/cello-music" />;

export default CelloMusic;
