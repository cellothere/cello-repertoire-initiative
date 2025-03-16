import Link from 'next/link';
import { FaUsers, FaBookOpen } from 'react-icons/fa';
import { MdLibraryMusic } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="w-full text-white border-t border-white/50 shadow-sm">
      <div className="flex flex-row items-center justify-center p-4">
        <Link href="/composers">
          <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
            <FaUsers size={24} />
            <span className="mt-1 text-xs">Composer Database</span>
          </button>
        </Link>
        <Link href="/featured-databases">
          <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
            <MdLibraryMusic size={24} />
            <span className="mt-1 text-xs">Featured Databases</span>
          </button>
        </Link>
        <Link href="/resources">
          <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
            <FaBookOpen size={24} />
            <span className="mt-1 text-xs">External Resources</span>
          </button>
        </Link>
      </div>
      <div className="text-center text-xs font-mono py-2">
        © {new Date().getFullYear()} Cello Repertoire Initiative - All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
