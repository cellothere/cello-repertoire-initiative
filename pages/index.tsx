import { NextPage } from 'next';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { FaArrowRight } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const Home: NextPage = () => {
  const [isMobileView, setIsMobileView] = useState(false);

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
    // Move content to the top after 0.5 seconds
    setTimeout(() => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.classList.add('move-up');
      }
    }, 500); // 500 milliseconds delay
  }, []);

  return (
    <div>
      <Head>
        <title>Cello Repertoire Initiative</title>
      </Head>
      <NavbarMain />
      <main className={`p-4 flex flex-col items-center justify-center h-screen ${isMobileView ? 'mobile-view' : ''}`}>
        {!isMobileView && (
          <>
            <h1 className="text-2xl font-bold mb-4">Explore, Discover, Teach</h1>
            <p className="text-center">Connecting Teachers to Diverse Musical Voices.</p>
          </>
        )}
        <button className={`bg-black text-white px-6 py-3 rounded-lg mt-4 transition-transform hover:scale-110 ${isMobileView ? 'mobile-view' : ''}`}>
          Find music <FaArrowRight className="inline-block ml-2" />
        </button>
        {/* Temporary content */}
        <div className="hidden mt-8">
          {/* Placeholder content */}
          <p>More content...</p>
        </div>
      </main>

      <style jsx>{`
        .move-up {
          transform: translateY(-35%);
          transition: transform 0.5s ease-in-out;
          pointer-events: none; /* Disable pointer events during animation */
        }

        @media (max-width: 768px) {
          .mobile-view h1,
          .mobile-view p {
            display: none; /* Hide h1 and p in mobile view */
          }

          .mobile-view button {
            transform: translateY(-50%); /* Move button up in mobile view */
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
