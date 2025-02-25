import { NextPage } from 'next';
import Head from 'next/head';
import { useRef, useEffect, useState } from 'react';
import { IoFilter, IoSwapVertical, IoList, IoGrid } from 'react-icons/io5';
import NavbarMain from '@/components/navbar-main';
import FilterAside from '@/components/filter-search';
import MobileFilterAccordion from '@/components/mobile-filter-search';
import MusicCard from '@/components/music-card';
import MusicListView from '@/components/music-list-view';


interface MusicPiece {
  id: number;
  title: string;
  composer: string;
  level: string;
  instrumentation: string[];
  composer_last_name: string;
  composer_first_name: string;
  nationality: string;
  duration: string;
}

interface Composer {
  composer_full_name: string;
  composer_last_name: string;
  composer_first_name: string;
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
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card'); // New state for view mode
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);


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
    Instrumentation: [
      'Cello and Piano',
      'Cello Solo',
      'Cello Duet',
      'Cello Ensemble',
      'Cello and Orchestra',
      'Other',
    ],
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
    'Various',
  ];

  // Fetch music data
  // Fetch music data
  useEffect(() => {
    const fetchPieces = async () => {
      const res = await fetch('/api/celloMusic');
      const data = await res.json();
      const flattenedPieces = data.flatMap(
        (group: { musicPieces: MusicPiece[] }) => group.musicPieces
      );
      // Sort the pieces by level (low to high) using levelOrder
      const sortedPieces = flattenedPieces.sort(
        (a: MusicPiece, b: MusicPiece) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
      );
      setPieces(sortedPieces);
      setFilteredPieces(sortedPieces);
      // Optionally, update the sort configuration state
      setSortConfig({ field: 'level', direction: 'asc' });
    };
    fetchPieces();
  }, []);


  const onSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const newSortConfig = { field, direction };
    setSortConfig(newSortConfig);

    const sortedPieces = [...filteredPieces].sort((a, b) => {
      switch (field) {
        case 'title':
          return direction === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case 'composer':
          return direction === 'asc'
            ? a.composer.localeCompare(b.composer)
            : b.composer.localeCompare(a.composer);
        case 'level':
          return direction === 'asc'
            ? levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
            : levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
        // Add other cases if needed (e.g., for 'duration')
        default:
          return 0;
      }
    });

    setFilteredPieces(sortedPieces);
  };

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
    let filtered = pieces.filter((piece) => {
      const titleMatch = piece.title.toLowerCase().includes(filter.toLowerCase());
      const composerMatch = piece.composer.toLowerCase().includes(filter.toLowerCase());
      const composerFilterMatch =
        selectedComposers.length === 0 || selectedComposers.includes(piece.composer);
      const levelFilterMatch =
        selectedLevels.length === 0 || selectedLevels.includes(piece.level);
      const countryFilterMatch =
        selectedCountries.length === 0 || selectedCountries.includes(piece.nationality);

      const pieceYear = parseInt((piece as any).composition_year || '0', 10);
      const validYear = !isNaN(pieceYear) && pieceYear > 0;
      const yearFilterMatch = validYear ? pieceYear >= minYear && pieceYear <= maxYear : true;

      // Instrumentation filter logic
      const instrumentationMatch =
      selectedInstruments.length === 0 ||
      selectedInstruments.some((selectedInstrument) => {
        const normalizedSelectedInstrument =
          selectedInstrument === 'Cello Solo' ? 'Cello' : selectedInstrument;
    
        if (Array.isArray(piece.instrumentation)) {
          const normalizedInstrumentation = piece.instrumentation.map(instr =>
            instr.toLowerCase() === 'cello solo' ? 'cello' : instr.toLowerCase()
          );
    
          if (normalizedSelectedInstrument.toLowerCase() === 'cello duet') {
            return (
              normalizedInstrumentation.length === 2 &&
              normalizedInstrumentation.every(instr => instr === 'cello')
            );
          }
    
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

    // If a sort configuration exists, apply it
    if (sortConfig) {
      filtered = filtered.sort((a, b) => {
        switch (sortConfig.field) {
          case 'title':
            return sortConfig.direction === 'asc'
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          case 'composer':
            return sortConfig.direction === 'asc'
              ? a.composer.localeCompare(b.composer)
              : b.composer.localeCompare(a.composer);
          case 'level':
            return sortConfig.direction === 'asc'
              ? levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
              : levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
          default:
            return 0;
        }
      });
    }

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
    sortConfig
  ]);

  // Toggle selection helpers
  const toggleComposerSelection = (composer: string) => {
    setSelectedComposers((prev) =>
      prev.includes(composer)
        ? prev.filter((c) => c !== composer)
        : [...prev, composer]
    );
  };

  // Add this helper function inside your component, above your useEffects or inside the component body:
  const sortByComposer = (a: MusicPiece, b: MusicPiece, direction: 'asc' | 'desc') => {
    // Define the composers to always put at the end (case-insensitive)
    const specialNames = ['traditional', 'various'];
    const aIsSpecial = specialNames.includes(a.composer.toLowerCase());
    const bIsSpecial = specialNames.includes(b.composer.toLowerCase());

    // If one is special and the other is not, put the special one after
    if (aIsSpecial && !bIsSpecial) return 1;
    if (!aIsSpecial && bIsSpecial) return -1;

    // Otherwise, sort by last name as normal
    return direction === 'asc'
      ? a.composer_last_name.localeCompare(b.composer_last_name)
      : b.composer_last_name.localeCompare(a.composer_last_name);
  };


  const toggleCountrySelection = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const toggleLevelSelection = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
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
    let field = '';
    let direction: 'asc' | 'desc' = 'asc';

    switch (sortOption) {
      case 'title-asc':
        field = 'title';
        direction = 'asc';
        break;
      case 'title-desc':
        field = 'title';
        direction = 'desc';
        break;
      case 'level-asc':
        field = 'level';
        direction = 'asc';
        break;
      case 'level-desc':
        field = 'level';
        direction = 'desc';
        break;
      case 'composer-desc':
        field = 'composer';
        direction = 'desc';
        break;
      default:
        break;
    }

    // Update the sort configuration
    setSortConfig({ field, direction });

    // sort the filtered pieces immediately
    const sortedPieces = [...filteredPieces].sort((a, b) => {
      if (field === 'title') {
        return direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (field === 'composer') {
        return direction === 'asc'
          ? a.composer.localeCompare(b.composer)
          : b.composer.localeCompare(a.composer);
      } else if (field === 'level') {
        return direction === 'asc'
          ? levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
          : levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
      }
      return 0;
    });
    setFilteredPieces(sortedPieces);
  };


  return (
    <div>
      <Head>
        <title>Cello Music</title>
      </Head>

      <NavbarMain />

      {/* Overlay to close mobile filter and sort */}
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
          {/* Top Section: Header, Sort & View Dropdowns */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Cello Music</h1>

            {/* Desktop: Sort & View Dropdowns */}
            <div className="hidden md:flex items-center space-x-2">
              <label className="text-white font-medium text-sm" htmlFor="sort-by">
                Sort By:
              </label>
              <select
                id="sort-by"
                defaultValue="level-asc" // Set the default value here
                className="border border-gray-300 rounded-md p-1 text-black font-medium text-sm bg-white focus:outline-none"
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="title-asc">Alphabetically (A-Z)</option>
                <option value="title-desc">Alphabetically (Z-A)</option>
                <option value="level-asc">Level (Low to High)</option>
                <option value="level-desc">Level (High to Low)</option>
                <option value="composer-desc">Composer (A-Z)</option>
              </select>

              <select
                value={viewMode}
                onChange={(e) =>
                  setViewMode(e.target.value as 'card' | 'list')
                }
                className="border border-gray-300 rounded-md p-1 text-black font-medium text-sm bg-white focus:outline-none"
              >
                <option value="card">Grid View</option>
                <option value="list">List View</option>
              </select>
            </div>

            {/* Mobile: Filter, Sort & View Icons */}
            <div className="flex flex-row md:hidden justify-center space-x-2 items-center">

              <button
                className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                onClick={() => setIsFilterVisible(true)}
              >
                <IoFilter />
              </button>

              <div className="relative">
                <button
                  className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                >
                  <IoSwapVertical className="text-white" />
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

              {/* Grid/List View Toggle Icon */}
              <button
                className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
              >
                {viewMode === 'card' ? (
                  <>
                    <IoList className="text-white" />
                  </>
                ) : (
                  <>
                    <IoGrid className="text-white" />
                  </>
                )}
              </button>
            </div>


          </div>

          {/* Conditionally Render Music Cards or List View */}
          {viewMode === 'card' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPieces.map((piece) => (
                <MusicCard
                  key={piece.id}
                  id={piece.id}
                  title={piece.title}
                  composer_last_name={piece.composer_last_name}
                  composer_first_name={piece.composer_first_name}
                  level={piece.level}
                  instrumentation={piece.instrumentation}
                />
              ))}
            </div>
          ) : (
            <MusicListView
              pieces={filteredPieces}
              sortConfig={sortConfig}
              onSort={onSort}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Music;
