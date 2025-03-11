// pages/recentlyAdded.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import NavbarMain from '@/components/navbar-main';
import MusicCard from '@/components/music-card';

interface MusicPiece {
  _id: string;
  id: number;
  title: string;
  composer: string;
  composer_last_name: string;
  composer_first_name: string;
  composition_year: string;
  level: string;
  instrumentation: string[];
  nationality: string[];
  duration: string;
}

const RecentlyAdded: NextPage = () => {
  const [pieces, setPieces] = useState<MusicPiece[]>([]);

  useEffect(() => {
    const fetchRecentlyAdded = async () => {
      const res = await fetch('/api/recentlyAdded');
      const data = await res.json();
      setPieces(data);
    };
    fetchRecentlyAdded();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <Head>
        <title>Recently Added - Cello Music</title>
      </Head>
      <NavbarMain />
      <header className="py-10 text-center">
        <h1 className="text-4xl font-bold">Recently Added</h1>
        <p className="mt-2 text-lg text-gray-300">
          Check out the latest additions to our cello repertoire.
        </p>
      </header>
      <main className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {pieces.map((piece) => (
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
      </main>
    </div>
  );
};

export default RecentlyAdded;
