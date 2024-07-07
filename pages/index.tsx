import { NextPage } from 'next';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { FaArrowRight } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { Link } from "@nextui-org/react";


const Home: NextPage = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Check if viewport width is less than or equal to 768px (typical mobile view)
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize(); // Check initial viewport size
    window.addEventListener('resize', handleResize); // Listen to window resize events
    return () => window.removeEventListener('resize', handleResize); // Clean up event listener
  }, []);

  useEffect(() => {
    // Show content after initial animation
    setTimeout(() => {
      setContentVisible(true);
    }, 0); 
  }, []);

  return (
    <div>
      <Head>
        <title>Cello Repertoire Initiative</title>
      </Head>
      <NavbarMain />
      <main className={`p-4 flex flex-col items-center justify-center ${isMobileView ? 'mobile-view' : ''} ${contentVisible ? 'move-up' : ''}`} style={{ marginTop: isMobileView ? '90px' : '0' }}>
        {!isMobileView && contentVisible && (
          <>
            <h1 className="text-4xl font-mono font-bold mb-4">Explore, Discover, Teach</h1>
            <p className="text-center">Connecting Teachers to Diverse Musical Voices.</p>
          </>
        )}
        <button className={`bg-black text-white px-6 py-3 rounded-lg mt-4 transition-transform hover:scale-110 ${isMobileView ? 'mobile-view' : ''}`}>
          Find music <FaArrowRight className="inline-block ml-2" />
        </button>
        <div className={`mt-8 ${contentVisible ? '' : 'hidden'}`} id="afterMoveUp">
          <div className="flex space-x-6" id="desktop-images">
          <Link href="/cello-music">
            <div className="relative hover:scale-105 duration-300">
              <img src="/assets/cellist3.png" className="w-80 h-120 rounded-lg hover:opacity-75 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
                <p className="text-white text-lg font-bold">Cello Music</p>
              </div>
            </div>
            </Link>
            <div className="m-20"/>
            <Link href="/cello-music">
            <div className="relative hover:scale-105 duration-300">
              <img src="/assets/violin2.png" className="w-80 h-120 rounded-lg hover:opacity-75 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
                <p className="text-white text-lg font-bold">Violin Music</p>
              </div>
            </div>
            </Link>
            <div className="m-20"/>
            <Link href="/contribute">
            <div className="relative hover:scale-105 duration-300">
              <img src="/assets/contribute.png" className="w-80 h-120 rounded-lg hover:opacity-75 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
                <p className="text-white text-lg font-bold">Contribute</p>
              </div>
            </div>
            </Link>
          </div>
        </div>
      </main>

      <style jsx>{`
        .move-up {
          transform: translateY(-1%);
          transition: transform 1.5s ease-in-out;
        }

        @media (max-width: 768px) {
          .mobile-view h1,
          .mobile-view p, 
          .mobile-view #desktop-images {
            display: none;
          }

          .mobile-view button {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
