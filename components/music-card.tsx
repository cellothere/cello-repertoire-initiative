import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner } from 'react-icons/fa';

interface MusicCardProps {
  id: number;
  title: string;
  composer_first_name: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
}

const MusicCard: React.FC<MusicCardProps> = ({
  id,
  title,
  composer_first_name,
  composer_last_name,
  level,
  instrumentation,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Dynamically determine the title text size
  const titleClass = useMemo(() => {
    if (title.length > 40) return 'text-sm';
    if (title.length > 25) return 'text-md';
    return 'text-lg';
  }, [title]);

  // Helper function to format the composer's name
  const getFormattedComposer = (firstName: string, lastName: string) => {
    if (['Other', 'Traditional'].includes(lastName)) return lastName;
    if (['Other', 'Traditional'].includes(firstName)) return firstName;
    return `${lastName}, ${firstName}`.trim();
  };

  // Lowercase values for case-insensitive comparisons
  const lowerInstrumentation = useMemo(
    () => instrumentation.map((inst) => inst.toLowerCase()),
    [instrumentation]
  );
  const lowerLevel = useMemo(() => level.toLowerCase(), [level]);

  // Derived booleans for instrumentation types
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

  // Helper function to determine the image source
  const getImageSrc = () => {
    if (isOther) return '/assets/Other.png';
    if (isCelloSaxophone) return '/assets/cello_saxophone.png';

    if (lowerLevel === 'professional') {
      if (isCelloDuet) return '/assets/professional_duet.png';
      if (isCelloSolo) return '/assets/professional_cello_solo.png';
      if (isCelloWithOrchestra) return '/assets/professional_cello_orchestra.png';
      return '/assets/professional_cello_piano.png';
    }
    if (lowerLevel === 'beginner') {
      if (isCelloAndPiano) return '/assets/beginner_cello_and_piano.png';
      if (isCelloDuet) return '/assets/beginner_duet.png';
      if (isCelloSolo) return '/assets/beginner_solo.png';
    }
    if (lowerLevel === 'late beginner') {
      if (isCelloDuet) return '/assets/late_beginner_duet.png';
      if (isCelloAndPiano) return '/assets/late_beginner_cello_piano.png';
      if (isCelloSolo) return '/assets/late_beginner_solo.png';
    }
    if (lowerLevel === 'intermediate') {
      if (isCelloDuet) return '/assets/intermediate_duet.png';
      if (isCelloAndPiano) return '/assets/intermediate_cello_piano.png';
      if (isCelloSolo) return '/assets/intermediate_solo.png';
    }
    if (lowerLevel === 'late intermediate') {
      if (isCelloSolo) return '/assets/late_intermediate_solo.png';
      if (isCelloAndPiano) return '/assets/late_intermediate_cello_piano.png';
    }
    if (lowerLevel === 'early advanced') {
      if (isCelloDuet) return '/assets/early_advanced_duet.png';
      if (isCelloAndPiano) return '/assets/early_advanced_cello_piano.png';
      return '/assets/early_advanced_cello.png';
    }
    if (lowerLevel === 'advanced') {
      if (isCelloAndPiano) return '/assets/advanced_cello_piano.png';
      if (isCelloDuet) return '/assets/advanced_duet.png';
      return '/assets/advanced_cello_solo.png';
    }
    if (lowerLevel === 'early beginner' && isCelloSolo) {
      return '/assets/early_beginner_cello_solo.png';
    }
    if (lowerLevel === 'various') {
      if (isCelloAndPiano) return '/assets/various_cello_piano.png';
      if (isCelloSolo) return '/assets/various_cello.png';
    }
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
      <Link href={`/cello-piece/${id}`} onClick={() => setIsLoading(true)}>
        <div className="flex flex-col h-full">
          {/* Image Section */}
          <div className="relative w-full h-40 mb-4">
            <Image
              src={imageSrc}
              alt="Cellist"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-md bg-white"
            />
          </div>
          {/* Content */}
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
          {/* Centered Button */}
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
