import type { NextPage } from 'next';
import RepertoireBrowser from '@/components/repertoire-browser';

const ViolinMusic: NextPage = () => <RepertoireBrowser instrument="violin" apiPath="/api/violinMusic" path="/violin-music" />;

export default ViolinMusic;
