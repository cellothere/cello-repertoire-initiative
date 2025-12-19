import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarMain from '@/components/navbar-main';
import { FaSpinner } from 'react-icons/fa';

interface Composer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  born: string;
  died: string;
  nationalities?: string[];
}

const ComposersPage: React.FC = () => {
  const [composers, setComposers] = useState<Composer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [loadingComposerId, setLoadingComposerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchComposers = async () => {
      try {
        const res = await fetch('/api/composers');
        const data = await res.json();
        // Flatten grouped data and include nationalities and dates
        const flattened = data.flatMap((group: { composers: any[] }) =>
          group.composers.map((composer) => ({
            id: composer.id.toString(),
            firstName: composer.composer_first_name,
            lastName: composer.composer_last_name,
            fullName: composer.composer_full_name,
            born: composer.born,
            died: composer.died,
            nationalities: composer.nationality,
          }))
        );
        setComposers(flattened);
      } catch (err) {
        console.error('Error fetching composers:', err);
      }
    };

    fetchComposers();
  }, []);

  // Filter composers based on search input (by name or nationality)
  const filteredComposers = composers.filter((composer) => {
    const name = `${composer.firstName} ${composer.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesName = name.includes(searchLower);
    const matchesNationality = composer.nationalities?.some((nat) =>
      nat.toLowerCase().includes(searchLower)
    );
    return matchesName || matchesNationality;
  });

  const formatComposer = (first: string, last: string): string => {
    const lowerFirst = first.toLowerCase();
    const lowerLast = last.toLowerCase();
    if (lowerFirst.includes('various') || lowerLast.includes('various')) {
      return 'Various';
    }
    if (lowerFirst.includes('traditional') || lowerLast.includes('traditional')) {
      return 'Traditional';
    }
    return `${first}, ${last}`;
  };

  // Handle sorting option change
  const handleSort = (sortOption: string) => {
    let field = '';
    let direction: 'asc' | 'desc' = 'asc';
    switch (sortOption) {
      case 'lastname-asc':
        field = 'lastname';
        direction = 'asc';
        break;
      case 'lastname-desc':
        field = 'lastname';
        direction = 'desc';
        break;
      case 'nationality-asc':
        field = 'nationality';
        direction = 'asc';
        break;
      case 'nationality-desc':
        field = 'nationality';
        direction = 'desc';
        break;
      case 'born-asc':
        field = 'born';
        direction = 'asc';
        break;
      case 'born-desc':
        field = 'born';
        direction = 'desc';
        break;
      default:
        break;
    }
    setSortConfig({ field, direction });
  };

  // Sort filtered composers based on the current sort configuration
  const sortedComposers = sortConfig
    ? [...filteredComposers].sort((a, b) => {
        if (sortConfig.field === 'lastname') {
          return sortConfig.direction === 'asc'
            ? a.lastName.localeCompare(b.lastName)
            : b.lastName.localeCompare(a.lastName);
        } else if (sortConfig.field === 'nationality') {
          const aNationality = a.nationalities?.[0] ?? '';
          const bNationality = b.nationalities?.[0] ?? '';
          return sortConfig.direction === 'asc'
            ? aNationality.localeCompare(bNationality)
            : bNationality.localeCompare(aNationality);
        } else if (sortConfig.field === 'born') {
          const aBorn = a.born ? parseInt(a.born) : null;
          const bBorn = b.born ? parseInt(b.born) : null;
          if (aBorn !== null && bBorn !== null) {
            return sortConfig.direction === 'asc' ? aBorn - bBorn : bBorn - aBorn;
          }
          if (aBorn === null && bBorn === null) return 0;
          if (aBorn === null) return 1;
          if (bBorn === null) return -1;
        }
        return 0;
      })
    : filteredComposers;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <NavbarMain />

      {/* Gradient Header */}
      <header className="relative py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-center text-white overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl mb-3 font-bold tracking-tight">Composers</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto px-4">
            Discover the artists behind the music.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-10">
        {/* Search and Sort Controls */}
        <div className="mt-8 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or nationality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm font-medium whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-select"
              defaultValue="lastname-asc"
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="lastname-asc">Last Name (A-Z)</option>
              <option value="lastname-desc">Last Name (Z-A)</option>
              <option value="nationality-asc">Nationality (A-Z)</option>
              <option value="nationality-desc">Nationality (Z-A)</option>
              <option value="born-asc">Born (Asc)</option>
              <option value="born-desc">Born (Desc)</option>
            </select>
          </div>
        </div>

        {/* Composer List */}
        {sortedComposers.length > 0 ? (
          <div className="space-y-3">
            {sortedComposers.map((composer) => (
              <div
                key={composer.id}
                className="bg-white shadow-sm hover:shadow-md rounded-lg p-5 transition-all duration-200 flex items-center justify-between group"
              >
                {/* Left side: name on top, nationality/dates below */}
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-900 mb-1">
                    {formatComposer(composer.lastName, composer.firstName)}
                  </div>
                  {(composer.nationalities?.length || composer.born || composer.died) && (
                    <div className="text-sm text-gray-600">
                      {composer.nationalities && composer.nationalities.length > 0 && (
                        <span className="font-medium">{composer.nationalities.join(', ')}</span>
                      )}
                      {composer.born && (
                        <span className="ml-1">
                          ({composer.born}
                          {composer.died ? ` - ${composer.died}` : ''})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: button */}
                <Link
                  href={`/search-results?query=${encodeURIComponent(
                    `${composer.firstName} ${composer.lastName}`
                  )}`}
                >
                  <button
                    className="px-5 py-2.5 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loadingComposerId === composer.id}
                    onClick={() => {
                      setLoadingComposerId(composer.id);
                    }}
                  >
                    {loadingComposerId === composer.id ? (
                      <FaSpinner className="animate-spin inline-block" />
                    ) : (
                      <>
                        <span className="md:hidden">Works</span>
                        <span className="hidden md:inline">View Works</span>
                      </>
                    )}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-10 text-gray-600">
            <p className="text-lg">No composers found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComposersPage;
