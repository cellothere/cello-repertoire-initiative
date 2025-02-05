import Link from 'next/link';
import { CiHeart } from "react-icons/ci";
import { FaInfoCircle } from "react-icons/fa";

interface MusicCardProps {
    id: number;
    title: string;
    composer: string;
    level: string;
}

const MusicCard: React.FC<MusicCardProps> = ({ id, title, composer, level }) => {
    // Dynamically determine the text size
    const titleClass = title.length > 40 ? "text-sm" : title.length > 25 ? "text-md" : "text-lg";

    return (
        <div className="bg-white shadow-md rounded-sm p-4 hover:scale-105 transition-transform duration-300">
            <Link href={`/piece/${id.toString()}`} className="block h-full">
                <div className="flex flex-col h-full">
                    {/* Content */}
                    <div className="flex-grow flex flex-col">
                        <h2 className={`text-lg font-semibold text-gray-800`}>{title}</h2>
                        <p className="text-gray-600">
                            by <span className={`font-medium`}>{composer}</span>
                        </p>
                    </div>

                    {/* Level */}
                    <div className="mt-5">
                        <strong><p className="text-black">{level}</p></strong>
                    </div>

                    {/* Divider */}
                    <div className="border-b border-gray-300 mb-3 mt-1" />

                    {/* Centered Button Row */}
                    <div className="flex justify-center">
                        <button className="bg-black text-white w-[75%] max-w-xs py-1 rounded-full text-center hover:bg-gradient-to-br transition-colors">
                            See more
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MusicCard;
