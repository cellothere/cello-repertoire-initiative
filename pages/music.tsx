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
      // Flatten the array of music pieces
      const flattenedPieces = data.flatMap((group: { musicPieces: MusicPiece[] }) => group.musicPieces);
      setPieces(flattenedPieces);
    };
  
    fetchPieces();
  }, []);

  return (
    <div>
      <Head>
        <title>Music Pieces</title>
      </Head>
      <NavbarMain />
      <main>
        <h1>Music Pieces</h1>
        <ul>
          {pieces.map((piece, index) => (
            <li key={index}>
              {piece.title} by {piece.composer}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Music;
