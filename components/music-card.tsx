import { memo } from 'react';
import Link from 'next/link';
import FadeImage from './fade-image';
import SaveButton from './save-button';
import LevelBadge, { levelStripClass } from './level-badge';
import { pieceHref } from '@/lib/instruments';
import type { PieceSummary } from '@/lib/types';
import { formatComposers, parseYear } from '@/utils/musicUtils';

type MusicCardProps = Pick<PieceSummary, 'id' | 'instrument' | 'title' | 'composers' | 'level' | 'instrumentation' | 'composition_year' | 'cover_image'> & {
  /** Load the image eagerly; use for the first few cards above the fold. */
  priority?: boolean;
  /** Position in the grid, for the ripple as cards arrive. */
  index?: number;
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
  composers,
  level,
  instrumentation,
  composition_year,
  cover_image,
  priority = false,
  index = 0,
}) => {
  const year = parseYear(composition_year);

  return (
    <article
      style={{ '--i': index } as React.CSSProperties}
      className="reveal group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 ease-out-expo focus-within:ring-2 focus-within:ring-teal-500 active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Phones get a thin strip in the level's colour instead of the illustration, which is the
          same drawing on most cards and took half of each one; about twice as many pieces fit per screen. */}
      <div className={`h-1.5 sm:hidden ${levelStripClass(level)}`} aria-hidden="true" />
      <div className="relative hidden aspect-[4/3] overflow-hidden bg-gray-100 sm:block">
        {cover_image ? (
          // A portrait book cover, shown whole on a soft backdrop rather than cropped to the frame.
          <FadeImage
            src={cover_image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 180px, (min-width: 1024px) 22vw, (min-width: 640px) 25vw, 40vw"
            className="object-contain p-3 drop-shadow-md group-hover:scale-105"
          />
        ) : (
          <FadeImage
            src={imageFor(level, instrumentation)}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 240px, (min-width: 1024px) 30vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-3 break-words pr-7 text-[0.9375rem] font-semibold leading-snug text-gray-900 sm:pr-0 sm:text-base">
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
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{formatComposers(composers)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2.5 sm:pt-3">
          <LevelBadge level={level} />
          {year && <span className="text-xs text-gray-500">{year}</span>}
        </div>
      </div>

      <SaveButton pieceId={id} instrument={instrument} title={title} className="absolute right-1 top-2.5 z-10 max-sm:bg-transparent max-sm:shadow-none sm:right-2 sm:top-2" />
    </article>
  );
};

export default memo(MusicCard);
