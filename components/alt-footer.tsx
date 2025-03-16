import { FaUsers, FaBookOpen } from 'react-icons/fa';
import { MdLibraryMusic } from "react-icons/md";

const AltFooter = () => {
  return (
    <footer className="w-full text-white mt-10 mb-3 border-white/50 shadow-sm">
      <div className="text-center text-xs font-mono py-2">
        © {new Date().getFullYear()} Cello Repertoire Initiative - All Rights Reserved
      </div>
    </footer>
  );
};

export default AltFooter;
