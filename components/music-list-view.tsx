import Link from 'next/link';
import { IoCaretUpCircle, IoCaretDownCircle, IoCaretForwardCircle } from 'react-icons/io5';

interface MusicPiece {
  id: number;
  title: string;
  composer: string;
  level: string;
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
  const [hours, minutes, seconds] = parts;
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const s = parseInt(seconds, 10);
  if (h === 0 && m === 0 && s === 0) return 'N/A';
  if (h > 0) {
    return `${h}hr ${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}''`;
  }
  return `${m}'${String(s).padStart(2, '0')}''`;
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
              <td className="px-4 py-2 border text-black">{piece.composer}</td>
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
