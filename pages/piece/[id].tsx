import React, { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import NavbarMain from '@/components/navbar-main';
import LoadingAnimation from '@/components/loading-animation';
import { HiMusicNote } from "react-icons/hi";
import { BsFileEarmarkMusicFill } from "react-icons/bs";
import { FaArrowRight } from 'react-icons/fa';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AiFillQuestionCircle } from "react-icons/ai";
import VideoIframe from '@/components/youtube-iframe';

interface PieceProps {
  piece: {
    id: number;
    title: string;
    composer_id: string;
    composition_year: string;
    level: string;
    isArrangement: boolean;
    audio_link: string[];
    instrumentation: string[];
    publisher_info: string;
    description: string;
    technical_overview: string;
    is_public_domain: boolean;
    where_to_buy_or_download: string[];
    duration: string;
    coverImage: string;
  } | null;

  composerInfo: {
    composer_full_name: string;
    composer_last_name: string;
    bio_links: string[];
  } | null;
}



const Piece: NextPage<PieceProps> = ({ piece, composerInfo }) => {
  const [videoId1, setVideoId1] = useState<string | null>(null);

  // UseEffect should not depend on piece if it does not directly cause re-render issues
  useEffect(() => {
    if (piece && piece.audio_link.length > 0) {
      const audioLink1 = piece.audio_link[0];
      const id = audioLink1.slice(-11);
      setVideoId1(id);
    }
  }, [piece]); // Depend on `piece` only if necessary, as it's critical to set the video ID correctly

  if (!piece) {
    return <LoadingAnimation />;
  }

  const opts = {
    height: '400',
    width: '550',
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <div>
      <Head>
        <title>{piece.title}</title>
      </Head>
      <NavbarMain />
      <main className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 mt-5">
        <div className="container mx-auto">
          <div className="flex flex-col justify-between items-start mb-2">
            <h1 className="text-3xl font-bold">{piece.title}</h1>
            <div className="flex flex-col items-start mb-2">
              <p className="text-xl mb-2">by{' '}
                {composerInfo?.bio_links?.[0] ? (
                  <Link
                    href={composerInfo.bio_links[0]}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {composerInfo.composer_full_name || 'Unknown Composer'}
                  </Link>
                ) : (
                  <span>{composerInfo?.composer_full_name || 'Unknown Composer'}</span>
                )}
              </p>
              <div className="flex items-center">
                <p className="text-md text-lg italic mr-1">{' - '}{piece.level}</p>
                <AiFillQuestionCircle className="mb-2" />
              </div>
            </div>
          </div>

          <Accordion className="w-full md:w-[600px]" defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              className="ml-1 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br"
            >
              Info
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              <p className="text-md mb-2 font-bold">Description:</p>
              {piece.description || 'No description available.'}
              <p className="mb-4"></p>
              {piece.composition_year && <p className="text-md mb-4"><strong>Composition Year: </strong> {piece.composition_year}</p>}
              {piece.instrumentation && (
                <p className="text-md mb-4">
                  <strong>Instrumentation: </strong> {piece.instrumentation.join(', ')}
                </p>
              )}
              {piece.duration && <p className="text-md mb-4"> <strong>Duration: </strong>{piece.duration}</p>}
              <p className="text-md mb-4"><strong>Arrangement of Original? </strong>{piece.isArrangement ? 'Yes' : 'No'}</p>
              <p className="text-md mb-4"><strong>Public Domain? </strong> {piece.is_public_domain ? 'Yes' : 'No'}</p>
              {piece.publisher_info && <p className="text-md mb-4"><strong>Publisher Info: </strong> {piece.publisher_info}</p>}
              {/* {piece.coverImage && <img src={piece.coverImage} alt={piece.title} />} */}
            </AccordionDetails>
          </Accordion>

          <Accordion className="w-full md:w-[600px]">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
              className="ml-1 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br"
            >
              Technical Overview
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              {piece.technical_overview || 'No description available.'}
            </AccordionDetails>
          </Accordion>

          <Accordion className="w-full md:w-[600px]">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
              className="ml-1 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br"
            >
              Where to buy/download
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              {piece.where_to_buy_or_download.length > 0 && (
                <div className="text-md mb-4">
                  {piece.where_to_buy_or_download.map((link, index) => {
                    const domain = new URL(link).hostname.replace(/^www\./, ''); // Extract domain and remove 'www.'
                    return (
                      link && (
                        <div key={index}>
                          <BsFileEarmarkMusicFill style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              verticalAlign: 'middle',
                              marginLeft: '5px',
                              textDecoration: 'underline', // Underline style
                            }}
                          >
                            {domain}
                          </a>
                          <br />
                        </div>
                      )
                    );
                  })}
                </div>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion className="w-full md:w-[600px]">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4-content"
              id="panel4-header"
              className="ml-1 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br"
            >
              Audio
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              {piece.audio_link.length > 0 && (
                <div className="text-md mb-4">
                  {piece.audio_link.map((link, index) => {
                    const domain = new URL(link).hostname.replace(/^www\./, ''); // Extract domain and remove 'www.'
                    return (
                      link && (
                        <div key={index}>
                          <HiMusicNote style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              verticalAlign: 'middle',
                              marginLeft: '5px',
                              textDecoration: 'underline', // Underline style
                            }}
                          >
                            {domain}
                          </a>
                          <br />
                        </div>
                      )
                    );
                  })}
                </div>
              )}
            </AccordionDetails>
          </Accordion>
        </div>
        <div className="container mx-auto flex flex-col items-center">
          <div className="w-full flex justify-end">
            <button className="bg-black text-white px-4 py-2 mb-3 rounded-lg transition-transform hover:scale-105">
              <Link href="../cello-music">
                Back to Music <FaArrowRight className="inline-block ml-2" />
              </Link>
            </button>
          </div>
          {videoId1 && <div className="w-full mt-16">
            <VideoIframe videoId={videoId1} title="" />
          </div>}
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {}; // Safely destructure `id`
  
  if (!id || typeof id !== 'string') {
    return { notFound: true }; // Return a 404 page if `id` is missing or invalid
  }

  const client = await clientPromise;
  const collection = client.db('cello_repertoire').collection('music_pieces');

  const piece = await collection.aggregate([
    { $match: { id } }, // Use `id` directly since we've validated it
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
      piece: piece
        ? {
            id: piece.id,
            title: piece.title || '',
            composer_id: piece.composer_id || '',
            composition_year: piece.composition_year || '',
            level: piece.level || 'Unknown',
            isArrangement: piece.isArrangement || false,
            audio_link: piece.audio_link || [],
            instrumentation: piece.instrumentation || [],
            publisher_info: piece.publisher_info || '',
            description: piece.description || '',
            technical_overview: piece.technical_overview || '',
            is_public_domain: piece.is_public_domain || false,
            where_to_buy_or_download: piece.where_to_buy_or_download || [],
            duration: piece.duration || '',
            coverImage: piece.coverImage || '',
          }
        : null,
      composerInfo: piece?.composerDetails
        ? {
            composer_full_name: piece.composerDetails.composer_full_name || 'Unknown Composer',
            bio_links: piece.composerDetails.bio_link || [], // Ensure this matches the schema
          }
        : null,
    },
  };
};



export default Piece;
