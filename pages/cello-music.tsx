// pages/music.tsx
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamic imports for non-critical or heavy components
const FilterAside = dynamic(() => import('@/components/filter-search'));
const MobileFilterAccordion = dynamic(() => import('@/components/mobile-filter-search'), { ssr: false });
const MusicCard = dynamic(() => import('@/components/music-card'));
const MusicListView = dynamic(() => import('@/components/music-list-view'));
const LoadingAnimation = dynamic(() => import('@/components/loading-animation'));
import NavbarMain from '@/components/navbar-main';
import { removeDiacritics, compareDurations } from '@/utils/musicUtils';

// Types (adjust as needed)
interface MusicPiece {
  id: number;
  title: string;
  composer: string;
  composer_last_name: string;
  composer_first_name: string;
  level: string;
  instrumentation: string[];
  nationality: string[];
  duration: string;
  composition_year?: string;
}

interface AccordionContent {
  [key: string]: string[];
  Level: string[];
  Instrumentation: string[];
  Composer: string[];
  Country: string[];
  Year: any[];
}

interface MusicPageProps {
  initialPieces: MusicPiece[];
  initialAccordionContent: AccordionContent;
}

const Music: NextPage<MusicPageProps> = ({ initialPieces, initialAccordionContent }) => {
  const router = useRouter();

  // Initialize state from pre-fetched props
  const [pieces, setPieces] = useState<MusicPiece[]>(initialPieces);
  const [filteredPieces, setFilteredPieces] = useState<MusicPiece[]>(initialPieces);
  const [accordionContent, setAccordionContent] = useState<AccordionContent>(initialAccordionContent);

  // Filter & UI state
  const [filter, setFilter] = useState<string>('');
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<number>(1600);
  const [maxYear, setMaxYear] = useState<number>(2025);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'level', direction: 'asc' });
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (router.isReady) {
      const {
        filter: qFilter,
        selectedComposers: qSelectedComposers,
        selectedLevels: qSelectedLevels,
        selectedInstruments: qSelectedInstruments,
        selectedCountries: qSelectedCountries,
        minYear: qMinYear,
        maxYear: qMaxYear,
        page: qPage,
        viewMode: qViewMode,
        sortField,
        sortDirection,
      } = router.query;
  
      if (qFilter) setFilter(qFilter as string);
      if (qSelectedComposers) {
        setSelectedComposers(
          Array.isArray(qSelectedComposers) ? qSelectedComposers : [qSelectedComposers as string]
        );
      }
      if (qSelectedLevels) {
        setSelectedLevels(
          Array.isArray(qSelectedLevels) ? qSelectedLevels : [qSelectedLevels as string]
        );
      }
      if (qSelectedInstruments) {
        setSelectedInstruments(
          Array.isArray(qSelectedInstruments) ? qSelectedInstruments : [qSelectedInstruments as string]
        );
      }
      if (qSelectedCountries) {
        setSelectedCountries(
          Array.isArray(qSelectedCountries) ? qSelectedCountries : [qSelectedCountries as string]
        );
      }
      if (qMinYear) setMinYear(Number(qMinYear));
      if (qMaxYear) setMaxYear(Number(qMaxYear));
      if (qPage) setCurrentPage(Number(qPage));
      if (qViewMode) setViewMode(qViewMode as 'card' | 'list');
      if (sortField && sortDirection) {
        setSortConfig({ field: sortField as string, direction: sortDirection as 'asc' | 'desc' });
      }
    }
  }, [router.isReady]);
  

  // Handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 20 : 16;

  // Keep level order stable across renders
  const levelOrder = useMemo(() => [
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
  ], []);

  // 1. Update URL Query When Filters Change
  useEffect(() => {
    const query = {
      filter,
      selectedComposers,
      selectedLevels,
      selectedInstruments,
      selectedCountries,
      minYear,
      maxYear,
      page: currentPage,
      viewMode,
      sortField: sortConfig?.field,
      sortDirection: sortConfig?.direction,
    };
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [
    filter,
    selectedComposers,
    selectedLevels,
    selectedInstruments,
    selectedCountries,
    minYear,
    maxYear,
    currentPage,
    viewMode,
    sortConfig,
    router.pathname,
  ]);

  // 2. Unified Filter & Sort Effect
  useEffect(() => {
    let filtered = pieces.filter((piece) => {
      const titleMatch = removeDiacritics(piece.title.toLowerCase()).includes(removeDiacritics(filter.toLowerCase()));
      const composerMatch = removeDiacritics(piece.composer.toLowerCase()).includes(removeDiacritics(filter.toLowerCase()));
      const composerFilterMatch = selectedComposers.length === 0 || selectedComposers.includes(piece.composer);
      const levelFilterMatch = selectedLevels.length === 0 || selectedLevels.includes(piece.level);
      const countryFilterMatch = selectedCountries.length === 0 || piece.nationality.some((nat) => selectedCountries.includes(nat));
      const pieceYear = parseInt(piece.composition_year || '0', 10);
      const validYear = !isNaN(pieceYear) && pieceYear > 0;
      const yearFilterMatch = validYear && pieceYear >= minYear && pieceYear <= maxYear;
      const instrumentationMatch = selectedInstruments.length === 0 || selectedInstruments.some((selectedInstrument) => {
        const normalizedSelectedInstrument = selectedInstrument === 'Cello Solo' ? 'Cello' : selectedInstrument;
        if (Array.isArray(piece.instrumentation)) {
          const normalizedInstrumentation = piece.instrumentation.map((instr) =>
            instr.toLowerCase() === 'cello solo' ? 'cello' : instr.toLowerCase()
          );
          if (normalizedSelectedInstrument.toLowerCase() === 'cello duet') {
            return (
              normalizedInstrumentation.length === 2 &&
              normalizedInstrumentation.every((instr) => instr === 'cello')
            );
          }
          const selectedParts = normalizedSelectedInstrument.toLowerCase().split(' and ');
          if (selectedParts.length === 1) {
            return (
              normalizedInstrumentation.length === 1 &&
              normalizedInstrumentation.includes(selectedParts[0])
            );
          }
          return selectedParts.every((part) => normalizedInstrumentation.includes(part));
        }
        return false;
      });
      return (titleMatch || composerMatch) && composerFilterMatch && levelFilterMatch && countryFilterMatch && instrumentationMatch && yearFilterMatch;
    });

    if (sortConfig) {
      filtered = filtered.sort((a, b) => {
        switch (sortConfig.field) {
          case 'title':
            return sortConfig.direction === 'asc'
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          case 'composer':
            return sortConfig.direction === 'asc'
              ? a.composer_last_name.localeCompare(b.composer_last_name)
              : b.composer_last_name.localeCompare(a.composer_last_name);
          case 'level':
            return sortConfig.direction === 'asc'
              ? levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
              : levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
          case 'duration':
            return compareDurations(a.duration, b.duration, sortConfig.direction);
          default:
            return 0;
        }
      });
    }
    setFilteredPieces(filtered);
    // Reset page when filters change
    setCurrentPage(1);
  }, [
    pieces,
    filter,
    selectedComposers,
    selectedLevels,
    selectedCountries,
    selectedInstruments,
    minYear,
    maxYear,
    sortConfig,
    levelOrder,
  ]);

  // 3. Pagination Calculation
  const totalPages = Math.ceil(filteredPieces.length / itemsPerPage);
  const paginatedPieces = filteredPieces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginationItems = useMemo((): (number | string)[] => {
    const items: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) items.push(i);
      items.push('...');
      items.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      items.push(1);
      items.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      items.push('...');
      items.push(currentPage - 1);
      items.push(currentPage);
      items.push(currentPage + 1);
      items.push('...');
      items.push(totalPages);
    }
    return items;
  }, [totalPages, currentPage]);

  // 4. Sort Handlers
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
      case 'composer-asc':
        field = 'composer';
        direction = 'asc';
        break;
      case 'composer-desc':
        field = 'composer';
        direction = 'desc';
        break;
      default:
        break;
    }
    setSortConfig({ field, direction });
  };

  // 5. Checkbox Toggle Handlers
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

  if (!pieces.length) {
    return <LoadingAnimation />;
  }

  return (
    <div>
      <Head>
        <title>Cello Music</title>
        <meta
          name="description"
          content="Discover and explore a curated collection of cello music pieces, composers, and arrangements designed for music enthusiasts."
        />
        <meta name="keywords" content="Cello, Music, Composers, Music Pieces, Classical, Cello Music" />
        <link rel="canonical" href="https://www.cellorepertoire.com/" />

        {/* Open Graph and Twitter meta tags can be added here */}
      </Head>
      <NavbarMain />
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
          setCurrentPage={setCurrentPage}
        />

        {isFilterVisible && (
          <div
            className="md:hidden fixed inset-0 ml-20 bg-white z-50 overflow-y-auto p-5 transition-transform transform animate-slideIn"
            aria-label="Mobile Filter Drawer"
            onClick={(e) => e.stopPropagation()}
          >
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
              setCurrentPage={setCurrentPage}
              setMinYear={setMinYear}
              setMaxYear={setMaxYear}
            />
          </div>
        )}
        <main className="md:ml-4 w-full container mx-auto p-4">
          <div className="flex flex-col items-center justify-center mb-6 space-y-4 md:flex-row md:justify-between md:items-center">
            <h1 className="text-3xl font-bold text-white text-center">Cello Music</h1>
            <div className="hidden md:flex items-center space-x-2">
              <label className="text-white font-medium text-sm" htmlFor="sort-by">
                Sort By:
              </label>
              <select
                id="sort-by"
                defaultValue="level-asc"
                className="border border-gray-300 rounded-md p-1 text-black font-medium text-sm bg-white focus:outline-none"
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="level-asc">Level (Low to High)</option>
                <option value="level-desc">Level (High to Low)</option>
                <option value="composer-asc">Composer (A-Z)</option>
                <option value="composer-desc">Composer (Z-A)</option>
              </select>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'card' | 'list')}
                className="border border-gray-300 rounded-md p-1 text-black font-medium text-sm bg-white focus:outline-none"
              >
                <option value="card">Grid View</option>
                <option value="list">List View</option>
              </select>
            </div>
            <div className="flex flex-row md:hidden justify-center items-center space-x-2">
              <button
                className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                onClick={() => setIsFilterVisible(true)}
              >
                <div>Filter</div>
              </button>
              <div className="relative">
                <button
                  className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                >
                  <div>Sort</div>
                </button>
                {isSortMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-[200px] bg-white rounded text-black shadow-md p-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => { handleSort('title-asc'); setIsSortMenuOpen(false); }}>Title A-Z</button>
                    <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => { handleSort('title-desc'); setIsSortMenuOpen(false); }}>Title Z-A</button>
                    <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => { handleSort('level-asc'); setIsSortMenuOpen(false); }}>Level (Low → High)</button>
                    <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => { handleSort('level-desc'); setIsSortMenuOpen(false); }}>Level (High → Low)</button>
                    <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => { handleSort('composer-asc'); setIsSortMenuOpen(false); }}>Composer (A-Z)</button>
                    <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => { handleSort('composer-desc'); setIsSortMenuOpen(false); }}>Composer (Z-A)</button>
                  </div>
                )}
              </div>
              <button
                className="flex items-center text-white bg-black px-3 py-2 rounded-md"
                onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
              >
                {viewMode === 'card' ? <div>List View</div> : <div>Grid View</div>}
              </button>
            </div>
          </div>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5">
              {paginatedPieces.map((piece) => (
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
            <MusicListView pieces={paginatedPieces} sortConfig={sortConfig} onSort={(field) => {
              let direction: 'asc' | 'desc' = 'asc';
              if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
                direction = 'desc';
              }
              setSortConfig({ field, direction });
            }} />
          )}
          {totalPages > 1 && (
            <div className="w-full mt-5 overflow-x-auto px-2 pb-2 md:px-4 md:pb-4">
              <div className="inline-flex items-center justify-center w-full space-x-2 md:space-x-2 mt-2">
                <button
                  className="flex-shrink-0 px-2 py-1 md:px-3 md:py-2 border rounded text-xs md:text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {paginationItems.map((item, index) => {
                  if (item === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex-shrink-0 px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm"
                      >
                        {item}
                      </span>
                    );
                  }
                  return (
                    <button
                      key={item}
                      className={`flex-shrink-0 px-2 py-1 md:px-3 md:py-2 border rounded text-xs md:text-sm ${currentPage === item ? 'bg-black text-white' : 'bg-white text-black'}`}
                      onClick={() => setCurrentPage(item as number)}
                    >
                      {item}
                    </button>
                  );
                })}
                <button
                  className="flex-shrink-0 px-2 py-1 md:px-3 md:py-2 border rounded text-xs md:text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  // Replace 'http://localhost:3000' with your actual domain or use environment variables in production
  const piecesRes = await fetch('http://localhost:3000/api/celloMusic');
  const piecesData = await piecesRes.json();
  const pieces = piecesData.flatMap((group: { musicPieces: MusicPiece[] }) => group.musicPieces);

  const nationalitiesRes = await fetch('http://localhost:3000/api/nationalities');
  const nationalitiesData: { nationality: string }[] = await nationalitiesRes.json();

  const composersRes = await fetch('http://localhost:3000/api/composers');
  const composersData = await composersRes.json();

  const accordionContent: AccordionContent = {
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
    Composer: composersData
      ? composersData.map((group: { composers: any[] }) =>
          group.composers.map((composer) => composer.composer_full_name)
        ).flat()
      : [],
    Country: nationalitiesData ? nationalitiesData.map((item) => item.nationality) : [],
    Year: [],
  };

  return {
    props: {
      initialPieces: pieces,
      initialAccordionContent: accordionContent,
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  };
};

export default Music;
