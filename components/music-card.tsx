import { memo } from 'react';
import Link from 'next/link';
import FadeImage from './fade-image';
import SaveButton from './save-button';
import LevelBadge from './level-badge';
import { pieceHref } from '@/lib/instruments';
import { pieceIllustration as imageFor } from '@/lib/piece-image';
import type { PieceSummary } from '@/lib/types';
import { formatComposers, parseYear } from '@/utils/musicUtils';

type MusicCardProps = Pick<PieceSummary, 'id' | 'instrument' | 'title' | 'composers' | 'level' | 'instrumentation' | 'composition_year' | 'cover_image'> & {
  /** Load the image eagerly; use for the first few cards above the fold. */
  priority?: boolean;
  /** Position in the grid, for the ripple as cards arrive. */
  index?: number;
};

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

  // The wrapper fades the card up as it scrolls into view; the card's own .reveal plays when the page loads.
  return (
    <div className="scroll-reveal h-full">
      <article
        style={{ '--i': index } as React.CSSProperties}
        className="reveal spotlight group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 ease-out-expo focus-within:ring-2 focus-within:ring-teal-500 active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {/* Book covers and the level illustrations are both portrait, so each is shown whole, like a book on a soft
              backdrop, rather than cropped to the frame. */}
          <FadeImage
            src={cover_image || imageFor(level, instrumentation)}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 180px, (min-width: 1024px) 22vw, (min-width: 640px) 25vw, 40vw"
            className="object-contain p-3 drop-shadow-md group-hover:scale-105"
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
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{formatComposers(composers)}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2.5 sm:pt-3">
            <LevelBadge level={level} />
            {year && <span className="text-xs text-gray-500">{year}</span>}
          </div>
        </div>
  
        <SaveButton pieceId={id} instrument={instrument} title={title} className="absolute right-1.5 top-1.5 z-10 sm:right-2 sm:top-2" />
      </article>
    </div>
  );
};

export default memo(MusicCard);
