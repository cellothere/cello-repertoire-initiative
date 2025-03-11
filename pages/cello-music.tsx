import { NextPage } from 'next';
import Head from 'next/head';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
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
  composer_last_name: string;
  composer_first_name: string;
  level: string;
  instrumentation: string[];
  nationality: string[];
  duration: string;
}

interface Composer {
  composer_full_name: string;
  composer_last_name: string;
  composer_first_name: string;
  bio_links: string[];
}

const Music: NextPage = () => {
  const router = useRouter();

  // States for data and filters
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<MusicPiece[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<number>(1600);
  const [maxYear, setMaxYear] = useState<number>(2025);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  // UI controls
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 20 : 16;

  // Wrap levelOrder in useMemo so its reference is stable
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

  // Accordion content for filtering
  const [accordionContent, setAccordionContent] = useState({
    Level: levelOrder,
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

  // --- 1. Read Query Parameters on Mount ---
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
          Array.isArray(qSelectedComposers)
            ? qSelectedComposers as string[]
            : [qSelectedComposers as string]
        );
      }
      if (qSelectedLevels) {
        setSelectedLevels(
          Array.isArray(qSelectedLevels)
            ? qSelectedLevels as string[]
            : [qSelectedLevels as string]
        );
      }
      if (qSelectedInstruments) {
        setSelectedInstruments(
          Array.isArray(qSelectedInstruments)
            ? qSelectedInstruments as string[]
            : [qSelectedInstruments as string]
        );
      }
      if (qSelectedCountries) {
        setSelectedCountries(
          Array.isArray(qSelectedCountries)
            ? qSelectedCountries as string[]
            : [qSelectedCountries as string]
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

  // --- 2. Update URL Query When Filters Change ---
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

  // Fetch music pieces from API
  useEffect(() => {
    const fetchPieces = async () => {
      const res = await fetch('/api/celloMusic');
      const data = await res.json();
      const flattenedPieces = data.flatMap((group: { musicPieces: MusicPiece[] }) => group.musicPieces);
      const sortedPieces = flattenedPieces.sort(
        (a: MusicPiece, b: MusicPiece) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
      );
      setPieces(sortedPieces);
      setFilteredPieces(sortedPieces);
      setSortConfig({ field: 'level', direction: 'asc' });
    };
    fetchPieces();
  }, [levelOrder]);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [filteredPieces]);

  useEffect(() => {
    const fetchNationalities = async () => {
      const res = await fetch('/api/nationalities');
      const data: { nationality: string }[] = await res.json();
      const countries = data.map((item) => item.nationality);
      setAccordionContent((prev) => ({ ...prev, Country: countries }));
    };
    fetchNationalities();
  }, []);

  useEffect(() => {
    const fetchComposers = async () => {
      const res = await fetch('/api/composers');
      const data = await res.json();
      const composers = data
        .map((group: { composers: Composer[] }) =>
          group.composers.map((composer) => composer.composer_full_name)
        )
        .flat();
      setAccordionContent((prev) => ({ ...prev, Composer: composers }));
    };
    fetchComposers();
  }, []);

  const removeDiacritics = (str: string): string =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const totalPages = Math.ceil(filteredPieces.length / itemsPerPage);
  const paginatedPieces = filteredPieces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const convertDurationToSeconds = (duration: string): number | null => {
    const parts = duration.split(':');
    if (parts.length !== 3) return null;
    const [hours, minutes, seconds] = parts.map(Number);
    if (hours === 0 && minutes === 0 && seconds === 0) return null;
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Place this function (or useMemo) inside your component, before the return statement.
  const paginationItems = useMemo((): (number | string)[] => {
    const items: (number | string)[] = [];
    if (totalPages <= 5) {
      // If there are 7 or fewer pages, show all of them.
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else if (currentPage <= 4) {
      // Near the beginning: show first 5 pages, ellipsis, then last page.
      for (let i = 1; i <= 5; i++) {
        items.push(i);
      }
      items.push('...');
      items.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Near the end: show first page, ellipsis, then the last 5 pages.
      items.push(1);
      items.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // In the middle: show first page, ellipsis, current-1, current, current+1, ellipsis, last page.
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


  // Memoize compareDurations so that its reference remains stable.
  const compareDurations = useCallback(
    (aDuration: string | undefined, bDuration: string | undefined, direction: 'asc' | 'desc'): number => {
      const isValid = (duration: string | undefined) =>
        duration !== undefined && duration !== '00:00:00';
      const aValid = isValid(aDuration);
      const bValid = isValid(bDuration);
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      if (!aValid && !bValid) return 0;
      const secondsA = convertDurationToSeconds(aDuration!);
      const secondsB = convertDurationToSeconds(bDuration!);
      if (secondsA === null || secondsB === null) return 0;
      return direction === 'asc' ? secondsA - secondsB : secondsB - secondsA;
    },
    []
  );

  // Filter and sort pieces based on filter state
  useEffect(() => {
    let filtered = pieces.filter((piece) => {
      const titleMatch = removeDiacritics(piece.title.toLowerCase()).includes(
        removeDiacritics(filter.toLowerCase())
      );
      const composerMatch = removeDiacritics(piece.composer.toLowerCase()).includes(
        removeDiacritics(filter.toLowerCase())
      );
      const composerFilterMatch =
        selectedComposers.length === 0 || selectedComposers.includes(piece.composer);
      const levelFilterMatch =
        selectedLevels.length === 0 || selectedLevels.includes(piece.level);
      const countryFilterMatch =
        selectedCountries.length === 0 || piece.nationality.some((nat) => selectedCountries.includes(nat));
      const pieceYear = parseInt((piece as any).composition_year || '0', 10);
      const validYear = !isNaN(pieceYear) && pieceYear > 0;
      const yearFilterMatch = validYear && pieceYear >= minYear && pieceYear <= maxYear;
      const instrumentationMatch =
        selectedInstruments.length === 0 ||
        selectedInstruments.some((selectedInstrument) => {
          const normalizedSelectedInstrument =
            selectedInstrument === 'Cello Solo' ? 'Cello' : selectedInstrument;
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
      return (
        (titleMatch || composerMatch) &&
        composerFilterMatch &&
        levelFilterMatch &&
        countryFilterMatch &&
        instrumentationMatch &&
        yearFilterMatch
      );
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
  }, [
    filter,
    pieces,
    selectedComposers,
    selectedLevels,
    selectedCountries,
    selectedInstruments,
    minYear,
    maxYear,
    sortConfig,
    levelOrder,
    compareDurations,
  ]);

  // Toggle functions for checkboxes
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

  const onSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
    const sortedPieces = [...filteredPieces].sort((a, b) => {
      switch (field) {
        case 'title':
          return direction === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case 'composer':
          return direction === 'asc'
            ? a.composer_last_name.localeCompare(b.composer_last_name)
            : b.composer_last_name.localeCompare(a.composer_last_name);
        case 'level':
          return direction === 'asc'
            ? levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
            : levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
        case 'instrumentation':
          const lenDiff =
            direction === 'asc'
              ? a.instrumentation.length - b.instrumentation.length
              : b.instrumentation.length - a.instrumentation.length;
          if (lenDiff !== 0) return lenDiff;
          const secondA = a.instrumentation[1] || '';
          const secondB = b.instrumentation[1] || '';
          return direction === 'asc'
            ? secondA.localeCompare(secondB)
            : secondB.localeCompare(secondA);
        case 'duration':
          return compareDurations(a.duration, b.duration, direction);
        default:
          return 0;
      }
    });
    setFilteredPieces(sortedPieces);
  };

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
    const sortedPieces = [...filteredPieces].sort((a, b) => {
      if (field === 'title') {
        return direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (field === 'composer') {
        return direction === 'asc'
          ? a.composer_last_name.localeCompare(b.composer_last_name)
          : b.composer_last_name.localeCompare(a.composer_last_name);
      } else if (field === 'level') {
        return direction === 'asc'
          ? levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
          : levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level);
      }
      return 0;
    });
    setFilteredPieces(sortedPieces);
  };

  const mobileFilterRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <Head>
        <title>Cello Music</title>
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
            ref={mobileFilterRef}
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
              <label className="text-white font-medium text-sm" htmlFor="sort-by">Sort By:</label>
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
            <MusicListView pieces={paginatedPieces} sortConfig={sortConfig} onSort={onSort} />
          )}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4">
              <button
                className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {paginationItems.map((item, index) => {
                if (item === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-3 py-1 mx-1">
                      {item}
                    </span>
                  );
                }
                return (
                  <button
                    key={item}
                    className={`px-3 py-1 mx-1 border rounded ${currentPage === item ? 'bg-black text-white' : 'bg-white text-black'}`}
                    onClick={() => setCurrentPage(item as number)}
                  >
                    {item}
                  </button>
                );
              })}
              <button
                className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Music;
