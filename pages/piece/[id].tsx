import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import NavbarMain from '@/components/navbar-main';
import LoadingAnimation from '@/components/loading-animation';
import { HiMusicNote } from "react-icons/hi"; 
import { BsFileEarmarkMusicFill } from "react-icons/bs";

interface PieceProps {
  piece: {
    id: number;
    title: string;
    composer_id: string;
    composition_year: string;
    level_id: number;
    isArrangement: boolean;
    audio_link: string[];
    publisher_info: string;
    description: string;
    technical_overview: string;
    is_public_domain: boolean;
    where_to_buy_or_download: string[];
    duration: string;
    coverImage: string;
  } | null;

  composerInfo: {
    composer_name: string;
    articles: string[];
  } | null;
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

const Piece: NextPage<PieceProps> = ({ piece, composerInfo }) => {
  if (!piece) {
    return <LoadingAnimation />; // Use the LoadingAnimation component here
  }

  return (
    <div>
      <Head>
        <title>{piece.title}</title>
      </Head>
      <NavbarMain />
      <div className="container mx-auto p-4 mt-16">
        <h1 className="text-3xl font-bold mb-4">{piece.title}</h1>
        <p className="text-xl mb-2">by {' '}
          <Link href={composerInfo?.articles[0] || ''} className="underline">{composerInfo?.composer_name || 'Unknown Composer'}</Link>
        </p>
        <p className="text-md mb-2">{getLevelDescription(piece.level_id.toString())}</p>
        <p className="text-md mb-4">{piece.description || 'No description available.'}</p>
        {piece.technical_overview && <p className="text-md mb-4">Technical Overview: {piece.technical_overview}</p>}
        {piece.composition_year && <p className="text-md mb-4">Composition Year: {piece.composition_year}</p>}
        {piece.duration && <p className="text-md mb-4">Duration: {piece.duration}</p>}
        <p className="text-md mb-4">Arrangement of Original? {piece.isArrangement ? 'Yes' : 'No'}</p>
        <p className="text-md mb-4">Public Domain? (US): {piece.is_public_domain ? 'Yes' : 'No'}</p>
        {piece.publisher_info && <p className="text-md mb-4">Publisher Info: {piece.publisher_info}</p>}
        {piece.audio_link.length > 0 && (
          <div className="text-md mb-4">
            <p>Audio Links:</p>
            {piece.audio_link.map((link, index) => (
              link && (
                <div key={index}>
                  <HiMusicNote style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px' }}>
                    {link}
                  </a>
                  <br />
                </div>
              )
            ))}
          </div>
        )}
        {piece.where_to_buy_or_download.length > 0 && (
          <div className="text-md mb-4">
            <p>Where to Buy or Download:</p>
            {piece.where_to_buy_or_download.map((link, index) => (
              link && (
                <div key={index} >
                  <BsFileEarmarkMusicFill style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px' }}>
                    {link}
                  </a>
                  <br />
                </div>
              )
            ))}
          </div>
        )}
        {piece.coverImage && <img src={piece.coverImage} alt={piece.title} />}
        <Link href="/cello-music">Back to Music</Link>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const client = await clientPromise;
  const collection = client.db('cello_repertoire').collection('music_pieces');

  const piece = await collection.aggregate([
    { $match: { id } },
    {
      $lookup: {
        from: 'composers',
        localField: 'composer_id',
        foreignField: 'id',
        as: 'composerDetails',
      },
    },
    { $unwind: '$composerDetails' },
  ]).next();

  return {
    props: {
      piece: piece ? {
        id: piece.id,
        title: piece.title || '',
        composer_id: piece.composer_id || '',
        composition_year: piece.composition_year || '',
        level_id: piece.level_id || 0,
        isArrangement: piece.isArrangement,
        audio_link: piece.audio_link || [],
        publisher_info: piece.publisher_info || '',
        description: piece.description || '',
        technical_overview: piece.technical_overview || '',
        is_public_domain: piece.is_public_domain,
        where_to_buy_or_download: piece.where_to_buy_or_download || [],
        duration: piece.duration || '',
        coverImage: piece.coverImage || '',
      } : null,
      composerInfo: piece ? {
        composer_name: piece.composerDetails.composer_name || 'Unknown Composer',
        articles: piece.composerDetails.articles || []
      } : null,
    },
  };
};

export default Piece;
