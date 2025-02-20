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

const MusicListView: React.FC<MusicListViewProps> = ({ pieces }) => {
  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-black">
            <th className="px-4 py-2 border text-left text-white">Piece Name</th>
            <th className="px-4 py-2 border text-left text-white">Composer Name</th>
            <th className="px-4 py-2 border text-left text-white">Level</th>
            <th className="px-4 py-2 border text-left text-white">Duration</th>
          </tr>
        </thead>
        <tbody>
          {pieces.map((piece) => (
            <tr key={piece.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <Link
                  href={`/piece/${piece.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {piece.title}
                </Link>
              </td>
              <td className="px-4 py-2 border text-black">{piece.composer}</td>
              <td className="px-4 py-2 border text-black">{piece.level}</td>
              <td className="px-4 py-2 border text-black">{piece.duration || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MusicListView;
