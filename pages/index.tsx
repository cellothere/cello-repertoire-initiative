import { NextPage } from 'next';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { FaArrowRight } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Define static image data outside the component
const mobileImages = [
  { href: '/cello-music', src: '/assets/cellist3.png', label: 'Cello Music' },
  { href: '/featured-databases', src: '/assets/whatsNew.png', label: "Featured Databases", subLabel: '' },
  { href: '/contribute', src: '/assets/contribute.png', label: 'Contribute', subLabel: 'Suggest an addition to our catalog' }
];

const desktopImages = [
  { href: '/featured-databases', src: '/assets/whatsNew.png', label: "Featured Databases", subLabel: '' },
  { href: '/cello-music', src: '/assets/cellist3.png', label: 'Cello Music' },
  { href: '/contribute', src: '/assets/contribute.png', label: 'Contribute', subLabel: 'Suggest an addition to our catalog' }
];

// Custom hook for detecting mobile view
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);
  return isMobile;
}

const Home: NextPage = () => {
  const isMobileView = useIsMobile();
  const [contentVisible, setContentVisible] = useState(false);

  // Use a short timeout for a potential animation effect (adjust if needed)
  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Head>
        <title>Cello Repertoire Initiative</title>
        <meta name="description" content="Discover music that resonates with you and your students." />
      </Head>
      <NavbarMain />
      <main
        className={`p-8 flex flex-col items-center justify-center ${isMobileView ? 'mobile-view' : ''} ${contentVisible ? 'move-up' : ''}`}
        style={{ marginTop: isMobileView ? '30px' : '0' }}
      >
        <h1 className={`text-4xl font-mono font-bold mb-4 text-center ${isMobileView ? 'mobile-title' : ''}`}>
          Teach. Learn. Perform.
        </h1>
        <p className="text-center mb-5">
          Discover music that resonates with you and your students.
        </p>
        <Link href="/cello-music">
          <button className="bg-black text-white px-6 py-3 rounded-lg transition-transform hover:scale-110 mt-2 mb-6">
            Find music <FaArrowRight className="inline-block ml-2" />
          </button>
        </Link>

        {contentVisible && (
          <div id="images-container" className={`flex ${isMobileView ? 'flex-col space-y-6' : 'space-x-6 flex-row justify-center'}`}>
            {(isMobileView ? mobileImages : desktopImages).map(({ href, src, label, subLabel }, index) => (
              <Link key={index} href={href}>
                <div className={`relative ${isMobileView ? '' : 'hover:scale-105'} duration-300`}>
                  <Image 
                    src={src}
                    alt={label}
                    width={320}  // Adjust width as needed
                    height={480} // Adjust height as needed
                    className={`w-80 h-120 rounded-lg transition-opacity duration-300 ${isMobileView ? '' : 'hover:opacity-75'}`}
                  />
                  <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black ${isMobileView ? 'bg-opacity-20' : 'bg-opacity-50 opacity-0 hover:opacity-100'} transition-opacity duration-300`}>
                    <p className="text-white text-lg font-bold">{label}</p>
                    {subLabel && <p className="text-sm font-bold text-white">{subLabel}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Analytics />
        <SpeedInsights />
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
            text-align: center;
            line-height: 1.2;
          }

          #images-container {
            flex-direction: column;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
