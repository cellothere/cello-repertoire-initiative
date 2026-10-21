import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SaveButton from './save-button';
import LevelBadge from './level-badge';
import { pieceHref } from '@/lib/instruments';
import type { PieceSummary } from '@/lib/types';
import { formatComposerName, parseYear } from '@/utils/musicUtils';

type MusicCardProps = Pick<
  PieceSummary,
  'id' | 'instrument' | 'title' | 'composer_first_name' | 'composer_last_name' | 'level' | 'instrumentation' | 'composition_year'
> & {
  /** Load the image eagerly; use for the first few cards above the fold. */
  priority?: boolean;
};

/** Pick an illustration matching the piece's level and instrumentation. */
function imageFor(level: string, instrumentation: string[]): string {
  const parts = instrumentation.map((part) => part.toLowerCase());
  const has = (name: string) => parts.includes(name);
  const allCello = parts.length > 0 && parts.every((part) => part === 'cello' || part === 'cello solo');
  const isSolo = parts.length === 1 && allCello;
  const isDuet = parts.length === 2 && allCello;
  const isEnsemble = has('cello ensemble') || (parts.length >= 3 && allCello);
  const withPiano = has('cello') && has('piano');
  const withOrchestra = has('cello') && has('orchestra');

  if (has('cello') && has('saxophone')) return '/assets/cello_saxophone.png';
  if (isEnsemble) return '/assets/various_cello_ensemble.png';

  switch (level.toLowerCase()) {
    case 'professional':
      if (isDuet) return '/assets/professional_duet.png';
      if (isSolo) return '/assets/professional_cello_solo.png';
      if (withOrchestra) return '/assets/professional_cello_orchestra.png';
      return '/assets/professional_cello_piano.png';
    case 'beginner':
      if (withPiano) return '/assets/beginner_cello_and_piano.png';
      if (isDuet) return '/assets/beginner_duet.png';
      if (isSolo) return '/assets/beginner_solo.png';
      break;
    case 'late beginner':
      if (isDuet) return '/assets/late_beginner_duet.png';
      if (withPiano) return '/assets/late_beginner_cello_piano.png';
      if (isSolo) return '/assets/late_beginner_solo.png';
      break;
    case 'early intermediate':
      if (isDuet) return '/assets/early_intermediate_duet.png';
      if (isSolo) return '/assets/early_intermediate_solo.png';
      if (withPiano) return '/assets/early_intermediate_cello_piano.png';
      break;
    case 'intermediate':
      if (isDuet) return '/assets/intermediate_duet.png';
      if (withPiano) return '/assets/intermediate_cello_piano.png';
      if (isSolo) return '/assets/intermediate_solo.png';
      break;
    case 'late intermediate':
      if (isSolo) return '/assets/late_intermediate_solo.png';
      if (withPiano) return '/assets/late_intermediate_cello_piano.png';
      break;
    case 'early advanced':
      if (isDuet) return '/assets/early_advanced_duet.png';
      if (withPiano) return '/assets/early_advanced_cello_piano.png';
      return '/assets/early_advanced_cello.png';
    case 'advanced':
      if (withPiano) return '/assets/advanced_cello_piano.png';
      if (isDuet) return '/assets/advanced_duet.png';
      return '/assets/advanced_cello_solo.png';
    case 'early beginner':
      if (isSolo) return '/assets/early_beginner_cello_solo.png';
      break;
    case 'various':
      if (withPiano) return '/assets/various_cello_piano.png';
      if (isSolo) return '/assets/various_cello.png';
      break;
  }

  if (isDuet) return '/assets/early_beginner_duet.png';
  if (withPiano) return '/assets/early_beginner_cello_piano.png';
  return '/assets/default_cello_and_piano.png';
}

const MusicCard: React.FC<MusicCardProps> = ({
  id,
  instrument,
  title,
  composer_first_name,
  composer_last_name,
  level,
  instrumentation,
  composition_year,
  priority = false,
}) => {
  const year = parseYear(composition_year);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 focus-within:ring-2 focus-within:ring-teal-500 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg">
      {/* A shorter illustration on phones, so more of each card is the title and level. */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100 sm:aspect-[4/3]">
        <Image
          src={imageFor(level, instrumentation)}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 240px, (min-width: 1024px) 30vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-3 break-words text-[0.9375rem] font-semibold leading-snug text-gray-900 sm:text-base">
          {/* The link's ::after covers the whole card, making it all clickable. Prefetch on hover
              only, rather than fetching data for every card that scrolls into view. */}
          <Link
            href={pieceHref(instrument, id)}
            prefetch={false}
            className="after:absolute after:inset-0 focus:outline-none"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-sm text-gray-600">
          {formatComposerName(composer_first_name, composer_last_name)}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2.5 sm:pt-3">
          <LevelBadge level={level} />
          {year && <span className="text-xs text-gray-500">{year}</span>}
        </div>
      </div>

      <SaveButton pieceId={id} instrument={instrument} title={title} className="absolute right-1.5 top-1.5 z-10 sm:right-2 sm:top-2" />
    </article>
  );
};

export default memo(MusicCard);
