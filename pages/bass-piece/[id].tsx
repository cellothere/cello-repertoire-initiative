import React, { useEffect, useState } from 'react';
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import NavbarMain from '@/components/navbar-main';
import LoadingAnimation from '@/components/loading-animation';
import { HiMusicNote } from 'react-icons/hi';
import { BsFileEarmarkMusicFill } from 'react-icons/bs';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AiFillQuestionCircle } from 'react-icons/ai';
import dynamic from 'next/dynamic';
import { modalLevelText } from '@/utils/modalLevelTexts';
import LevelModal from '@/components/level-modal';

// Dynamically import VideoIframe (client-side only)
const VideoIframe = dynamic(() => import('@/components/youtube-iframe'), { ssr: false });

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
    technique_focus: string[]; // New field
    is_public_domain: boolean;
    where_to_buy_or_download: string[];
    duration: string;
    coverImage: string;
  } | null;
  composerInfo: {
    composer_full_name: string;
    composer_last_name?: string;
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

const linkify = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      let displayText = part;
      try {
        displayText = new URL(part).hostname.replace(/^www\./, '');
      } catch (error) {
        console.error('Invalid URL:', part, error);
      }
      return (
        <Link
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-500"
        >
          {displayText}
        </Link>
      );
    }
    return part;
  });
};

const formatDuration = (duration: string): string => {
  const parts = duration.split(':');
  if (parts.length !== 3) return duration;
  const [hours, minutes, seconds] = parts.map(Number);
  if (hours === 0 && minutes === 0 && seconds === 0) return 'N/A';
  if (hours > 0) {
    return seconds > 0 ? `${hours}hr ${minutes}'${seconds}''` : `${hours}hr ${minutes}'`;
  }
  return seconds > 0 ? `${minutes}'${seconds}''` : `${minutes}'`;
};

