import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavbarMain from '@/components/navbar-main';
import FilterAside from '@/components/filter-search';
import MobileFilterAccordion from '@/components/mobile-filter-search';
import { CiHeart } from "react-icons/ci";
import { FaInfoCircle } from "react-icons/fa";



interface MusicPiece {
  id: string;
  title: string;
  composer: string;
  level: string;
}

interface Composer {
  composer_full_name: string;
}

const Music: NextPage = () => {
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<MusicPiece[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [accordionContent, setAccordionContent] = useState({
    Level: ['Early Beginner', 'Beginner', 'Late Beginner', 'Early Intermediate', 'Intermediate', 'Late Intermediate', 'Early Advanced', 'Advanced', 'Professional'],
    Instrumentation: ['Solo', 'Duet', 'Trio', 'Quartet'],
    Composer: [] as string[],
  });
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]); // Add this line

  useEffect(() => {
    const fetchPieces = async () => {
      const res = await fetch('/api/celloMusic');
      const data = await res.json();
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
        group.composers.map((composer) => composer.composer_full_name)
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
      (selectedComposers.length === 0 || selectedComposers.includes(piece.composer)) &&
      (selectedLevels.length === 0 || selectedLevels.includes(piece.level)) // Add this condition
    );
    setFilteredPieces(filtered);
  }, [filter, pieces, selectedComposers, selectedLevels]); // Add selectedLevels

  const toggleComposerSelection = (composer: string) => {
    setSelectedComposers(prev =>
      prev.includes(composer) ? prev.filter(c => c !== composer) : [...prev, composer]
    );
  };

  const toggleLevelSelection = (level: string) => { // Add this function
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
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
          selectedLevels={selectedLevels} // Add this line
          toggleLevelSelection={toggleLevelSelection} // Add this line
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
              selectedLevels={selectedLevels} // Add this line
              toggleLevelSelection={toggleLevelSelection} // Add this line
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {filteredPieces.map((piece, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4 hover:scale-110 ">
                <Link href={`/piece/${piece.id}`}>
                <h2 className="text-l font-semibold text-gray-800">{piece.title}</h2>
                <p className="text-gray-600">by {piece.composer}</p>
                <i><p className="text-gray-600">{piece.level}</p></i>
                <div className="border-b border-gray-300 my-2"></div>
                <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    <CiHeart className="text-xl text-gray-600 hover:text-red-500 cursor-pointer" />
                    <Link href={`/piece/${piece.id}`}>
                      <FaInfoCircle className="text-xl text-blue-500 hover:text-blue-700 cursor-pointer" />
                    </Link>
                  </div>
                  </div>
                  </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Music;
