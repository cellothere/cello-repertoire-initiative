import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner, FaChevronRight } from 'react-icons/fa';

interface MusicCardProps {
  id: number;
  instrument: string;
  title: string;
  composer_first_name: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
}

// Helper function moved outside component for better performance
const getFormattedComposer = (firstName: string, lastName: string) => {
  if (['Other', 'Traditional'].includes(lastName)) return lastName;
  if (['Other', 'Traditional'].includes(firstName)) return firstName;
  return `${lastName}, ${firstName}`.trim();
};

const MusicCard: React.FC<MusicCardProps> = ({
  id,
  instrument,
  title,
  composer_first_name,
  composer_last_name,
  level,
  instrumentation,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // build slug from instrument prop (e.g. "Cello & Piano" → "cello-&-piano")
  const instrumentSlug = useMemo(
    () => instrument.toLowerCase().replace(/\s+/g, '-'),
    [instrument]
  );

  // dynamic href based on instrument
  const pieceHref = useMemo(
    () => `/${instrumentSlug}-piece/${id}`,
    [instrumentSlug, id]
  );

  // dynamic text size for title
  const titleClass = useMemo(() => {
    if (title.length > 40) return 'text-sm';
    if (title.length > 25) return 'text-md';
    return 'text-lg';
  }, [title]);

  // lowercase arrays for comparisons
  const lowerInstrumentation = useMemo(
    () => instrumentation.map((inst) => inst.toLowerCase()),
    [instrumentation]
  );
  const lowerLevel = useMemo(() => level.toLowerCase(), [level]);

  // instrumentation flags - memoized for performance
  const instrumentationFlags = useMemo(() => {
    const isOther = lowerInstrumentation.includes('other');
    const isCelloSaxophone =
      lowerInstrumentation.includes('cello') && lowerInstrumentation.includes('saxophone');
    const isCelloAndPiano =
      lowerInstrumentation.includes('cello') && lowerInstrumentation.includes('piano');
    const isCelloSolo = lowerInstrumentation.length === 1 && lowerInstrumentation.includes('cello');
    const isCelloDuet =
      lowerInstrumentation.length === 2 && lowerInstrumentation.every((inst) => inst === 'cello');
    const isCelloWithOrchestra =
      lowerInstrumentation.includes('cello') && lowerInstrumentation.includes('orchestra');

    return { isOther, isCelloSaxophone, isCelloAndPiano, isCelloSolo, isCelloDuet, isCelloWithOrchestra };
  }, [lowerInstrumentation]);

  // choose image based on level & instrumentation - optimized to useMemo
  const imageSrc = useMemo(() => {
    const { isOther, isCelloSaxophone, isCelloAndPiano, isCelloSolo, isCelloDuet, isCelloWithOrchestra } = instrumentationFlags;

    if (isOther) return '/assets/Other.png';
    if (isCelloSaxophone) return '/assets/cello_saxophone.png';

    switch (lowerLevel) {
      case 'professional':
        if (isCelloDuet) return '/assets/professional_duet.png';
        if (isCelloSolo) return '/assets/professional_cello_solo.png';
        if (isCelloWithOrchestra) return '/assets/professional_cello_orchestra.png';
        return '/assets/professional_cello_piano.png';

      case 'beginner':
        if (isCelloAndPiano) return '/assets/beginner_cello_and_piano.png';
        if (isCelloDuet) return '/assets/beginner_duet.png';
        if (isCelloSolo) return '/assets/beginner_solo.png';
        break;

      case 'late beginner':
        if (isCelloDuet) return '/assets/late_beginner_duet.png';
        if (isCelloAndPiano) return '/assets/late_beginner_cello_piano.png';
        if (isCelloSolo) return '/assets/late_beginner_solo.png';
        break;

      case 'early intermediate':
        if (isCelloDuet) return '/assets/early_intermediate_duet.png';
        if (isCelloSolo) return '/assets/early_intermediate_solo.png';
        if (isCelloAndPiano) return '/assets/early_intermediate_cello_piano.png';
        break;

      case 'intermediate':
        if (isCelloDuet) return '/assets/intermediate_duet.png';
        if (isCelloAndPiano) return '/assets/intermediate_cello_piano.png';
        if (isCelloSolo) return '/assets/intermediate_solo.png';
        break;

      case 'late intermediate':
        if (isCelloSolo) return '/assets/late_intermediate_solo.png';
        if (isCelloAndPiano) return '/assets/late_intermediate_cello_piano.png';
        break;

      case 'early advanced':
        if (isCelloDuet) return '/assets/early_advanced_duet.png';
        if (isCelloAndPiano) return '/assets/early_advanced_cello_piano.png';
        return '/assets/early_advanced_cello.png';

      case 'advanced':
        if (isCelloAndPiano) return '/assets/advanced_cello_piano.png';
        if (isCelloDuet) return '/assets/advanced_duet.png';
        return '/assets/advanced_cello_solo.png';

      case 'early beginner':
        if (isCelloSolo) return '/assets/early_beginner_cello_solo.png';
        break;

      case 'various':
        if (isCelloAndPiano) return '/assets/various_cello_piano.png';
        if (isCelloSolo) return '/assets/various_cello.png';
        break;
    }

    // fallback defaults
    if (isCelloDuet) return '/assets/early_beginner_duet.png';
    if (isCelloAndPiano) return '/assets/early_beginner_cello_piano.png';
    return '/assets/default_cello_and_piano.png';
  }, [lowerLevel, instrumentationFlags]);

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
      <Link href={pieceHref} onClick={() => setIsLoading(true)} className="focus:outline-none group">
        <div className="flex flex-col h-full">
          {/* Image */}
          <div className="relative w-full h-40 mb-4 overflow-hidden rounded-lg">
            <Image
              src={imageSrc}
              alt={`${instrument} piece`}
              fill
              style={{ objectFit: 'contain' }}
              className="bg-white"
            />
          </div>

          {/* Title & Composer */}
          <div className="flex-grow flex flex-col space-y-1">
            <h2
              className={`font-bold text-gray-900 ${titleClass} line-clamp-3 group-hover:underline`}
              style={{
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                lineHeight: '1.3',
              }}
            >
              {title}
            </h2>
            <p className="text-sm text-gray-600">
              by{' '}
              <span className="font-medium text-gray-700">
                {getFormattedComposer(composer_first_name, composer_last_name)}
              </span>
            </p>
          </div>

          {/* Level */}
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-md whitespace-nowrap">
              {level}
            </span>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-200 my-4" />

          {/* See More Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsLoading(true)}
              className="bg-gradient-to-r from-black to-gray-800 text-white w-full max-w-xs py-2 px-4 rounded-lg text-sm font-medium hover:from-gray-800 hover:to-gray-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  See more
                  <FaChevronRight className="text-xs" />
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MusicCard;