const Piece: NextPage<PieceProps> = ({ piece, composerInfo }) => {
  // State for video and accordion expansion
  const [videoId1, setVideoId1] = useState<string | null>(null);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string | false>('panel1');
  // State for modal dialog
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (piece && piece.audio_link.length > 0) {
      const audioLink1 = piece.audio_link[0];
      try {
        const url = new URL(audioLink1);
        const isYouTube = url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
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



  // Remove any "(Book ...)" text from the level
  const levelKey = piece?.level.replace(/\s*\(.*\)/, '') || '';
  const tooltipContent = modalLevelText[levelKey as keyof typeof modalLevelText] || modalLevelText.default;

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!piece) return <LoadingAnimation />;

  const validTechFocus = piece.technique_focus.filter(point => point.trim() !== "");

  return (
    <div>
      <Head>
        <title>{piece.title}</title>
      </Head>
      <NavbarMain />
      <div className="flex flex-col sm:flex-row justify-between mt-5 mx-auto w-[98%]">
        <h1 className="ml-[11px] sm:ml-0 text-2xl sm:text-3xl text-white font-bold">
          {piece.title}
        </h1>
      </div>
      <main className={`grid grid-cols-1 gap-6 p-4 ${hasVideo ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        <div className="container flex flex-col items-start">
          <div className="mb-4">
            <p className="text-md sm:text-lg mb-1 text-white">
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
              {composerInfo?.composer_full_name && (
                <Link
                  href={`/search-results?query=${encodeURIComponent(composerInfo.composer_full_name)}`}
                >
                  <button className="ml-2 text-sm px-2 py-1 bg-black text-white rounded-full hover:bg-gradient-to-br transition-colors duration-300">
                    View Works
                  </button>
                </Link>
              )}
            </p>

            <div className="flex items-center">
              <p className="text-sm text-white sm:text-md italic mr-1">
                {piece.level}
              </p>
              {/* Clicking the question icon opens the modal */}
              <span
                className="cursor-pointer text-gray-500"
                onClick={() => setModalOpen(true)}
              >
                <AiFillQuestionCircle className="inline-block" />
              </span>
            </div>
          </div>

          {/* Accordion for Info */}
          <Accordion
            className="w-full max-w-full md:max-w-2xl"
            expanded={expanded === 'panel1'}
            onChange={handleChange('panel1')}
          >
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
              <p className="text-sm sm:text-md mb-4 break-words">
                {piece.description ? linkify(piece.description) : 'Coming soon...'}
              </p>
              {piece.composition_year && (
                <p className="text-sm sm:text-md mb-4">
                  <strong>Composition Year: </strong>
                  {piece.composition_year === '0000' ? 'N/A' : piece.composition_year}
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
                  {formatDuration(piece.duration)}
                </p>
              )}
              {piece.publisher_info && (
                <p className="text-sm sm:text-md mb-4">
                  <strong>Publisher Info: </strong>
                  {piece.publisher_info}
                </p>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Accordion for Purchase or Download */}
          <Accordion
            className="w-full max-w-full md:max-w-2xl"
            expanded={expanded === 'panel3'}
            onChange={handleChange('panel3')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
              className="ml-1 text-lg font-bold bg-clip-text"
            >
              Purchase or Download
            </AccordionSummary>
            <div className="border-b border-gray-300 my-1"></div>
            <AccordionDetails>
              {piece.where_to_buy_or_download && piece.where_to_buy_or_download.length > 0 ? (
                <div className="text-sm sm:text-md mb-4">
                  {piece.where_to_buy_or_download.map((entry, index) => (
                    entry ? (
                      <div key={index} className="mb-2">
                        <BsFileEarmarkMusicFill className="inline-block align-middle mr-2" />
                        {linkify(entry)}
                      </div>
                    ) : null
                  ))}
                </div>
              ) : (
                <p className="text-sm sm:text-md">Nothing here.</p>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Accordion for Technical Overview */}
          <Accordion
            className="w-full max-w-full md:max-w-2xl"
            expanded={expanded === 'panel2'}
            onChange={handleChange('panel2')}
          >
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
              <p className="text-sm sm:text-md break-words">
                {piece.technical_overview
                  ? linkify(piece.technical_overview)
                  : 'No technical overview available.'}
              </p>
              <br></br>
              {validTechFocus.length > 0 && (
                <>
                  <h2 className="font-bold italic">Technical Focus Points</h2>
                  <ul className="list-disc pl-5 mt-2 text-sm sm:text-md">
                    {validTechFocus.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
            </AccordionDetails>
          </Accordion>


          {/* Accordion for Audio and Recordings */}
          <Accordion
            className="w-full max-w-full mb-10 md:max-w-2xl"
            expanded={expanded === 'panel4'}
            onChange={handleChange('panel4')}
          >
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

        {hasVideo && (
          <div className="container mx-auto flex flex-col">
            <div className="w-full flex justify-center md:justify-end"></div>
            <div className="flex justify-center items-center md:mt-20 lg:mt-20">
              {videoId1 && <VideoIframe videoId={videoId1} title={piece.title} />}
            </div>
          </div>
        )}
      </main>

      {/* Modal Dialog for displaying detailed level information */}
      <LevelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        level={piece.level}
        tooltipContent={tooltipContent}
      />
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const client = await clientPromise;
    const collection = client.db('repertoire').collection('cello_pieces');
    // Pre-generate paths for up to 100 pieces; adjust limit as needed
    const pieces = await collection.find({}, { projection: { id: 1 } }).limit(100).toArray();
    const paths = pieces.map(piece => ({
      params: { id: piece.id.toString() },
    }));
    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error('Error generating paths:', error);
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params || {};
  const parsedId = id && !isNaN(Number(id)) ? Number(id) : null;
  if (parsedId === null) return { notFound: true };

  try {
    const client = await clientPromise;
    const collection = client.db('repertoire').collection('cello_pieces');

    const piece = await collection
      .aggregate([
        { $match: { id: parsedId } },
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
            technique_focus: piece.technique_focus || [], // Include the new field
            is_public_domain: piece.is_public_domain || false,
            where_to_buy_or_download: piece.where_to_buy_or_download || [],
            duration: piece.duration || '',
            coverImage: piece.coverImage || '',
          }
          : null,
        composerInfo: piece?.composerDetails
          ? {
            composer_full_name: piece.composerDetails.composer_full_name || 'Unknown Composer',
            bio_links: piece.composerDetails.bio_link || [],
          }
          : null,
      },
      revalidate: 60, // Revalidate this page every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching piece data:', error);
    return { notFound: true };
  }
};


export default Piece;
