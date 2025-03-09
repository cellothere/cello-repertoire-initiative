import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarMain from '@/components/navbar-main';

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
            born: composer.born,       // Added born date
            died: composer.died,       // Added death date
            nationalities: composer.nationality, // assuming your API field is named "nationality"
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

    // Check if the search term matches the composer's name
    const matchesName = name.includes(searchLower);

    // Check if the search term matches any of the composer's nationalities
    const matchesNationality = composer.nationalities?.some((nat) =>
      nat.toLowerCase().includes(searchLower)
    );

    return matchesName || matchesNationality;
  });

  const formatComposer = (first: string, last: string): string => {
    const lowerFirst = first.toLowerCase();
    const lowerLast = last.toLowerCase();
    if (lowerFirst.includes("various") || lowerLast.includes("various")) {
      return "Various";
    }
    if (lowerFirst.includes("traditional") || lowerLast.includes("traditional")) {
      return "Traditional";
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
        // Sort by the first nationality available (or empty string if none)
        const aNationality = a.nationalities && a.nationalities.length > 0 ? a.nationalities[0] : '';
        const bNationality = b.nationalities && b.nationalities.length > 0 ? b.nationalities[0] : '';
        return sortConfig.direction === 'asc'
          ? aNationality.localeCompare(bNationality)
          : bNationality.localeCompare(aNationality);
      } else if (sortConfig.field === 'born') {
        // Convert birth years to numbers. If missing, treat as null.
        const aBorn = a.born ? parseInt(a.born) : null;
        const bBorn = b.born ? parseInt(b.born) : null;
        // If both composers have a birth year, sort numerically.
        if (aBorn !== null && bBorn !== null) {
          return sortConfig.direction === 'asc' ? aBorn - bBorn : bBorn - aBorn;
        }
        // If one is missing, it should be sorted at the bottom.
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <input
            type="text"
            placeholder="Search by name or nationality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border text-black border-gray-300 rounded p-2 w-full md:w-1/2 mb-2 md:mb-0"
          />
          <select
            defaultValue="lastname-asc"
            onChange={(e) => handleSort(e.target.value)}
            className="border border-gray-300 rounded-md p-1 text-black font-medium text-sm bg-white focus:outline-none"
          >
            <option value="lastname-asc">Last Name (A-Z)</option>
            <option value="lastname-desc">Last Name (Z-A)</option>
            <option value="nationality-asc">Nationality (A-Z)</option>
            <option value="nationality-desc">Nationality (Z-A)</option>
            <option value="born-asc">Born (Asc)</option>
            <option value="born-desc">Born (Desc)</option>
          </select>
        </div>
        {sortedComposers.length > 0 ? (
          <ul className="space-y-4">
            {sortedComposers.map((composer) => (
              <li
                key={composer.id}
                className="bg-white shadow-md rounded-sm p-4 text-black flex justify-between items-center"
              >
                <span className="font-medium">
                  {formatComposer(composer.lastName, composer.firstName)}
                  {(composer.nationalities && composer.nationalities.length > 0) || (composer.born || composer.died) ? (
                    <span className="ml-2 text-sm text-gray-600">
                      {composer.nationalities && composer.nationalities.length > 0 && (
                        <>{composer.nationalities.join(', ')}</>
                      )}
                      {composer.born && (
                        <span>
                          {' '}
                          ({composer.born}
                          {composer.died ? ` - ${composer.died}` : ''})
                        </span>
                      )}
                    </span>
                  ) : null}
                </span>
                <Link
                  href={`/search-results?query=${encodeURIComponent(`${composer.firstName} ${composer.lastName}`)}`}
                  className="text-blue-500 hover:underline"
                >
                  View Works
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
