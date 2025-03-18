import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import NavbarMain from '@/components/navbar-main';
import MusicCard from '@/components/music-card';
import MusicListView from '@/components/music-list-view';
import LoadingAnimation from '@/components/loading-animation';
import { sortPieces, SortConfig } from '@/utils/sortUtils';
import { indigenousKeywords } from '@/utils/indigenousKeywords';
import { compareDurations } from '@/utils/musicUtils';

interface MusicPiece {
  _id?: string;
  id: number;
  title: string;
  composer: string;
  composer_last_name: string;
  composer_first_name: string;
  composition_year: string;
  level: string;
  instrumentation: string[];
  nationality?: string | string[];
  duration: string;
  tags?: string[]; 
}


interface Composer {
  composer_full_name: string;
  composer_last_name: string;
  composer_first_name: string;
  born?: string;
  died?: string;
  composer_bio?: string;
  bio_link: string[];
  nationality: string | string[];
  tags: string[];
  id: number;
}

const LEVEL_ORDER = [
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

const FeaturedDatabases: NextPage = () => {
  const [composers, setComposers] = useState<Composer[]>([]);
  const [allPieces, setAllPieces] = useState<MusicPiece[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Woman');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'level', direction: 'asc' });
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // onSort callback for MusicListView.
  const onSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  // Fetch data once on mount.
  const fetchData = async () => {
    try {
      setLoading(true);
      const composersRes = await fetch('/api/composers');
      const composersData = await composersRes.json();
      const composersFlat: Composer[] = composersData.flatMap(
        (group: { composers: Composer[] }) => group.composers
      );
      setComposers(composersFlat);

      const piecesRes = await fetch('/api/celloMusic');
      const piecesData = await piecesRes.json();
      const allPiecesFlat: MusicPiece[] = piecesData.flatMap(
        (group: { musicPieces: MusicPiece[] }) => group.musicPieces
      );
      setAllPieces(allPiecesFlat);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Run only once on mount.

  const featuredPieces = useMemo(() => {
    if (composers.length === 0 || allPieces.length === 0) return [];
  
    let filteredComposers: Composer[] = [];
    if (selectedCategory === 'Indigenous') {
      filteredComposers = composers.filter((composer) => {
        if (composer.nationality) {
          const nationalities = Array.isArray(composer.nationality)
            ? composer.nationality
            : [composer.nationality];
          return nationalities.some((nat) =>
            indigenousKeywords.some((keyword) => nat.toLowerCase().includes(keyword))
          );
        }
        return false;
      });
    } else {
      filteredComposers = composers.filter(
        (composer) => composer.tags && composer.tags.includes(selectedCategory)
      );
    }
  
    const composerNames = new Set(filteredComposers.map((composer) => composer.composer_full_name));
    const filteredPieces = allPieces.filter((piece) => {
      // Check if piece's composer is already part of the filtered composers.
      if (composerNames.has(piece.composer)) return true;
  
      // Additional condition for pieces with 'Traditional' composer
      // and tags that match "Black Spiritual" or "Black Sprituals".
      if (
        selectedCategory === 'Black' &&
        piece.composer === 'Traditional' &&
        piece.tags &&
        (piece.tags.includes("Black Spiritual") || piece.tags.includes("Black Spirtuals"))
      ) {
        return true;
      }
      return false;
    });
  
    return [...filteredPieces].sort((a, b) => {
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
            ? LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
            : LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level);
        case 'duration':
          return compareDurations(a.duration, b.duration, sortConfig.direction);
        default:
          return 0;
      }
    });
  }, [composers, allPieces, selectedCategory, sortConfig]);
  
  

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head>
        <title>Featured Databases - Cello Music</title>
        <meta
          name="description"
          content="Explore our featured databases showcasing diverse composers, including women, non-binary, Black, and Indigenous American composers, and discover unique cello music pieces."
        />
        <meta
          name="keywords"
          content="Cello, Music, Featured Databases, Women Composers, Non-Binary Composers, Black Composers, Indigenous Composers, Cello Music"
        />
        <link rel="canonical" href="https://www.cellorepertoire.com/featured-databases" />
        {/* Open Graph tags */}
        <meta property="og:title" content="Featured Databases - Cello Music" />
        <meta
          property="og:description"
          content="Explore our featured databases showcasing diverse composers, including women, non-binary, Black, and Indigenous American composers, and discover unique cello music pieces."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.cellorepertoire.com/featured-databases" />
        <meta
          property="og:image"
          content="https://www.cellorepertoire.com/images/featured-databases-banner.jpg"
        />
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Featured Databases - Cello Music" />
        <meta
          name="twitter:description"
          content="Explore our featured databases showcasing diverse composers, including women, non-binary, Black, and Indigenous American composers, and discover unique cello music pieces."
        />
        <meta
          name="twitter:image"
          content="https://www.cellorepertoire.com/images/featured-databases-banner.jpg"
        />
      </Head>
      <NavbarMain />
      <header className="py-10 bg-gradient-to-r from-purple-600 to-pink-600 text-center text-white">
        <h1 className="text-4xl mb-6 font-bold">Featured Databases</h1>
        <div className="mt-4 flex flex-col items-center space-y-4 md:flex-row md:justify-center md:space-y-0 md:space-x-4">
          {/* Category selection */}
          <div>
            <div className="md:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 rounded text-gray-900"
              >
                <option value="Woman">Women Composers</option>
                <option value="LGBTQIA+">Non-Binary Composers</option>
                <option value="Black">Black Composers</option>
                <option value="Indigenous">Indigenous Composers</option>
              </select>
            </div>
            <div className="hidden md:flex justify-center space-x-4">
              <button
                onClick={() => setSelectedCategory('Woman')}
                className={`px-4 py-2 rounded ${
                  selectedCategory === 'Woman' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Women Composers
              </button>
              <button
                onClick={() => setSelectedCategory('LGBTQIA+')}
                className={`px-4 py-2 rounded ${
                  selectedCategory === 'LGBTQIA+' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Non-Binary Composers
              </button>
              <button
                onClick={() => setSelectedCategory('Black')}
                className={`px-4 py-2 rounded ${
                  selectedCategory === 'Black' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Black Composers
              </button>
              <button
                onClick={() => setSelectedCategory('Indigenous')}
                className={`px-4 py-2 rounded ${
                  selectedCategory === 'Indigenous' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Indigenous Composers
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 pb-10">
        {/* Sort dropdown and view mode selector */}
        <div className="mt-5 mb-5 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-select" className="mr-2 text-md">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={`${sortConfig.field}-${sortConfig.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortConfig({ field, direction: direction as 'asc' | 'desc' });
              }}
              className="p-2 rounded text-gray-900"
            >
              <option value="level-asc">Level (Low to High)</option>
              <option value="level-desc">Level (High to Low)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="composer-asc">Composer (A-Z)</option>
              <option value="composer-desc">Composer (Z-A)</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="view-mode" className="text-md text-black">
              View Mode:
            </label>
            <select
              id="view-mode"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'card' | 'list')}
              className="p-2 rounded text-gray-900"
            >
              <option value="card">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>
        {loading ? (
          <LoadingAnimation />
        ) : featuredPieces.length === 0 ? (
          <div className="text-center mt-10">No featured pieces found.</div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
            {featuredPieces.map((piece) => (
              <MusicCard
                key={piece.id}
                id={piece.id}
                title={piece.title}
                composer_first_name={piece.composer_first_name}
                composer_last_name={piece.composer_last_name}
                level={piece.level}
                instrumentation={piece.instrumentation}
              />
            ))}
          </div>
        ) : (
          <MusicListView pieces={featuredPieces} sortConfig={sortConfig} onSort={onSort} />
        )}
      </main>
    </div>
  );
};

export default FeaturedDatabases;
