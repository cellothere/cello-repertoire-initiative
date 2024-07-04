// pages/music.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

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
      setPieces(data);
    };

    fetchPieces();
  }, []);

  return (
    <div>
      <Head>
        <title>Music Pieces</title>
      </Head>
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
