import Link from 'next/link';
import Image from 'next/image';
import { CiHeart } from "react-icons/ci";
import { FaInfoCircle } from "react-icons/fa";

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
  // Dynamically determine the text size
  const titleClass =
    title.length > 40 ? "text-sm" : title.length > 25 ? "text-md" : "text-lg";

  // Function to format the composer's name
  const getFormattedComposer = (firstName: string, lastName: string) => {
    if (lastName === "Various" || lastName === "Traditional") return lastName;
    if (firstName === "Various" || firstName === "Traditional") return firstName;
    return `${lastName}, ${firstName}`.trim();
  };

// Determine the instrumentation type
const isCelloAndPiano = instrumentation.includes("Cello") && instrumentation.includes("Piano");
const isCelloSolo = instrumentation.length === 1 && instrumentation.includes("Cello");
const isCelloDuet = instrumentation.length === 2 && instrumentation.every(inst => inst === "Cello");

// Determine the level
const isAdvanced = level === "Early Advanced" || level === "Advanced";
const isBeginner = level === "Beginner";
const isLateBeginner = level === "Late Beginner";
const isProfessional = level === "Professional";

// Select the image
const imageSrc = isProfessional
  ? "/assets/cellist3.png"
  : isBeginner && isCelloAndPiano
  ? "/assets/beginner_cello_and_piano.png" // This condition was missing
  : isBeginner && isCelloDuet
  ? "/assets/beginner_duet.png"
  : isCelloDuet
  ? "/assets/early_beginner_duet.png"
  : isAdvanced && isCelloAndPiano
  ? "/assets/advanced_cello_piano.png"
  : isAdvanced
  ? "/assets/advanced_cello_solo.png"
  : isLateBeginner && isCelloAndPiano
  ? "/assets/late_beginner_cello_piano.png"
  : isLateBeginner && isCelloSolo
  ? "/assets/late_beginner_solo_cello.png"
  : isBeginner && isCelloSolo
  ? "/assets/beginner_solo.png"
  : level === "Early Beginner" && isCelloSolo
  ? "/assets/early_beginner_cello_solo.png"
  : isCelloAndPiano
  ? "/assets/early_beginner_cello_piano.png"
  : "/assets/default_cello_and_piano.png"; // Default fallback





  return (
    <div className="bg-white shadow-md rounded-sm p-4 hover:scale-105 transition-transform duration-300">
      <Link href={`/piece/${id.toString()}`} className="block h-full">
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
                overflowWrap: "break-word",
                wordBreak: "break-word",
                lineHeight: "1.2",
              }}
            >
              {title}
            </h2>
            <p className="text-gray-600">
              by{" "}
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
            <button className="bg-black text-white w-[75%] max-w-xs py-1 rounded-full text-center hover:bg-gradient-to-br transition-colors">
              See more
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MusicCard;
