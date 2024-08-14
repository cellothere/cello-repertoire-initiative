import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavbarMain from '@/components/navbar-main';
import FilterAside from '@/components/filter-search';
import MobileFilterAccordion from '@/components/mobile-filter-search';

interface MusicPiece {
  id: string;
  title: string;
  composer: string;
  level_id: string;
}

interface Composer {
  composer_name: string;
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
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [accordionContent, setAccordionContent] = useState({
    Level: ['Beginner', 'Advanced', 'Professional'],
    Instrumentation: ['Solo', 'Duet', 'Trio', 'Quartet'],
    Composer: [] as string[],
  });
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);

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
    const fetchComposers = async () => {
      const res = await fetch('/api/composers');
      const data = await res.json();
      const composerNames = data.flatMap((group: { composers: Composer[] }) =>
        group.composers.map((composer) => composer.composer_name)
      );
      setAccordionContent((prevContent) => ({
        ...prevContent,
        Composer: composerNames,
      }));
    };

    fetchComposers();
  }, []);

  useEffect(() => {
    const filtered = pieces.filter(piece =>
      (piece.title.toLowerCase().includes(filter.toLowerCase()) ||
        piece.composer.toLowerCase().includes(filter.toLowerCase())) &&
      (selectedComposers.length === 0 || selectedComposers.includes(piece.composer))
    );
    setFilteredPieces(filtered);
  }, [filter, pieces, selectedComposers]);

  const toggleComposerSelection = (composer: string) => {
    setSelectedComposers(prev =>
      prev.includes(composer) ? prev.filter(c => c !== composer) : [...prev, composer]
    );
  };

  return (
    <div>
      <Head>
        <title>Cello Music</title>
      </Head>
      <NavbarMain />

      <div className="flex mt-1">
        <FilterAside
          filter={filter}
          setFilter={setFilter}
          accordionContent={accordionContent}
          selectedComposers={selectedComposers}
          toggleComposerSelection={toggleComposerSelection}
        />

        {isFilterVisible && (
          <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto p-5">
            <button
              className="absolute top-5 right-5 bg-red-500 text-white p-2 rounded"
              onClick={() => setIsFilterVisible(false)}
            >
              Close
            </button>
            <h2 className="text-xl color-black font-bold mb-4">Filter</h2>
            <input
              type="text"
              placeholder="Search by title or composer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black font-mono mb-4"
            />

            <MobileFilterAccordion
              filter={filter}
              setFilter={setFilter}
              accordionContent={accordionContent}
              selectedComposers={selectedComposers}
              toggleComposerSelection={toggleComposerSelection}
            />
          </div>
        )}

        <main className="md:ml-64 container mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-center my-6">Cello Music</h1>
            {!isFilterVisible && (
              <button
                className="md:hidden w-24 p-3 bg-black text-white font-bold z-0 rounded-lg"
                onClick={() => setIsFilterVisible(true)}
              >
                Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPieces.map((piece, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800">{piece.title}</h2>
                <p className="text-gray-600">by {piece.composer}</p>
                <div className="border-b border-gray-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">{getLevelDescription(piece.level_id)}</p>
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
