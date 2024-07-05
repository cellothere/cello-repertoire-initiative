// pages/music.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import NavbarMain from '@/components/navbar-main';

interface MusicPiece {
  title: string;
  composer: string;
}

const Music: NextPage = () => {
  const [pieces, setPieces] = useState<MusicPiece[]>([]);

  useEffect(() => {
    const fetchPieces = async () => {
      const res = await fetch('/api/music');
      const data = await res.json();
      console.log(data);  // Log the fetched data
      const flattenedPieces = data.flatMap((group: { musicPieces: MusicPiece[] }) => group.musicPieces);
      setPieces(flattenedPieces);
    };

    fetchPieces();
  }, []);

  return (
    <div>
      <Head>
        <title>Cello Music</title>
      </Head>
      <NavbarMain />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-6">Cello Music</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pieces.map((piece, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800">{piece.title}</h2>
              <p className="text-gray-600">by {piece.composer}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Music;
