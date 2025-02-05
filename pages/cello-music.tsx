import { NextPage } from 'next';
import Head from 'next/head';
import { useRef, useEffect, useState } from 'react';
import { IoFilter, IoSwapVertical } from 'react-icons/io5'; // <-- ADDED IoSwapVertical
import NavbarMain from '@/components/navbar-main';
import FilterAside from '@/components/filter-search';
import MobileFilterAccordion from '@/components/mobile-filter-search';
import MusicCard from '@/components/music-card';

interface MusicPiece {
  id: number;
  title: string;
  composer: string;
  level: string;
  instrumentation: string;
  composer_last_name: string;
  nationality: string;
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
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [minYear, setMinYear] = useState<number>(1600);
  const [maxYear, setMaxYear] = useState<number>(2025);

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
      'Various',
    ],
    Instrumentation: ['Cello and Piano', 'Cello Solo', 'Cello Duet','Cello Ensemble','Cello and Orchestra', 'Other'],
    Composer: [] as string[],
    Country: ['United States of America', 'Canada', 'France', 'Mexico', 'China'],
    Year: [],
  });

  // Selected filters
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

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
    'Various'
  ];

  // Fetch music data
  useEffect(() => {
    const fetchPieces = async () => {
      const res = await fetch('/api/celloMusic');
      const data = await res.json();
      const flattenedPieces = data.flatMap(
        (group: { musicPieces: MusicPiece[] }) => group.musicPieces
      );
      setPieces(flattenedPieces);
      setFilteredPieces(flattenedPieces);
    };
    fetchPieces();
  }, []);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/nationalities');
        const data = await res.json();
        const nationalities = data.map(
          (item: { nationality: string }) => item.nationality
        );
        setAccordionContent((prev) => ({ ...prev, Country: nationalities }));
      } catch (error) {
        console.error('Error fetching nationalities:', error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch composers
  useEffect(() => {
    const fetchComposers = async () => {
      const res = await fetch('/api/composers');
      const data = await res.json();
      const composerNames = data.flatMap(
        (group: { composers: Composer[] }) =>
          group.composers.map((composer) => composer.composer_full_name)
      );
      setAccordionContent((prev) => ({ ...prev, Composer: composerNames }));
    };
    fetchComposers();
  }, []);

  const mobileFilterRef = useRef<HTMLDivElement>(null);


  

  // Filter logic
  useEffect(() => {
    const filtered = pieces.filter((piece) => {
      const titleMatch = piece.title
        .toLowerCase()
        .includes(filter.toLowerCase());
      const composerMatch = piece.composer
        .toLowerCase()
        .includes(filter.toLowerCase());
      const composerFilterMatch =
        selectedComposers.length === 0 ||
        selectedComposers.includes(piece.composer);
      const levelFilterMatch =
        selectedLevels.length === 0 || selectedLevels.includes(piece.level);
      const countryFilterMatch =
        selectedCountries.length === 0 ||
        selectedCountries.includes(piece.nationality);

      // Year filter logic
      const pieceYear = parseInt((piece as any).composition_year || '0', 10);
      const validYear = !isNaN(pieceYear) && pieceYear > 0;
      const yearFilterMatch = validYear
        ? pieceYear >= minYear && pieceYear <= maxYear
        : true;

      // Instrumentation filter logic
      const instrumentationMatch =
        selectedInstruments.length === 0 ||
        selectedInstruments.some((selectedInstrument) => {
          const normalizedSelectedInstrument =
            selectedInstrument === 'Cello Solo' ? 'Cello' : selectedInstrument;
          if (Array.isArray(piece.instrumentation)) {
            const normalizedInstrumentation = piece.instrumentation.map(
              (instr) =>
                instr.toLowerCase() === 'cello solo' ? 'cello' : instr.toLowerCase()
            );
            const selectedParts =
              normalizedSelectedInstrument.toLowerCase().split(' and ');
            if (selectedParts.length === 1) {
              return (
                normalizedInstrumentation.length === 1 &&
                normalizedInstrumentation.includes(selectedParts[0])
              );
            }
            return selectedParts.every((part) =>
              normalizedInstrumentation.includes(part)
            );
          }
          return false;
        });

      return (
        (titleMatch || composerMatch) &&
        composerFilterMatch &&
        levelFilterMatch &&
        countryFilterMatch &&
        instrumentationMatch &&
        yearFilterMatch
      );
    });

    setFilteredPieces(filtered);
  }, [
    filter,
    pieces,
    selectedComposers,
    selectedLevels,
    selectedCountries,
    selectedInstruments,
    minYear,
    maxYear,
  ]);

  // Toggle selection helpers
  const toggleComposerSelection = (composer: string) => {
    setSelectedComposers((prev) =>
      prev.includes(composer) ? prev.filter((c) => c !== composer) : [...prev, composer]
    );
  };

  const toggleCountrySelection = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const toggleLevelSelection = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleInstrumentSelection = (instrument: string) => {
    const normalizedInstrument = instrument === 'Cello Solo' ? 'Cello' : instrument;
    setSelectedInstruments((prev) =>
      prev.includes(normalizedInstrument)
        ? prev.filter((i) => i !== normalizedInstrument)
        : [...prev, normalizedInstrument]
    );
  };

  // Sorting
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
  
      <NavbarMain />
  
      {/* Overlay that closes mobile filter and sort when clicked */}
      {(isFilterVisible || isSortMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsFilterVisible(false);
            setIsSortMenuOpen(false);
          }}
        />
      )}
  
      <div className="flex mt-4">
        {/* Desktop Filter Aside */}
        <FilterAside
          filter={filter}
          setFilter={setFilter}
          minYear={minYear}
          maxYear={maxYear}
          setMinYear={setMinYear}
          setMaxYear={setMaxYear}
          accordionContent={accordionContent}
          selectedComposers={selectedComposers}
          toggleComposerSelection={toggleComposerSelection}
          selectedLevels={selectedLevels}
          toggleLevelSelection={toggleLevelSelection}
          selectedInstruments={selectedInstruments}
          toggleInstrumentSelection={toggleInstrumentSelection}
          selectedCountries={selectedCountries}
          toggleCountrySelection={toggleCountrySelection}
        />
  
        {/* Mobile Filter Drawer */}
        {isFilterVisible && (
          <div
            ref={mobileFilterRef}
            className="md:hidden fixed inset-0 ml-20 bg-white z-50 overflow-y-auto p-5 transition-transform transform animate-slideIn"
            aria-label="Mobile Filter Drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mx-5">
              <h2 className="text-xl font-bold text-black">Filter</h2>
              <button
                className="text-lg text-black p-2 rounded"
                onClick={() => setIsFilterVisible(false)}
              >
                X
              </button>
            </div>
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
              selectedCountries={selectedCountries}
              toggleCountrySelection={toggleCountrySelection}
              minYear={minYear}
              maxYear={maxYear}
              setMinYear={setMinYear}
              setMaxYear={setMaxYear}
            />
          </div>
        )}
  
        <main className="md:ml-64 w-full container mx-auto p-4">
          {/* Top Section: Header + Mobile Filter Toggle & Sort */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Cello Music</h1>
  
            {/* MOBILE: Filter & Sort Buttons */}
            <div className="relative md:hidden flex items-center space-x-2">
              <button
                className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                onClick={() => setIsFilterVisible(true)}
              >
                <IoFilter className="mr-1" />
                Filter
              </button>
  
              <div className="relative">
                <button
                  className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                >
                  <IoSwapVertical className="text-white mr-2" />
                  Sort
                </button>
                {isSortMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-[200px] bg-white rounded text-black shadow-md p-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('title-asc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      A-Z
                    </button>
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('title-desc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Z-A
                    </button>
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('level-asc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Level (Low → High)
                    </button>
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('level-desc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Level (High → Low)
                    </button>
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('composer-desc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Composer (A-Z)
                    </button>
                  </div>
                )}
              </div>
            </div>
  
            {/* DESKTOP: Sort By Dropdown (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-2">
              <label className="text-white font-medium text-sm" htmlFor="sort-by">
                Sort By:
              </label>
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
    </div>
  );  
};

export default Music;
