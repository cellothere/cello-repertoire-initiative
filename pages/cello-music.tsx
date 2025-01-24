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
import MusicCard from '@/components/music-card';

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

  // Accordion content categories
  const [accordionContent, setAccordionContent] = useState({
    Level: [
      'Early Beginner',
      'Beginner',
      'Late Beginner',
      'Early Intermediate',
      'Intermediate',
      'Late Intermediate',
      'Early Advanced',
      'Advanced',
      'Professional',
    ],
    Instrumentation: ['Cello and Piano', 'Cello Solo', 'Cello Duet', 'Other Instrumentations'],
    Composer: [] as string[],
    Country: ['United States of America', 'Canada', 'France', 'Mexico', 'China'],
    Year: ['1600s', '1700s', '1800s', '1900s'],
    "Other Filters": ['Public Domain?', 'Living Composer', 'Recently Added'],
  });

  // Selected filters
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  // Used to sort by level
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

  // Fetching the music data
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

  // Fetching the composers data
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

  // Filter logic
  useEffect(() => {
    const filtered = pieces.filter((piece) => {
      const titleMatch = piece.title.toLowerCase().includes(filter.toLowerCase());
      const composerMatch = piece.composer.toLowerCase().includes(filter.toLowerCase());

      const composerFilterMatch =
        selectedComposers.length === 0 || selectedComposers.includes(piece.composer);

      const levelFilterMatch =
        selectedLevels.length === 0 || selectedLevels.includes(piece.level);

      // Instrumentation logic
      const instrumentationMatch =
        selectedInstruments.length === 0 ||
        selectedInstruments.some((selectedInstrument) => {
          if (Array.isArray(piece.instrumentation)) {
            const normalized = piece.instrumentation.map((instr) => instr.toLowerCase());
            const selectedParts = selectedInstrument.toLowerCase().split(' and ');

            if (selectedParts.length === 1) {
              // Match single instrument exactly
              return normalized.length === 1 && normalized.includes(selectedParts[0]);
            } else {
              // Match all selected instruments in the array
              return selectedParts.every((part) => normalized.includes(part));
            }
          }
          return false;
        });

      // Combine all filter checks
      return (titleMatch || composerMatch) && composerFilterMatch && levelFilterMatch && instrumentationMatch;
    });

    setFilteredPieces(filtered);
  }, [filter, pieces, selectedComposers, selectedLevels, selectedInstruments]);

  // Toggles
  const toggleComposerSelection = (composer: string) => {
    setSelectedComposers((prev) =>
      prev.includes(composer) ? prev.filter((c) => c !== composer) : [...prev, composer]
    );
  };

  const toggleLevelSelection = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleInstrumentSelection = (instrument: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrument) ? prev.filter((i) => i !== instrument) : [...prev, instrument]
    );
  };

  // Sorting handler
  const handleSort = (sortOption: string) => {
    const sortedPieces = [...filteredPieces].sort((a, b) => {
      switch (sortOption) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'level-asc':
          return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
        case 'level-desc':
          return levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
        case 'composer-desc':
          // Sort by composer last name (A-Z)
          if (a.composer_last_name && b.composer_last_name) {
            return a.composer_last_name.localeCompare(b.composer_last_name);
          }
          return 0;
        default:
          return 0;
      }
    });
    setFilteredPieces(sortedPieces);
  };

  return (
    <div>
      <Head>
        <title>Cello Music</title>
      </Head>

      {/* Your Navbar */}
      <NavbarMain />

      {/* Primary container with gradient background (assuming global CSS or parent layout sets this).
          If you need a local gradient, uncomment or adjust accordingly:
          
          <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
      */}

      <div className="flex mt-4">
        {/* Desktop Filter Aside */}
        <FilterAside
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

        {/* Mobile Filter Drawer */}
        {isFilterVisible && (
          <div
            className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto p-5 transition-transform transform animate-slideIn"
            aria-label="Mobile Filter Drawer"
          >
            <button
              className="absolute top-5 right-5 bg-black hover:bg-red-600 text-white p-2 rounded"
              onClick={() => setIsFilterVisible(false)}
            >
              Close
            </button>

            <h2 className="text-xl font-bold text-black mb-4">Filter</h2>
            <input
              type="text"
              placeholder="Search by title or composer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black mb-4"
              aria-label="Filter by title or composer"
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

        {/* Main Content */}
        <main className="md:ml-64 w-full container mx-auto p-4">
          {/* Top Section: Header + Mobile Filter Toggle + Sort */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Cello Music</h1>

            {/* Mobile Filter Toggle Button */}
            <button
              className="md:hidden flex items-center text-white bg-black hover:bg-red-500 px-3 py-2 rounded-md"
              onClick={() => setIsFilterVisible(true)}
            >
              <IoFilter className="mr-1" />
              Filter
            </button>

            {/* Sorting Controls (Hidden on Mobile if you prefer) */}
            <div className="hidden md:flex items-center space-x-2">
              <label className="text-white font-medium text-sm" htmlFor="sort-by">
                Sort By:
              </label>
              <div className="relative">
                <select
                  id="sort-by"
                  className="border border-gray-300 rounded-md p-1 text-black font-medium text-sm bg-white focus:outline-none"
                  onChange={(e) => handleSort(e.target.value)}
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

          {/* Grid of Filtered Pieces */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPieces.map((piece) => (
              <MusicCard
                key={piece.id}
                id={piece.id}
                title={piece.title}
                composer={piece.composer}
                level={piece.level}
              />
            ))}
          </div>

        </main>
      </div>

      {/* </div>  Un-comment if you wrapped in a gradient container */}
    </div>
  );
};

export default Music;
