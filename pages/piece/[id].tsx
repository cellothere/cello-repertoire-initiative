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
import Tooltip from '@mui/material/Tooltip';
import { AiFillQuestionCircle } from "react-icons/ai";
import VideoIframe from '@/components/youtube-iframe';

interface PieceProps {
  piece: {
    id: number;
    title: string;
    composer_id: number;
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

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const Piece: NextPage<PieceProps> = ({ piece, composerInfo }) => {
  const [videoId1, setVideoId1] = useState<string | null>(null);
  const [hasVideo, setHasVideo] = useState<boolean>(false);

  useEffect(() => {
    if (piece && piece.audio_link.length > 0) {
      const audioLink1 = piece.audio_link[0];

      try {
        const url = new URL(audioLink1);
        const isYouTube =
          url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');

        if (isYouTube) {
          const videoId = url.searchParams.get('v') || url.pathname.slice(1);
          if (videoId) {
            setVideoId1(videoId);
            setHasVideo(true);
          }
        }
      } catch (error) {
        console.error('Invalid URL:', audioLink1, error);
      }
    }
  }, [piece]);

  if (!piece) {
    return <LoadingAnimation />;
  }

  return (
    <div>
      <Head>
        <title>{piece.title}</title>
      </Head>
      <NavbarMain />
      <div className='flex flex-col sm:flex-row justify-between mt-5 mx-auto w-[98%]'>
  <h1 className="text-2xl sm:text-3xl font-bold">
    {piece.title}
  </h1>
  <button className="hidden sm:block bg-black text-white px-3 py-2 rounded-lg hover:scale-105 transition-transform mt-3 sm:mt-0">
    <Link href="../cello-music">
      Back to Music <FaArrowRight className="inline-block ml-2" />
    </Link>
  </button>
</div>


      <main
        className={`grid grid-cols-1 gap-6 p-4 ${hasVideo ? 'md:grid-cols-2' : 'md:grid-cols-1'
          }`}
      >
        {/* LEFT COLUMN */}
        <div className="container mx-auto flex flex-col items-start">
          {/* Title + Composer */}
          <div className="mb-4">

            <p className="text-md sm:text-lg mb-1">
              by{' '}
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

            {/* Level + Tooltip */}
            <div className="flex items-center">
              <p className="text-sm sm:text-md italic mr-1">{piece.level}</p>
              <Tooltip title="Levels are approximate.">
                <span className="cursor-pointer text-gray-500">
                  <AiFillQuestionCircle className="inline-block" />
                </span>
              </Tooltip>
            </div>
          </div>

          {/* Info Accordion */}
          <Accordion className="w-full max-w-full md:max-w-2xl" defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              className="ml-1 text-lg font-bold bg-clip-text"
            >
              Info
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              <p className="text-sm sm:text-md mb-2 font-bold">Description:</p>
              <p className="text-sm sm:text-md mb-4">
                {piece.description || 'No description available.'}
              </p>

              {piece.composition_year && (
                <p className="text-sm sm:text-md mb-4">
                  <strong>Composition Year: </strong>
                  {piece.composition_year}
                </p>
              )}

              {piece.instrumentation?.length > 0 && (
                <p className="text-sm sm:text-md mb-4">
                  <strong>Instrumentation: </strong>
                  {piece.instrumentation.join(', ')}
                </p>
              )}

              {piece.duration && (
                <p className="text-sm sm:text-md mb-4">
                  <strong>Duration: </strong>
                  {piece.duration}
                </p>
              )}

              <p className="text-sm sm:text-md mb-4">
                <strong>Arrangement of Original? </strong>
                {piece.isArrangement ? 'Yes' : 'No'}
              </p>

              <p className="text-sm sm:text-md mb-4">
                <strong>Public Domain? </strong>
                {piece.is_public_domain ? 'Yes' : 'No'}
              </p>

              {piece.publisher_info && (
                <p className="text-sm sm:text-md mb-4">
                  <strong>Publisher Info: </strong>
                  {piece.publisher_info}
                </p>
              )}

              {/* If you want to show the cover image:
               {piece.coverImage && (
                 <img
                   src={piece.coverImage}
                   alt={`Cover image of ${piece.title}`}
                   className="my-4"
                 />
               )}
              */}
            </AccordionDetails>
          </Accordion>

          {/* Technical Overview Accordion */}
          <Accordion className="w-full max-w-full md:max-w-2xl">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
              className="ml-1 text-lg font-bold bg-clip-text"
            >
              Technical Overview
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              <p className="text-sm sm:text-md">
                {piece.technical_overview || 'No technical overview available.'}
              </p>
            </AccordionDetails>
          </Accordion>

          {/* Where to Buy/Download Accordion */}
          <Accordion className="w-full max-w-full md:max-w-2xl">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
              className="ml-1 text-lg font-bold bg-clip-text"
            >
              Where to Buy/Download
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              {piece.where_to_buy_or_download && piece.where_to_buy_or_download.length > 0 ? (
                <div className="text-sm sm:text-md mb-4">
                  {piece.where_to_buy_or_download.map((link, index) => {
                    if (!link) return null;
                    try {
                      const domain = new URL(link).hostname.replace(/^www\./, '');
                      return (
                        <div key={index} className="mb-2">
                          <BsFileEarmarkMusicFill className="inline-block align-middle mr-2" />
                          <Link
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline align-middle"
                          >
                            {domain}
                          </Link>
                        </div>
                      );
                    } catch (error) {
                      return (
                        <div key={index} className="text-md mb-2">
                          <BsFileEarmarkMusicFill className="inline-block align-middle mr-2" />
                          <span className="align-middle">{link}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                <p className="text-sm sm:text-md">Nothing here.</p>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Audio Accordion */}
          <Accordion className="w-full max-w-full md:max-w-2xl">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4-content"
              id="panel4-header"
              className="ml-1 text-lg font-bold bg-clip-text"
            >
              Audio and Recordings
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              {piece.audio_link && piece.audio_link.length > 0 ? (
                <div className="text-sm sm:text-md mb-4">
                  {piece.audio_link.map((link, index) => {
                    if (!link || !isValidUrl(link)) return null;
                    const domain = new URL(link).hostname.replace(/^www\./, '');
                    return (
                      <div key={index} className="mb-2">
                        <HiMusicNote className="inline-block align-middle mr-2" />
                        <Link
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline align-middle"
                        >
                          {domain}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm sm:text-md">Nothing here.</p>
              )}
            </AccordionDetails>
          </Accordion>
        </div>

        {/* RIGHT COLUMN (shows up on top/below in mobile, side-by-side on md+) */}
        {hasVideo && (
          <div className="container mx-auto flex flex-col">
            {/* Button row */}
            <div className="w-full flex justify-center md:justify-end">

            </div>

            {/* Video (wrap this in a responsive container if needed) */}
            <div className="flex justify-center items-center mt-20">
              {videoId1 && (
                <>
                  <VideoIframe videoId={videoId1} title={piece.title} />
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  // Convert id to an integer if it's a valid number
  const parsedId = id && !isNaN(Number(id)) ? Number(id) : null;
  if (parsedId === null) {
    return { notFound: true };
  }

  const client = await clientPromise;
  const collection = client.db('cello_repertoire').collection('music_pieces');

  const piece = await collection
    .aggregate([
      { $match: { id: parsedId } }, // Ensure id is treated as an integer
      {
        $lookup: {
          from: 'composers',
          localField: 'composer_id',
          foreignField: 'id',
          as: 'composerDetails',
        },
      },
      { $unwind: '$composerDetails' },
    ])
    .next();

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
            composer_full_name:
              piece.composerDetails.composer_full_name || 'Unknown Composer',
            bio_links: piece.composerDetails.bio_link || [],
          }
        : null,
    },
  };
};


export default Piece;
