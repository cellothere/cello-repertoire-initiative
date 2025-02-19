import { useEffect, useState } from 'react';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { NextPage } from 'next';

type Resource = {
  _id: number;
  title: string;
  description: string;
  url: string;
};

const Resources: NextPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources');
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Head>
        <title>Resources | Cello Repertoire Initiative</title>
      </Head>
      <NavbarMain />
      <main className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Resources</h1>

        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded text-black px-3 py-2 w-full max-w-md"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading resources...</p>
        ) : filteredResources.length === 0 ? (
          <p className="text-center text-gray-500">No resources found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource._id}
                className="flex flex-col h-full bg-white shadow-lg rounded-lg p-4 border hover:shadow-xl transition duration-300"
              >
                <h2 className="text-xl font-semibold text-black mb-2">
                  {resource.title}
                </h2>
                <p className="text-gray-700 flex-grow">{resource.description}</p>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-4"
                >
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Resources;
