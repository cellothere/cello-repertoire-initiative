import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';

interface MusicPiece {
  title: string;
  level_id: string;
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

const PieceDetailPage: NextPage<MusicPiece> = ({ title, level_id }) => {
  return (
    <div>
      <Head>
        <title>{title} Details</title>
      </Head>
      <NavbarMain />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-6">{title} Details</h1>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
         
          <p className="text-gray-600">Level: {getLevelDescription(level_id)}</p>
        </div>
      </main>
    </div>
  );
};

export default PieceDetailPage;

// Fetch data for this specific piece based on its ID
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params || typeof params.id !== 'string') {
    return {
      notFound: true,
    };
  }

  const { id } = params;

  console.log(id)

  try {
    
    const res = await fetch(`../../api/music/piece`);
    console.log('got here')
    if (!res.ok) {
        
      return {
        notFound: true,
      };
    }

    const data = await res.json();

    return {
      props: {
        title: data.title,
        level_id: data.level_id,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
