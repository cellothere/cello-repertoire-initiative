import { NextPage } from 'next';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { FaArrowRight } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { Link } from '@nextui-org/react';
import { Analytics } from "@vercel/analytics/react";

const Home: NextPage = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize(); // Set initial mobile/desktop
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Delay to allow any animations
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Head>
        <title>Cello Repertoire Initiative</title>
      </Head>
      <NavbarMain />
      <main
        className={`p-8 flex flex-col items-center justify-center ${isMobileView ? 'mobile-view' : ''
          } ${contentVisible ? 'move-up' : ''}`}
        style={{ marginTop: isMobileView ? '30px' : '0' }}
      >
        <h1
          className={`text-4xl font-mono font-bold mb-4 text-center ${isMobileView ? 'mobile-title' : ''
            }`}
        >
          Explore, Learn, Teach
        </h1>
        <p className="text-center mb-5">
            Discover music that resonates with you and your students.
        </p>
        <button
          className={`bg-black text-white px-6 py-3 rounded-lg transition-transform hover:scale-110 ${isMobileView ? 'mobile-view mt-4' : 'mt-2 mb-6'
            }`}
        >
          Find music <FaArrowRight className="inline-block ml-2" />
        </button>

        <div className={`${contentVisible ? '' : 'hidden'}`} id="afterMoveUp">
          <div
            className={`flex ${isMobileView ? 'flex-col space-y-6' : 'space-x-6'}`}
            id="images-container"
          >
            {isMobileView ? (
              <>
                {/* Cello Music */}
                <Link href="/cello-music">
                  <div className={`relative ${!isMobileView ? 'hover:scale-105' : ''} duration-300`}>
                    <img
                      src="/assets/cellist3.png"
                      className={`w-80 h-120 rounded-lg transition-opacity duration-300 ${!isMobileView ? 'hover:opacity-75' : ''
                        }`}
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isMobileView ? 'opacity-100 bg-opacity-20' : 'opacity-0 hover:opacity-100'
                        }`}
                    >
                      <p className="text-white text-lg font-bold">Cello Music</p>
                    </div>
                  </div>
                </Link>

                {/* See What's New */}
                <Link href="/cello-music">
                  <div className={`relative ${!isMobileView ? 'hover:scale-105' : ''} duration-300`}>
                    <img
                      src="/assets/whatsNew.png"
                      className={`w-80 h-120 rounded-lg transition-opacity duration-300 ${!isMobileView ? 'hover:opacity-75' : ''
                        }`}
                    />
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isMobileView ? 'opacity-100 bg-opacity-20' : 'opacity-0 hover:opacity-100'
                        }`}
                    >
                      <p className="text-white text-lg font-bold">See What&apos;s New</p>
                      <p className="text-sm font-bold text-white">Coming Soon</p>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                {/* See What's New */}
                <Link href="/cello-music">
                  <div className={`relative ${!isMobileView ? 'hover:scale-105' : ''} duration-300`}>
                    <img
                      src="/assets/whatsNew.png"
                      className={`w-80 h-120 rounded-lg transition-opacity duration-300 ${!isMobileView ? 'hover:opacity-75' : ''
                        }`}
                    />
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isMobileView ? 'opacity-100 bg-opacity-20' : 'opacity-0 hover:opacity-100'
                        }`}
                    >
                      <p className="text-white text-lg font-bold">See What&apos;s New</p>
                      <p className="text-sm font-bold text-white">Coming Soon</p>
                    </div>
                  </div>
                </Link>

                {/* Cello Music */}
                <Link href="/cello-music">
                  <div className={`relative ${!isMobileView ? 'hover:scale-105' : ''} duration-300`}>
                    <img
                      src="/assets/cellist3.png"
                      className={`w-80 h-120 rounded-lg transition-opacity duration-300 ${!isMobileView ? 'hover:opacity-75' : ''
                        }`}
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isMobileView ? 'opacity-100 bg-opacity-20' : 'opacity-0 hover:opacity-100'
                        }`}
                    >
                      <p className="text-white text-lg font-bold">Cello Music</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {/* Contribute */}
            <Link href="/contribute">
              <div className={`relative ${!isMobileView ? 'hover:scale-105' : ''} duration-300`}>
                <img
                  src="/assets/contribute.png"
                  className={`w-80 h-120 rounded-lg transition-opacity duration-300 ${!isMobileView ? 'hover:opacity-75' : ''
                    }`}
                />
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isMobileView ? 'opacity-100 bg-opacity-20' : 'opacity-0 hover:opacity-100'
                    }`}
                >
                  <p className="text-white text-lg font-bold">Contribute</p>
                  <p className="text-sm font-bold text-white">
                    Suggest an addition to our catalog
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <Analytics />
      </main>

      <style jsx>{`
        .move-up {
          transform: translateY(-1%);
          transition: transform 1.5s ease-in-out;
        }

        .mobile-title {
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .mobile-title {
            white-space: pre-wrap;
            text-align: center;
            line-height: 1.2;
          }

          .mobile-view p {
            display: block;
          }

          .mobile-view button {
            transform: translateY(-50%);
          }

          #images-container {
            flex-direction: column;
            gap: 1.5rem; /* Adjust for spacing */
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
