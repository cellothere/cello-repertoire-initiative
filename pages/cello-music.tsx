// pages/music.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavbarMain from '@/components/navbar-main';
import FilterAside from '@/components/filter-search';
import MobileFilterAccordion from '@/components/mobile-filter-search';
import { CiHeart } from "react-icons/ci";
import { FaInfoCircle } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";

interface MusicPiece {
  id: string;
  title: string;
  composer: string;
  level: string;
  instrumentation: string;
  composer_last_name: string;
}

interface Composer {
  composer_full_name: string;
  composer_last_name: string;
  bio_links: string[];
}

const Music: NextPage = () => {
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<MusicPiece[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [accordionContent, setAccordionContent] = useState({
    Level: ['Early Beginner', 'Beginner', 'Late Beginner', 'Early Intermediate', 'Intermediate', 'Late Intermediate', 'Early Advanced', 'Advanced', 'Professional'],
    Instrumentation: ['Cello and Piano', 'Cello Solo', 'Cello Duet', 'Other Instrumentations'],
    Composer: [] as string[],
    Country: ['United States of America', 'Canada', 'France', 'Mexico', 'China'],
    Year: ['1600s', '1700s', '1800s', '1900s'],
    "Other Filters": ['Public Domain?', 'Living Composer', 'Recently Added'],
  });
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]); // Already present
  const levelOrder = [
    'Early Beginner',
    'Beginner',
    'Late Beginner',
    'Early Intermediate',
    'Intermediate',
    'Late Intermediate',
    'Early Advanced',
    'Advanced',
    'Professional',
  ];
  
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
    const filtered = pieces.filter(piece => {
      const titleMatch = piece.title.toLowerCase().includes(filter.toLowerCase());
      const composerMatch = piece.composer.toLowerCase().includes(filter.toLowerCase());
      const composerFilterMatch = selectedComposers.length === 0 || selectedComposers.includes(piece.composer);
      const levelFilterMatch = selectedLevels.length === 0 || selectedLevels.includes(piece.level);

      const instrumentationMatch = selectedInstruments.length === 0 || selectedInstruments.some(selectedInstrument => {
        if (Array.isArray(piece.instrumentation)) {
          const normalizedInstrumentation = piece.instrumentation.map(instr => instr.toLowerCase());
          const selectedParts = selectedInstrument.toLowerCase().split(' and ');

          if (selectedParts.length === 1) {
            // Exact match for single instruments (e.g., "Cello Solo" should match ["Cello"])
            return normalizedInstrumentation.length === 1 && normalizedInstrumentation.includes(selectedParts[0]);
          } else {
            // Match all selected instruments in the array (e.g., "Cello and Piano" should match ["Cello", "Piano"])
            return selectedParts.every(part => normalizedInstrumentation.includes(part));
          }
        } else {
          return false;
        }
      });

      return (titleMatch || composerMatch) && composerFilterMatch && levelFilterMatch && instrumentationMatch;
    });

    setFilteredPieces(filtered);
  }, [filter, pieces, selectedComposers, selectedLevels, selectedInstruments]);

  const toggleComposerSelection = (composer: string) => {
    setSelectedComposers(prev =>
      prev.includes(composer) ? prev.filter(c => c !== composer) : [...prev, composer]
    );
  };

  const toggleLevelSelection = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleInstrumentSelection = (instrument: string) => {
    setSelectedInstruments(prev =>
      prev.includes(instrument) ? prev.filter(i => i !== instrument) : [...prev, instrument]
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
          selectedLevels={selectedLevels}
          toggleLevelSelection={toggleLevelSelection}
          selectedInstruments={selectedInstruments} // New prop
          toggleInstrumentSelection={toggleInstrumentSelection} // New prop
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
              selectedLevels={selectedLevels}
              toggleLevelSelection={toggleLevelSelection}
              selectedInstruments={selectedInstruments}
              toggleInstrumentSelection={toggleInstrumentSelection}
            />
          </div>
        )}
        <main className="md:ml-64 container mx-auto p-4">
        <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold text-left my-6">Cello Music:</h1>
  <div className="flex items-center space-x-2">
  <label className="text-white font-medium text-m">Sort By:</label>
  <div className="relative">
  <select
  className="border border-gray-300 rounded-md p-1 text-black font-medium text-sm bg-white focus:outline-none"
  onChange={(e) => {
    const sortOption = e.target.value;

    const sortedPieces = [...filteredPieces].sort((a, b) => {
      switch (sortOption) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "level-asc":
          return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
        case "level-desc":
          return levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
          case "composer-desc":
            if (a.composer_last_name && b.composer_last_name) {
              return a.composer_last_name.localeCompare(b.composer_last_name);
            }
            return 0; // Or handle undefined/empty values differently if needed
          default:
          
          return 0;
      }
    });

    setFilteredPieces(sortedPieces);
  }}
>
  <option value="title-asc">Alphabetically (A-Z)</option>
  <option value="title-desc">Alphabetically (Z-A)</option>
  <option value="level-asc">Level (Low to High)</option>
  <option value="level-desc">Level (High to Low)</option>
  <option value="composer-desc">Composer (A-Z)</option>
</select>

</div>

</div>


</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {filteredPieces.map((piece, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-4 hover:scale-105 transition-transform duration-500">
                <Link href={`/piece/${piece.id}`}>
                  <div className="flex flex-col h-full">
                    {/* Title and Composer */}
                    <div>
                      <h2 className="text-l font-semibold text-gray-800">{piece.title}</h2>
                      <p className="text-gray-600">by {piece.composer}</p>
                      <i>
                        <p className="text-gray-600">{piece.level}</p>
                      </i>
                    </div>
                    <div className="flex-grow border-b border-gray-300 my-2"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex space-x-2">
                        <CiHeart className="text-xl text-gray-600 hover:text-red-500 cursor-pointer" />
                        <FaInfoCircle className="text-xl text-blue-500 hover:text-blue-700 cursor-pointer" />
                      </div>
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
