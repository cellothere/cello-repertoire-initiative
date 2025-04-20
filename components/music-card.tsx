import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner } from 'react-icons/fa';

interface MusicCardProps {
  id: number;
  instrument: string;
  title: string;
  composer_first_name: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
}

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

  // format composer name
  const getFormattedComposer = (firstName: string, lastName: string) => {
    if (['Other', 'Traditional'].includes(lastName)) return lastName;
    if (['Other', 'Traditional'].includes(firstName)) return firstName;
    return `${lastName}, ${firstName}`.trim();
  };

  // lowercase arrays for comparisons
  const lowerInstrumentation = useMemo(
    () => instrumentation.map((inst) => inst.toLowerCase()),
    [instrumentation]
  );
  const lowerLevel = useMemo(() => level.toLowerCase(), [level]);

  // instrumentation flags
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

  // choose image based on level & instrumentation
  const getImageSrc = () => {
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
  };

  const imageSrc = useMemo(() => getImageSrc(), [
    lowerLevel,
    lowerInstrumentation,
    isCelloDuet,
    isCelloSolo,
    isCelloAndPiano,
    isCelloWithOrchestra,
    isOther,
    isCelloSaxophone,
  ]);

  return (
    <div className="bg-white shadow-md rounded-sm p-4 hover:scale-105 transition-transform duration-300">
      <Link href={pieceHref} onClick={() => setIsLoading(true)}>
        <div className="flex flex-col h-full">
          {/* Image */}
          <div className="relative w-full h-40 mb-4">
            <Image
              src={imageSrc}
              alt={`${instrument} piece`}
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-md bg-white"
            />
          </div>

          {/* Title & Composer */}
          <div className="flex-grow flex flex-col">
            <h2
              className={`font-semibold text-gray-800 ${titleClass}`}
              style={{
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                lineHeight: '1.2',
              }}
            >
              {title}
            </h2>
            <p className="text-gray-600">
              by{' '}
              <span className="font-medium">
                {getFormattedComposer(composer_first_name, composer_last_name)}
              </span>
            </p>
          </div>

          {/* Level */}
          <div className="mt-5">
            <strong>
              <p className="text-black">{level}</p>
            </strong>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-300 mb-3 mt-1" />

          {/* See More Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsLoading(true)}
              className="bg-black text-white w-[75%] max-w-xs py-1 rounded-full text-center hover:bg-gradient-to-br transition-colors"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline-block" />
              ) : (
                'See more'
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MusicCard;
