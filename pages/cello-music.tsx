import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link from Next.js
import NavbarMain from '@/components/navbar-main';

interface MusicPiece {
  id: string; 
  title: string;
  composer: string;
  level_id: string;
}

const getLevelDescription = (level_id: string): string => {
  const level = parseInt(level_id, 10);
  switch (level) {
    case 1: return 'Early Beginner';
    case 2: return 'Beginner';
    case 3: return 'Late Beginner';
    case 4: return 'Early Intermediate';
    case 5: return 'Intermediate';
    case 6:
    case 7: return 'Late Intermediate';
    case 8:
    case 9: return 'Early Professional';
    case 10: return 'Professional';
    default: return 'Unknown Level';
  }
};
const Music: NextPage = () => {
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<MusicPiece[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const fetchPieces = async () => {
      const res = await fetch('/api/celloMusic');
      const data = await res.json();
      console.log(data);  // Log the fetched data
      const flattenedPieces = data.flatMap((group: { musicPieces: MusicPiece[] }) => group.musicPieces);
      setPieces(flattenedPieces);
      setFilteredPieces(flattenedPieces);
    };

    fetchPieces();
  }, []);

  useEffect(() => {
    const filtered = pieces.filter(piece =>
      piece.title.toLowerCase().includes(filter.toLowerCase()) ||
      piece.composer.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredPieces(filtered);
  }, [filter, pieces]);

  return (
    <div>
      <Head>
        <title>Cello Music</title>
      </Head>
      <NavbarMain />

      <div className="flex mt-16">
        <aside className="fixed top-24 left-0 h-full w-1/4 p-5 ">
          <h2 className="text-xl font-bold mb-4">Filter</h2>
          <input
            type="text"
            placeholder="Search by title or composer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-black font-mono"
          />
        </aside>
        <main className="ml-1/4 container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center my-6">Cello Music</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPieces.map((piece, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800">{piece.title}</h2>
                <p className="text-gray-600">by {piece.composer}</p>
                <div className="border-b border-gray-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">{getLevelDescription(piece.level_id)} </p>
                  {/* Use Link component for dynamic routing */}
                  <Link href={`/piece/${piece.id}`}>
                    <p className="text-blue-500 hover:underline">View Detail</p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Music;
