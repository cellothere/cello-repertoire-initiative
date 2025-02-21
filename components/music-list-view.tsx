import Link from 'next/link';

interface MusicPiece {
  id: number;
  title: string;
  composer: string;
  level: string;
  duration?: string; 
}

interface MusicListViewProps {
  pieces: MusicPiece[];
}

const formatDuration = (duration: string): string => {
    // Split the duration assuming format "HH:MM:SS"
    const parts = duration.split(':');
    if (parts.length !== 3) return duration; // fallback if not matching expected format
  
    const [hours, minutes, seconds] = parts;
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const s = parseInt(seconds, 10);
  
    // If all values are 0, return "N/A"
    if (h === 0 && m === 0 && s === 0) {
      return 'N/A';
    }
  
    if (h > 0) {
      // When hours exist, pad minutes & seconds to 2 digits.
      return `${h}hr ${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}''`;
    }
    // If no hours, show minutes without leading zero and seconds padded to 2 digits.
    return `${m}'${String(s).padStart(2, '0')}''`;
  };
  

const MusicListView: React.FC<MusicListViewProps> = ({ pieces }) => {
  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-black">
            <th className="px-4 py-2 border text-left text-white">Piece</th>
            <th className="px-4 py-2 border text-left text-white">Composer</th>
            <th className="px-4 py-2 border text-left text-white">Level</th>
            <th className="px-4 py-2 border text-left text-white hidden md:table-cell">
              Duration
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
