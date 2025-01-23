import Link from 'next/link';
import { CiHeart } from "react-icons/ci";
import { FaInfoCircle } from "react-icons/fa";

interface MusicCardProps {
  id: string;
  title: string;
  composer: string;
  level: string;
}

const MusicCard: React.FC<MusicCardProps> = ({ id, title, composer, level }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:scale-105 transition-transform duration-300">
    <Link href={`/piece/${id}`} className="block h-full">
      <div className="flex flex-col h-full">
        {/* Title and Composer */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600">
            by <span className="font-medium">{composer}</span>
          </p>
          <p className="text-gray-600 italic mt-1">{level}</p>
        </div>
  
        {/* Divider */}
        <div className="flex-grow border-b border-gray-300 my-3" />
  
        {/* Centered Button Row */}
        <div className="flex justify-center mt-auto">
          <button className="bg-black text-white px-10 py-1 rounded-full text-center hover:bg-gray-800 transition-colors">
            See more
          </button>
        </div>
      </div>
    </Link>
  </div>
  
  );
};

export default MusicCard;
