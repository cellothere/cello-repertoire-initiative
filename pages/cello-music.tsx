import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavbarMain from '@/components/navbar-main';

interface MusicPiece {
  id: string;
  title: string;
  composer: string;
  level_id: string;
}

const getLevelDescription = (level_id: string): string => {
  const level = parseInt(level_id, 10);
  switch (level) {
    case 1: return 'Early Beginner';
    case 2: return 'Beginner';
    case 3: return 'Late Beginner';
    case 4: return 'Early Intermediate';
    case 5: return 'Intermediate';
    case 6:
    case 7: return 'Late Intermediate';
    case 8:
    case 9: return 'Early Professional';
    case 10: return 'Professional';
    default: return 'Unknown Level';
  }
};

const accordionContent = {
  Level: ['Beginner', 'Advanced', 'Professional'],
  Instrumentation: ['Solo', 'Duet', 'Trio', 'Quartet'],
  Composer: ['Beethoven', 'Bach', 'Brahms', 'Mozart']
};

const Music: NextPage = () => {
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<MusicPiece[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchPieces = async () => {
      const res = await fetch('/api/celloMusic');
      const data = await res.json();
      console.log(data);  // Log the fetched data
      const flattenedPieces = data.flatMap((group: { musicPieces: MusicPiece[] }) => group.musicPieces);
      setPieces(flattenedPieces);
      setFilteredPieces(flattenedPieces);
    };

    fetchPieces();
  }, []);

  useEffect(() => {
    const filtered = pieces.filter(piece =>
      piece.title.toLowerCase().includes(filter.toLowerCase()) ||
      piece.composer.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredPieces(filtered);
  }, [filter, pieces]);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div>
      <Head>
        <title>Cello Music</title>
      </Head>
      <NavbarMain />

      <div className="flex mt-16">
        {/* Filter button for mobile view */}
        <button 
          className="md:hidden fixed top-24 left-0 w-full p-3 bg-blue-500 text-white font-bold"
          onClick={() => setIsFilterVisible(true)}
        >
          Filter
        </button>

        {/* Fixed filter section */}
        <aside className="hidden md:block fixed top-24 left-0 w-64 h-full p-5 border-r-4 border-gray-100">
          <h2 className="text-xl color-black font-bold mb-4">Filter</h2>
          <input
            type="text"
            placeholder="Search by title or composer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-black font-mono"
          />

          <div id="accordion">
            {Object.entries(accordionContent).map(([key, content], index) => (
              <div key={index}>
                <h2 id={`accordion-heading-${index}`}>
                  <button
                    type="button"
                    className={`flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3 ${openAccordion === index ? 'bg-gray-100' : ''}`}
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={openAccordion === index}
                    aria-controls={`accordion-body-${index}`}
                  >
                    <span>{key}</span>
                    <svg className={`w-3 h-3 transition-transform ${openAccordion === index ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                    </svg>
                  </button>
                </h2>
                <div id={`accordion-body-${index}`} className={`transition-max-height overflow-hidden ${openAccordion === index ? 'max-h-96' : 'max-h-0'} bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700`}>
                  <div className="p-5">
                    <p className="mb-2 text-gray-500 dark:text-gray-400">Select {key}:</p>
                    <ul className="list-disc pl-5">
                      {content.map((item, i) => (
                        <li key={i} className="text-gray-600 dark:text-gray-400">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Filter splash screen for mobile view */}
        {isFilterVisible && (
          <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto p-5">
            <button 
              className="absolute top-5 right-5 bg-red-500 text-white p-2 rounded"
              onClick={() => setIsFilterVisible(false)}
            >
              Close
            </button>
            <h2 className="text-xl color-black font-bold mb-4">Filter</h2>
            <input
              type="text"
              placeholder="Search by title or composer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black font-mono mb-4"
            />

            <div id="accordion">
              {Object.entries(accordionContent).map(([key, content], index) => (
                <div key={index}>
                  <h2 id={`accordion-heading-${index}`}>
                    <button
                      type="button"
                      className={`flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3 ${openAccordion === index ? 'bg-gray-100' : ''}`}
                      onClick={() => toggleAccordion(index)}
                      aria-expanded={openAccordion === index}
                      aria-controls={`accordion-body-${index}`}
                    >
                      <span>{key}</span>
                      <svg className={`w-3 h-3 transition-transform ${openAccordion === index ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                      </svg>
                    </button>
                  </h2>
                  <div id={`accordion-body-${index}`} className={`transition-max-height overflow-hidden ${openAccordion === index ? 'max-h-96' : 'max-h-0'} bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700`}>
                    <div className="p-5">
                      <p className="mb-2 text-gray-500 dark:text-gray-400">Select {key}:</p>
                      <ul className="list-disc pl-5">
                        {content.map((item, i) => (
                          <li key={i} className="text-gray-600 dark:text-gray-400">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="md:ml-64 container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center my-6">Cello Music</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPieces.map((piece, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800">{piece.title}</h2>
                <p className="text-gray-600">by {piece.composer}</p>
                <div className="border-b border-gray-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">{getLevelDescription(piece.level_id)}</p>
                  <Link href={`/piece/${piece.id}`}>
                    <p className="text-blue-500 hover:underline">View Detail</p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Music;
