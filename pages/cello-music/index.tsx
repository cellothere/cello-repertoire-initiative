import type { NextPage } from 'next';
import RepertoireBrowser from '@/components/repertoire-browser';
import ScoreRibbons from '@/components/score-ribbons';

const CelloMusic: NextPage = () => (
  <RepertoireBrowser instrument="cello" apiPath="/api/celloMusic" path="/cello-music" headerBackground={<ScoreRibbons />} />
);

export default CelloMusic;
