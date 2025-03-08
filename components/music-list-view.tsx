import Link from 'next/link';
import { IoCaretUpCircle, IoCaretDownCircle, IoCaretForwardCircle } from 'react-icons/io5';

interface MusicPiece {
  id: number;
  title: string;
  composer_first_name: string;
  composer_last_name: string;
  level: string;
  instrumentation: string[];
  duration?: string; 
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface MusicListViewProps {
  pieces: MusicPiece[];
  sortConfig: SortConfig | null;
  onSort: (field: string) => void;
}

const formatDuration = (duration: string): string => {
  const parts = duration.split(':');
  if (parts.length !== 3) return duration;
  
  const [hours, minutes, seconds] = parts.map(Number);
  // If the duration is 00:00:00, we display as N/A.
  if (hours === 0 && minutes === 0 && seconds === 0) return 'N/A';
  if (hours > 0) {
    return seconds > 0
      ? `${hours}hr ${minutes}'${seconds}''`
      : `${hours}hr ${minutes}'`;
  }
  return seconds > 0 ? `${minutes}'${seconds}''` : `${minutes}'`;
};

const convertDurationToSeconds = (duration: string): number | null => {
  const parts = duration.split(':');
  if (parts.length !== 3) return null;
  const [hours, minutes, seconds] = parts.map(Number);
  if (hours === 0 && minutes === 0 && seconds === 0) return null;
  return hours * 3600 + minutes * 60 + seconds;
};

const compareDurations = (
  aDuration: string | undefined,
  bDuration: string | undefined,
  direction: 'asc' | 'desc'
): number => {
  const isValid = (duration: string | undefined) =>
    duration !== undefined && duration !== '00:00:00';

  const aValid = isValid(aDuration);
  const bValid = isValid(bDuration);

  // If one is valid and the other isn’t, valid ones come first.
  if (aValid && !bValid) return -1;
  if (!aValid && bValid) return 1;
  if (!aValid && !bValid) return 0;

  // Both durations are valid; convert to seconds.
  const secondsA = convertDurationToSeconds(aDuration!);
  const secondsB = convertDurationToSeconds(bDuration!);
  if (secondsA === null || secondsB === null) return 0;
  return direction === 'asc' ? secondsA - secondsB : secondsB - secondsA;
};

const MusicListView: React.FC<MusicListViewProps> = ({ pieces, sortConfig, onSort }) => {
  const getSortIcon = (field: string) => {
    if (!sortConfig || sortConfig.field !== field) {
      return <IoCaretForwardCircle className="inline-block" />;
    }
    return sortConfig.direction === 'asc' ? (
      <IoCaretUpCircle className="inline-block" />
    ) : (
      <IoCaretDownCircle className="inline-block" />
    );
  };

  const formatComposer = (first: string, last: string): string => {
    const lowerFirst = first.toLowerCase();
    const lowerLast = last.toLowerCase();
    if (lowerFirst.includes("various") || lowerLast.includes("various")) {
      return "Various";
    }
    if (lowerFirst.includes("traditional") || lowerLast.includes("traditional")) {
      return "Traditional";
    }
    return `${first}, ${last}`;
  };

  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-black">
            <th
              className="px-4 py-2 border text-left text-white cursor-pointer"
              onClick={() => onSort('title')}
            >
              <span className="flex items-center gap-x-1 whitespace-nowrap">
                Piece {getSortIcon('title')}
              </span>
            </th>
            <th
              className="px-4 py-2 border text-left text-white cursor-pointer"
              onClick={() => onSort('instrumentation')}
            >
              <span className="flex items-center gap-x-1 whitespace-nowrap">
                Instrumentation {getSortIcon('instrumentation')}
              </span>
            </th>
            <th
              className="px-4 py-2 border text-left text-white cursor-pointer"
              onClick={() => onSort('composer')}
            >
              <span className="flex items-center gap-x-1 whitespace-nowrap">
                Composer {getSortIcon('composer')}
              </span>
            </th>
            <th
              className="px-4 py-2 border text-left text-white cursor-pointer"
              onClick={() => onSort('level')}
            >
              <span className="flex items-center gap-x-1 whitespace-nowrap">
                Level {getSortIcon('level')}
              </span>
            </th>
            <th
              className="px-4 py-2 border text-left text-white hidden md:table-cell cursor-pointer"
              onClick={() => onSort('duration')}
            >
              <span className="flex items-center gap-x-1 whitespace-nowrap">
                Duration {getSortIcon('duration')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {pieces.map((piece) => (
            <tr key={piece.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <Link
                  href={`/piece/${piece.id}`}
                  className="text-black hover:underline"
                >
                  {piece.title}
                </Link>
              </td>
              <td className="px-4 py-2 border text-black">
                {piece.instrumentation.join(', ')}
              </td>
              <td className="px-4 py-2 border text-black">
                {formatComposer(piece.composer_last_name, piece.composer_first_name)}
              </td>
              <td className="px-4 py-2 border text-black">{piece.level}</td>
              <td className="px-4 py-2 border text-black hidden md:table-cell">
                {piece.duration ? formatDuration(piece.duration) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MusicListView;
