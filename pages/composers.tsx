import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarMain from '@/components/navbar-main';

interface Composer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalities?: string[];
}

const ComposersPage: React.FC = () => {
  const [composers, setComposers] = useState<Composer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchComposers = async () => {
      try {
        const res = await fetch('/api/composers');
        const data = await res.json();
        // Flatten grouped data and include nationalities
        const flattened = data.flatMap((group: { composers: any[] }) =>
          group.composers.map((composer) => ({
            id: composer.id.toString(),
            firstName: composer.composer_first_name,
            lastName: composer.composer_last_name,
            fullName: composer.composer_full_name,
            nationalities: composer.nationality, // add nationalities from API
          }))
        );
        setComposers(flattened);
      } catch (err) {
        console.error('Error fetching composers:', err);
      }
    };

    fetchComposers();
  }, []);

  const filteredComposers = composers.filter((composer) => {
    const name = `${composer.firstName} ${composer.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <NavbarMain />

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Composers</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search composers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border text-black border-gray-300 rounded p-2 w-full"
          />
        </div>
        {filteredComposers.length > 0 ? (
          <ul className="space-y-4">
            {filteredComposers.map((composer) => (
              <li
                key={composer.id}
                className="bg-white shadow-md rounded-sm p-4 text-black flex justify-between items-center"
              >
                <span className="font-medium">
                  {composer.lastName}, {composer.firstName}
                  {composer.nationalities && composer.nationalities.length > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({composer.nationalities.join(', ')})
                    </span>
                  )}
                </span>
                <Link href={`/composer/${composer.id}`} className="text-blue-500 hover:underline">
                  View Details
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
