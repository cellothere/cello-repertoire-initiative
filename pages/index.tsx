import { NextPage } from 'next';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { FaArrowRight } from 'react-icons/fa';
const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Cello Repertoire Initiative</title>
      </Head>
      <NavbarMain />
      <main className="p-4 flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Explore, Discover, Teach</h1>
        <p className="text-center">Connecting Teachers to Diverse Musical Voices.</p>
        <button className="bg-black text-white px-6 py-3 rounded-lg mt-4 transition-transform hover:scale-110">
          Find music <FaArrowRight className="inline-block ml-2" />
        </button>
      </main>
    </div>
  );
};

export default Home;
