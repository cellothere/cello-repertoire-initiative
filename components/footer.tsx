import Link from 'next/link';
import { FaUsers, FaBookOpen } from 'react-icons/fa';
import { MdLibraryMusic } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="footer w-full text-white relative">
      {/* Navigation Buttons */}
      <div className="flex flex-row items-center justify-center p-4">
        <Link href="/composers">
          <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
            <FaUsers size={34} />
            <span className="mt-1 text-xs">Composer Database</span>
          </button>
        </Link>
        <Link href="/featured-databases">
          <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
            <MdLibraryMusic size={34} />
            <span className="mt-1 text-xs">Featured Databases</span>
          </button>
        </Link>
        <Link href="/resources">
          <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
            <FaBookOpen size={34} />
            <span className="mt-1 text-xs">Resource Catalog</span>
          </button>
        </Link>
      </div>
      
      {/* Copyright */}
      <div className="text-center text-xs font-mono py-2">
        © {new Date().getFullYear()} Cello Repertoire Initiative - All Rights Reserved
      </div>
      
      {/* Shaded border using a pseudo-element */}
      <style jsx>{`
        .footer::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 0;
          width: 100%;
          height: 8px;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), transparent);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
