import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Composer {
  _id: string; // or number, depending on your DB schema
  firstName: string;
  lastName: string;
  // add any additional fields if needed
}

const ComposersPage: React.FC = () => {
  const [composers, setComposers] = useState<Composer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all composers when the component mounts
  useEffect(() => {
    const fetchComposers = async () => {
      try {
        const res = await fetch('/api/composers');
        const data = await res.json();
        setComposers(data);
      } catch (err) {
        console.error('Error fetching composers:', err);
      }
    };

    fetchComposers();
  }, []);

  // Filter composers based on search input (by first name, last name or full name)
  const filteredComposers = composers.filter((composer) => {
    const fullName = `${composer.firstName} ${composer.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Composers</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search composers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>
      {filteredComposers.length > 0 ? (
        <ul className="space-y-4">
          {filteredComposers.map((composer) => (
            <li
              key={composer._id}
              className="bg-white shadow-md rounded-sm p-4 flex justify-between items-center"
            >
              <span className="font-medium">
                {composer.lastName}, {composer.firstName}
              </span>
              {/* Link to a details page for the composer */}
              <Link href={`/composer/${composer._id}`}>
                <a className="text-blue-500 hover:underline">View Details</a>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No composers found.</p>
      )}
    </div>
  );
};

export default ComposersPage;
