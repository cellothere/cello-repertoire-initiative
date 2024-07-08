import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link'; // Import Link from Next.js
import Head from 'next/head';
import clientPromise from '@/lib/mongodb';
import NavbarMain from '@/components/navbar-main';

interface PieceProps {
  piece: {
    id: number;
    title: string;
    composer: string;
    level_id: string;
    description: string;
  };
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

const Piece: NextPage<PieceProps> = ({ piece }) => {
  // if (!piece) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div>
      <Head>
        <title>{piece.title}</title>
      </Head>
      <NavbarMain />
      <div className="container mx-auto p-4 mt-16">
        <h1 className="text-3xl font-bold mb-4">{piece.title}</h1>
        <p className="text-xl mb-2">by {piece.composer}</p>
        <p className="text-md mb-2">{getLevelDescription(piece.level_id)}</p>
        <p className="text-md mb-4">{piece.description}</p>
        <Link href="/music">Back to Music</Link>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const client = await clientPromise;
  const collection = client.db('cello_repertoire').collection('music_pieces');

  console.log("GOT HERE!!!!!!")

  const piece = await collection.findOne({ id });



  return {
    props: {
      piece: piece ? {
        id: piece.id,
        title: piece.title,
        level_id: piece.level_id,
      } : null,
    },
  };
};

export default Piece;
