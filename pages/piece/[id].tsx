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
import YouTube, { YouTubeProps } from 'react-youtube';
import VideoIframe from '@/components/youtube-iframe'



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

const videoId = "ybwuiP6v7hk";
  const videoTitle = "[전인혁작곡] 야다(Yada) - 약속 (2019 ver)";

const Piece: NextPage<PieceProps> = ({ piece, composerInfo }) => {
  const [videoId1, setVideoId1] = useState<string | null>(null);

  useEffect(() => {
    if (piece && piece.audio_link && piece.audio_link.length > 1) {
      const audioLink1 = piece.audio_link[0];
      setVideoId1(audioLink1.slice(-11));
    }
  }, [piece]);

  if (!piece) {
    return <LoadingAnimation />;
  }

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    event.target.pauseVideo();
  }

  const opts: YouTubeProps['opts'] = {
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
                <Link href={composerInfo?.articles[0] || ''} className="underline">{composerInfo?.composer_name || 'Unknown Composer'}</Link>
              </p>
              <div className="flex items-center">
                <p className="text-md text-lg italic mr-1">{' - '}{getLevelDescription(piece.level_id.toString())}</p>
                <AiFillQuestionCircle className="mb-2" />
              </div>
            </div>
          </div>

          <Accordion className="w-full md:w-[600px]">
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
                  {piece.where_to_buy_or_download.map((link, index) => (
                    link && (
                      <div key={index}>
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
            </AccordionDetails>
          </Accordion>
        </div>
  
        <div className="container mx-auto flex flex-col items-center">
          <div className="w-full flex justify-end">
            <button className="bg-black text-white px-4 py-2 mb-3 rounded-lg transition-transform hover:scale-105">
              <Link href="../">
                Back to Home <FaArrowRight className="inline-block ml-2" />
              </Link>
            </button>
          </div>
          {videoId1 && <div className="w-full">
            <VideoIframe videoId={videoId1} title=""/>
          </div>}
        </div>

      </main>
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
        isArrangement: piece.isArrangement || false,
        audio_link: piece.audio_link || [],
        publisher_info: piece.publisher_info || '',
        description: piece.description || '',
        technical_overview: piece.technical_overview || '',
        is_public_domain: piece.is_public_domain || false,
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
