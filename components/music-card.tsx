import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CiHeart } from 'react-icons/ci';
import { FaInfoCircle, FaSpinner } from 'react-icons/fa';

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
  // Local state for loading
  const [isLoading, setIsLoading] = useState(false);

  // Dynamically determine the text size
  const titleClass =
    title.length > 40 ? 'text-sm' : title.length > 25 ? 'text-md' : 'text-lg';

  // Function to format the composer's name
  const getFormattedComposer = (firstName: string, lastName: string) => {
    if (lastName === 'Other' || lastName === 'Traditional') return lastName;
    if (firstName === 'Other' || firstName === 'Traditional') return firstName;
    return `${lastName}, ${firstName}`.trim();
  };

  // Convert instrumentation and level to lowercase for case-insensitive comparison
  const lowerInstrumentation = instrumentation.map((inst) => inst.toLowerCase());
  const lowerLevel = level.toLowerCase();

  // Determine the instrumentation type
  const isOther = lowerInstrumentation.includes('other');
  const isCelloAndPiano =
    lowerInstrumentation.includes('cello') && lowerInstrumentation.includes('piano');
  const isCelloSolo = lowerInstrumentation.length === 1 && lowerInstrumentation.includes('cello');
  const isCelloDuet =
    lowerInstrumentation.length === 2 && lowerInstrumentation.every((inst) => inst === 'cello');
  const isCelloWithOrchestra =
    lowerInstrumentation.includes('cello') && lowerInstrumentation.includes('orchestra');

  // Determine the level
  const isAdvanced = lowerLevel === 'early advanced' || lowerLevel === 'advanced';
  const isBeginner = lowerLevel === 'beginner';
  const isLateBeginner = lowerLevel === 'late beginner';
  const isProfessional = lowerLevel === 'professional';
  const isIntermediate = lowerLevel === 'intermediate';
  const isLateIntermediate = lowerLevel === 'late intermediate';

  // Select the image based on conditions
  const imageSrc = isOther
    ? '/assets/Other.png'
    : isProfessional && isCelloDuet
    ? '/assets/professional_duet.png'
    : isProfessional && isCelloSolo
    ? '/assets/professional_cello_solo.png'
    : isProfessional && isCelloWithOrchestra
    ? '/assets/professional_cello_orchestra.png'
    : isProfessional
    ? '/assets/professional_cello_piano.png'
    : isBeginner && isCelloAndPiano
    ? '/assets/beginner_cello_and_piano.png'
    : isBeginner && isCelloDuet
    ? '/assets/beginner_duet.png'
    : isLateBeginner && isCelloDuet
    ? '/assets/late_beginner_duet.png'
    : isIntermediate && isCelloDuet
    ? '/assets/intermediate_duet.png'
    : isLateIntermediate && isCelloSolo
    ? '/assets/late_intermediate_solo.png'
    : isLateIntermediate && isCelloAndPiano
    ? '/assets/late_intermediate_cello_piano.png'
    : isCelloDuet
    ? '/assets/early_beginner_duet.png'
    : isIntermediate && isCelloAndPiano
    ? '/assets/intermediate_cello_piano.png'
    : isIntermediate && isCelloSolo
    ? '/assets/intermediate_solo.png'
    : isAdvanced && isCelloAndPiano
    ? '/assets/advanced_cello_piano.png'
    : isAdvanced
    ? '/assets/advanced_cello_solo.png'
    : isLateBeginner && isCelloAndPiano
    ? '/assets/late_beginner_cello_piano.png'
    : isLateBeginner && isCelloSolo
    ? '/assets/late_beginner_solo.png'
    : isBeginner && isCelloSolo
    ? '/assets/beginner_solo.png'
    : lowerLevel === 'early beginner' && isCelloSolo
    ? '/assets/early_beginner_cello_solo.png'
    : isCelloAndPiano
    ? '/assets/early_beginner_cello_piano.png'
    : '/assets/default_cello_and_piano.png'; // Default fallback

  return (
    <div className="bg-white shadow-md rounded-sm p-4 hover:scale-105 transition-transform duration-300">
      <Link href={`/piece/${id.toString()}`} onClick={() => setIsLoading(true)}>
        {/* Attach the onClick handler to the button so that when clicked, 
            we set the loading state to true */}
        <div className="flex flex-col h-full">
          {/* Image section */}
          <div className="relative w-full h-40 mb-4">
            <Image
              src={imageSrc}
              alt="Cellist"
              fill
              objectFit="contain" // Ensures the entire image is visible
              className="rounded-md bg-white" // bg-white prevents transparency gaps
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

          {/* Centered Button Row */}
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
