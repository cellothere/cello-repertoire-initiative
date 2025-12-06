import { NextPage } from 'next';
import Head from 'next/head';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import NavbarMain from '@/components/navbar-main';
import FilterAside from '@/components/filter-search';
import MobileFilterAccordion from '@/components/mobile-filter-search';
import MusicCard from '@/components/music-card';
import MusicListView from '@/components/music-list-view';
import LoadingAnimation from '@/components/loading-animation';
import { removeDiacritics, compareDurations } from '@/utils/musicUtils';
import techniqueKeywords from '@/utils/techniqueKeywords';

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
  technique_focus?: string[]; // New field for technical focus points
}

interface Composer {
  composer_full_name: string;
  composer_last_name: string;
  composer_first_name: string;
  bio_links: string[];
}

type SortConfig = { field: string; direction: 'asc' | 'desc' };

const CelloMusic: NextPage = () => {
  const router = useRouter();

  // Data and filter states
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTechnicalFocus, setSelectedTechnicalFocus] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<number>(1600);
  const [maxYear, setMaxYear] = useState<number>(2025);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'level', direction: 'asc' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // UI control states
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 10 : 20;

  // Keep levelOrder stable across renders
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

  // Accordion content for filtering; include a new category for Technical Focus.
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
    'Technical Focus': [] as string[],
    Year: [],
  });

  // Ref to store initial filter values from the URL query parameters.
  const initialFilters = useRef({
    filter: '',
    selectedComposers: [] as string[],
    selectedLevels: [] as string[],
    selectedInstruments: [] as string[],
    selectedCountries: [] as string[],
    selectedTechnicalFocus: [] as string[],
    minYear: 1600,
    maxYear: 2025,
  });

  // 1. Read query parameters on mount and update initialFilters.
  useEffect(() => {
    if (router.isReady) {
      const {
        filter: qFilter,
        selectedComposers: qSelectedComposers,
        selectedLevels: qSelectedLevels,
        selectedInstruments: qSelectedInstruments,
        selectedCountries: qSelectedCountries,
        selectedTechnicalFocus: qSelectedTechnicalFocus,
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
            ? (qSelectedComposers as string[])
            : [qSelectedComposers as string]
        );
      }
      if (qSelectedLevels) {
        setSelectedLevels(
          Array.isArray(qSelectedLevels)
            ? (qSelectedLevels as string[])
            : [qSelectedLevels as string]
        );
      }
      if (qSelectedInstruments) {
        setSelectedInstruments(
          Array.isArray(qSelectedInstruments)
            ? (qSelectedInstruments as string[])
            : [qSelectedInstruments as string]
        );
      }
      if (qSelectedCountries) {
        setSelectedCountries(
          Array.isArray(qSelectedCountries)
            ? (qSelectedCountries as string[])
            : [qSelectedCountries as string]
        );
      }
      if (qSelectedTechnicalFocus) {
        setSelectedTechnicalFocus(
          Array.isArray(qSelectedTechnicalFocus)
            ? (qSelectedTechnicalFocus as string[])
            : [qSelectedTechnicalFocus as string]
        );
      }
      if (qMinYear) setMinYear(Number(qMinYear));
      if (qMaxYear) setMaxYear(Number(qMaxYear));
      if (qPage) setCurrentPage(Number(qPage));
      if (qViewMode) setViewMode(qViewMode as 'card' | 'list');
      if (sortField && sortDirection) {
        setSortConfig({ field: sortField as string, direction: sortDirection as 'asc' | 'desc' });
      }

      // Save the initial filters (excluding page, viewMode, sort config, etc.)
      initialFilters.current = {
        filter: qFilter ? (qFilter as string) : '',
        selectedComposers: qSelectedComposers
          ? Array.isArray(qSelectedComposers)
            ? (qSelectedComposers as string[])
            : [qSelectedComposers as string]
          : [],
        selectedLevels: qSelectedLevels
          ? Array.isArray(qSelectedLevels)
            ? (qSelectedLevels as string[])
            : [qSelectedLevels as string]
          : [],
        selectedInstruments: qSelectedInstruments
          ? Array.isArray(qSelectedInstruments)
            ? (qSelectedInstruments as string[])
            : [qSelectedInstruments as string]
          : [],
        selectedCountries: qSelectedCountries
          ? Array.isArray(qSelectedCountries)
            ? (qSelectedCountries as string[])
            : [qSelectedCountries as string]
          : [],
        selectedTechnicalFocus: qSelectedTechnicalFocus
          ? Array.isArray(qSelectedTechnicalFocus)
            ? (qSelectedTechnicalFocus as string[])
            : [qSelectedTechnicalFocus as string]
          : [],
        minYear: qMinYear ? Number(qMinYear) : 1600,
        maxYear: qMaxYear ? Number(qMaxYear) : 2025,
      };
    }
  }, [router.isReady, router.query]);

  // 2. Update URL query when filters change.
  useEffect(() => {
    const query = {
      filter,
      selectedComposers,
      selectedLevels,
      selectedInstruments,
      selectedCountries,
      selectedTechnicalFocus,
      minYear,
      maxYear,
      page: currentPage,
      viewMode,
      sortField: sortConfig?.field,
      sortDirection: sortConfig?.direction,
    };
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    selectedComposers,
    selectedLevels,
    selectedInstruments,
    selectedCountries,
    selectedTechnicalFocus,
    minYear,
    maxYear,
    currentPage,
    viewMode,
    sortConfig,
    // router intentionally omitted to prevent circular dependency
  ]);

  // 3. Fetch data from APIs.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [piecesRes, nationalitiesRes, composersRes] = await Promise.all([
          fetch('/api/celloMusic'),
          fetch('/api/nationalities'),
          fetch('/api/composers'),
        ]);

        const piecesData = await piecesRes.json();
        const nationalitiesData: { nationality: string }[] = await nationalitiesRes.json();
        const composersData = await composersRes.json();

        const flattenedPieces = piecesData.flatMap(
          (group: { musicPieces: MusicPiece[] }) => group.musicPieces
        );
        setPieces(flattenedPieces);

        // Update Country options from fetched data.
        const countries = nationalitiesData.map((item) => item.nationality);
        setAccordionContent((prev) => ({ ...prev, Country: countries }));

        // Update Composer options.
        const composers = composersData
          .map((group: { composers: Composer[] }) =>
            group.composers.map((composer) => composer.composer_full_name)
          )
          .flat();
        setAccordionContent((prev) => ({ ...prev, Composer: composers }));

        // Populate Technical Focus options from pieces.
        setAccordionContent((prev) => ({
          ...prev,
          'Technical Focus': techniqueKeywords,
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 4. Optimized filtering and sorting.
  const normalizedFilter = useMemo(() => removeDiacritics(filter.toLowerCase()), [filter]);

  const filteredPieces = useMemo(() => {
    return pieces
      .filter((piece) => {
        const titleNormalized = removeDiacritics(piece.title.toLowerCase());
        const composerNormalized = removeDiacritics(piece.composer.toLowerCase());
        const titleMatch = titleNormalized.includes(normalizedFilter);
        const composerMatch = composerNormalized.includes(normalizedFilter);
        const composerFilterMatch = selectedComposers.length === 0 || selectedComposers.includes(piece.composer);
        const levelFilterMatch = selectedLevels.length === 0 || selectedLevels.includes(piece.level);
        const countryFilterMatch =
          selectedCountries.length === 0 || piece.nationality.some((nat) => selectedCountries.includes(nat));

        const pieceYear = parseInt(piece.composition_year || '0', 10);
        const validYear = !isNaN(pieceYear) && pieceYear > 0;
        const yearFilterMatch = validYear && pieceYear >= minYear && pieceYear <= maxYear;

        const normalizedInstrumentation = Array.isArray(piece.instrumentation)
          ? piece.instrumentation.map((instr) =>
              instr.toLowerCase() === 'cello solo' ? 'cello' : instr.toLowerCase()
            )
          : [];
        const instrumentationMatch =
          selectedInstruments.length === 0 ||
          selectedInstruments.some((selectedInstrument) => {
            const normalizedSelected = selectedInstrument === 'Cello Solo' ? 'cello' : selectedInstrument.toLowerCase();
            if (normalizedSelected === 'cello duet') {
              return (
                normalizedInstrumentation.length === 2 &&
                normalizedInstrumentation.every((instr) => instr === 'cello')
              );
            }
            const selectedParts = normalizedSelected.split(' and ');
            if (selectedParts.length === 1) {
              return (
                normalizedInstrumentation.length === 1 &&
                normalizedInstrumentation.includes(selectedParts[0])
              );
            }
            return selectedParts.every((part) => normalizedInstrumentation.includes(part));
          });

        // Technical Focus filter.
        const technicalFocusFilterMatch =
          selectedTechnicalFocus.length === 0 ||
          (piece.technique_focus &&
            piece.technique_focus.some((focus) =>
              selectedTechnicalFocus.some(
                (selectedFocus) =>
                  removeDiacritics(selectedFocus.toLowerCase()) === removeDiacritics(focus.toLowerCase())
              )
            ));

        return (
          (titleMatch || composerMatch) &&
          composerFilterMatch &&
          levelFilterMatch &&
          countryFilterMatch &&
          instrumentationMatch &&
          yearFilterMatch &&
          technicalFocusFilterMatch
        );
      })
      .sort((a, b) => {
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
  }, [
    pieces,
    normalizedFilter,
    selectedComposers,
    selectedLevels,
    selectedCountries,
    selectedInstruments,
    minYear,
    maxYear,
    sortConfig,
    levelOrder,
    selectedTechnicalFocus,
  ]);

  // Reset current page when filters change, but only if the current filter state differs from the initial filters.
  useEffect(() => {
    const currentFilters = {
      filter,
      selectedComposers,
      selectedLevels,
      selectedInstruments,
      selectedCountries,
      selectedTechnicalFocus,
      minYear,
      maxYear,
    };

    if (JSON.stringify(currentFilters) !== JSON.stringify(initialFilters.current)) {
      setCurrentPage(1);
    }
  }, [
    filter,
    selectedComposers,
    selectedLevels,
    selectedInstruments,
    selectedCountries,
    selectedTechnicalFocus,
    minYear,
    maxYear,
  ]);

  // 5. Pagination calculation.
  const totalPages = Math.ceil(filteredPieces.length / itemsPerPage);

  const paginatedPieces = useMemo(() => {
    return filteredPieces.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredPieces, currentPage, itemsPerPage]);

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

  // 6. Sort handlers - simplified with lookup object
  const handleSort = useCallback((sortOption: string) => {
    const sortOptions: Record<string, SortConfig> = {
      'title-asc': { field: 'title', direction: 'asc' },
      'title-desc': { field: 'title', direction: 'desc' },
      'level-asc': { field: 'level', direction: 'asc' },
      'level-desc': { field: 'level', direction: 'desc' },
      'composer-asc': { field: 'composer', direction: 'asc' },
      'composer-desc': { field: 'composer', direction: 'desc' },
    };

    const config = sortOptions[sortOption];
    if (config) {
      setSortConfig(config);
    }
  }, []);

  const onSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  // 7. Checkbox toggle handlers.
  const toggleComposerSelection = useCallback((composer: string) => {
    setSelectedComposers((prev) =>
      prev.includes(composer) ? prev.filter((c) => c !== composer) : [...prev, composer]
    );
  }, []);

  const toggleCountrySelection = useCallback((country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  }, []);

  const toggleLevelSelection = useCallback((level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }, []);

  const toggleInstrumentSelection = useCallback((instrument: string) => {
    const normalizedInstrument = instrument === 'Cello Solo' ? 'Cello' : instrument;
    setSelectedInstruments((prev) =>
      prev.includes(normalizedInstrument)
        ? prev.filter((i) => i !== normalizedInstrument)
        : [...prev, normalizedInstrument]
    );
  }, []);

  const toggleTechnicalFocusSelection = useCallback((focus: string) => {
    setSelectedTechnicalFocus((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
  }, []);

  const mobileFilterRef = useRef<HTMLDivElement>(null);

  // Compute filter count from filter-related states.
  const filterCount = useMemo(() => {
    return (
      selectedComposers.length +
      selectedLevels.length +
      selectedInstruments.length +
      selectedCountries.length +
      selectedTechnicalFocus.length +
      (minYear !== 1600 || maxYear !== 2025 ? 1 : 0)
    );
  }, [selectedComposers, selectedLevels, selectedInstruments, selectedCountries, selectedTechnicalFocus, minYear, maxYear]);

  // Clear filters function - optimized to directly set state
  const clearFilters = useCallback(() => {
    setFilter('');
    setSelectedComposers([]);
    setSelectedLevels([]);
    setSelectedInstruments([]);
    setSelectedCountries([]);
    setSelectedTechnicalFocus([]);
    setMinYear(1600);
    setMaxYear(2025);
    setCurrentPage(1);
  }, []);

  if (isLoading) return <LoadingAnimation />;

  return (
    <div>
      <Head>
        <title>Cello Music</title>
        <meta
          name="description"
          content="Discover and explore a curated collection of cello music pieces, composers, and arrangements designed for amateur and professional cellists."
        />
        <meta name="keywords" content="Cello, Music, Composers, Music Pieces, Classical, Cello Music" />
        <link rel="canonical" href="https://www.cellorepertoire.com/" />
        <meta property="og:title" content="Cello Music" />
        <meta
          property="og:description"
          content="Discover and explore a curated collection of cello music pieces, composers, and arrangements designed for amateur and professional cellists."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.cellorepertoire.com/cello-music" />
        <meta property="og:image" content="https://www.cellorepertoire.com/_next/image?url=%2Fassets%2FaltLogo.png&w=256&q=75" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cello Music" />
        <meta
          name="twitter:description"
          content="Discover and explore a curated collection of cello music pieces, composers, and arrangements designed for amateur and professional cellists."
        />
        <meta name="twitter:image" content="https://www.cellorepertoire.com/_next/image?url=%2Fassets%2FaltLogo.png&w=256&q=75" />
      </Head>
      <NavbarMain />
      {/* Mobile overlay for filters and sort */}
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
          accordionContent={accordionContent}
          selectedComposers={selectedComposers}
          toggleComposerSelection={toggleComposerSelection}
          selectedLevels={selectedLevels}
          toggleLevelSelection={toggleLevelSelection}
          selectedInstruments={selectedInstruments}
          toggleInstrumentSelection={toggleInstrumentSelection}
          selectedCountries={selectedCountries}
          toggleCountrySelection={toggleCountrySelection}
          selectedTechnicalFocus={selectedTechnicalFocus}
          toggleTechnicalFocusSelection={toggleTechnicalFocusSelection}
          minYear={minYear}
          maxYear={maxYear}
          setMinYear={setMinYear}
          setMaxYear={setMaxYear}
          setCurrentPage={setCurrentPage}
        />
        {/* Mobile Filter Accordion */}
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
              selectedTechnicalFocus={selectedTechnicalFocus}
              toggleTechnicalFocusSelection={toggleTechnicalFocusSelection}
              minYear={minYear}
              maxYear={maxYear}
              setMinYear={setMinYear}
              setMaxYear={setMaxYear}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
        <main className="md:ml-1 w-full container mx-auto p-4">
          <div className="flex flex-col items-center justify-center mb-6 space-y-4 md:flex-row md:justify-between md:items-center">
            <h1 className="text-3xl font-bold text-white text-center">Cello Music</h1>
            <div className="hidden md:flex items-center space-x-2">
              <label className="text-white font-medium text-sm" htmlFor="sort-by">
                Sort By:
              </label>
              <select
                id="sort-by"
                value={`${sortConfig.field}-${sortConfig.direction}`}
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
                <div>Filter{filterCount > 0 ? ` (${filterCount})` : ''}</div>
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
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('title-asc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Title A-Z
                    </button>
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('title-desc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Title Z-A
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
                        handleSort('composer-asc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Composer (A-Z)
                    </button>
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        handleSort('composer-desc');
                        setIsSortMenuOpen(false);
                      }}
                    >
                      Composer (Z-A)
                    </button>
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
            <div className="grid grid-cols-2 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {paginatedPieces.map((piece) => (
                <MusicCard
                  key={piece.id}
                  id={piece.id}
                  instrument='cello'
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

export default CelloMusic;
