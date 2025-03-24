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
    <div>
      <NavbarMain />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Composers</h1>

        {/* Search and Sort */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <input
            type="text"
            placeholder="Search by name or nationality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border text-black border-gray-300 rounded p-2 w-full"
          />
          <select
            defaultValue="lastname-asc"
            onChange={(e) => handleSort(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-black font-medium text-sm bg-white w-full md:w-auto focus:outline-none"
          >
            <option value="lastname-asc">Last Name (A-Z)</option>
            <option value="lastname-desc">Last Name (Z-A)</option>
            <option value="nationality-asc">Nationality (A-Z)</option>
            <option value="nationality-desc">Nationality (Z-A)</option>
            <option value="born-asc">Born (Asc)</option>
            <option value="born-desc">Born (Desc)</option>
          </select>
        </div>

        {/* Composer List */}
        {sortedComposers.length > 0 ? (
          <ul className="space-y-2">
            {sortedComposers.map((composer) => (
              <li
                key={composer.id}
                className="bg-white shadow-md rounded-sm p-4 text-black flex items-center justify-between"
              >
                {/* Left side: name on top, nationality/dates below */}
                <div>
                  <div className="font-medium text-base">
                    {formatComposer(composer.lastName, composer.firstName)}
                  </div>
                  {(composer.nationalities?.length || composer.born || composer.died) && (
                    <div className="text-sm text-gray-600">
                    {composer.nationalities && composer.nationalities.length > 0 && (
                      <>{composer.nationalities.join(', ')}</>
                    )}
                      {composer.born && (
                        <span>
                          {' '}({composer.born}
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
                    className="px-4 py-2 bg-black text-white rounded transition duration-300 ease-in-out hover:bg-gradient-to-br hover:from-[#623d88] hover:to-[#36c190]"
                    disabled={loadingComposerId === composer.id}
                    onClick={() => {
                      setLoadingComposerId(composer.id);
                    }}
                  >
                    {loadingComposerId === composer.id ? (
                      <FaSpinner className="animate-spin inline-block" />
                    ) : (
                      'View Works'
                    )}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No composers found.</p>
        )}
      </div>
    </div>
  );
};

export default ComposersPage;
