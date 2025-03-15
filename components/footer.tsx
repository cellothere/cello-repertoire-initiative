import { FaDatabase, FaStar, FaExternalLinkAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full text-white border-t border-white/50 shadow-sm">
      <div className="flex flex-row items-center justify-center p-4">
        <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
          <FaDatabase size={24} />
          <span className="mt-1 text-xs">Composer Database</span>
        </button>
        <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
          <FaStar size={24} />
          <span className="mt-1 text-xs">Featured Databases</span>
        </button>
        <button className="flex flex-col items-center my-2 mx-2 lg:mx-12 hover:opacity-80">
          <FaExternalLinkAlt size={24} />
          <span className="mt-1 text-xs">External Resources</span>
        </button>
      </div>
      <div className="text-center text-xs font-mono py-2">
        © {new Date().getFullYear()} Cello Repertoire Initiative - All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
