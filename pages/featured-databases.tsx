// pages/featuredDatabases.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import NavbarMain from '@/components/navbar-main';
import MusicCard from '@/components/music-card';
import LoadingAnimation from '@/components/loading-animation';

interface MusicPiece {
    _id?: string;
    id: number;
    title: string;
    composer: string;
    composer_last_name: string;
    composer_first_name: string;
    composition_year: string;
    level: string;
    instrumentation: string[];
    nationality?: string | string[];
    duration: string;
}

interface Composer {
    composer_full_name: string;
    composer_last_name: string;
    composer_first_name: string;
    born?: string;
    died?: string;
    composer_bio?: string;
    bio_link: string[];
    nationality: string[];
    tags: string[];
    id: number;
}

const FeaturedDatabases: NextPage = () => {
    const [featuredPieces, setFeaturedPieces] = useState<MusicPiece[]>([]);
    const [composers, setComposers] = useState<Composer[]>([]);
    const [allPieces, setAllPieces] = useState<MusicPiece[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('Woman');

    // Function to fetch data from both APIs.
    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch composers and flatten them.
            const composersRes = await fetch('/api/composers');
            const composersData = await composersRes.json();
            const composersFlat: Composer[] = composersData.flatMap(
                (group: { composers: Composer[] }) => group.composers
            );
            setComposers(composersFlat);

            // Fetch music pieces and flatten them.
            const piecesRes = await fetch('/api/celloMusic');
            const piecesData = await piecesRes.json();
            const allPiecesFlat: MusicPiece[] = piecesData.flatMap(
                (group: { musicPieces: MusicPiece[] }) => group.musicPieces
            );
            setAllPieces(allPiecesFlat);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reload data whenever selectedCategory changes (including on mount).
    useEffect(() => {
        fetchData();
    }, [selectedCategory]);

    // Filter music pieces based on composers and the selected tag.
    useEffect(() => {
        if (composers.length && allPieces.length) {
            // Filter composers based on the selected tag.
            const filteredComposers = composers.filter(
                (composer) =>
                    composer.tags && composer.tags.includes(selectedCategory)
            );
            // Create a set of composer full names for quick lookup.
            const composerNames = new Set(
                filteredComposers.map(
                    (composer) => composer.composer_full_name
                )
            );
            // Filter music pieces whose composer appears in the filtered set.
            const filteredPieces = allPieces.filter((piece) =>
                composerNames.has(piece.composer)
            );
            setFeaturedPieces(filteredPieces);
        }
    }, [composers, allPieces, selectedCategory]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <Head>
                <title>Featured Databases - Cello Music</title>
            </Head>
            <NavbarMain />
            <header className="py-10 bg-gradient-to-r from-purple-600 to-pink-600 text-center text-white">
                <h1 className="text-4xl font-bold">Featured Databases</h1>
                <p className="mt-2 text-lg">
                    {selectedCategory === 'LGBTQIA+'
                        ? 'Non-Binary Composers'
                        : selectedCategory === 'Black'
                            ? 'Black Composers'
                            : selectedCategory === 'Woman'
                                ? 'Women Composers'
                                : ''}
                </p>
                <div className="mt-4">
                    {/* Mobile: Dropdown for selection */}
                    <div className="md:hidden">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="p-2 rounded text-gray-900"
                        >
                            <option value="Woman">Women Composers</option>
                            <option value="LGBTQIA+">Non-Binary Composers</option>
                            <option value="Black">Black Composers</option>

                        </select>
                    </div>
                    {/* Desktop: Button group for selection */}
                    <div className="hidden md:flex justify-center space-x-4">
                        <button
                            onClick={() => setSelectedCategory('Woman')}
                            className={`px-4 py-2 rounded ${selectedCategory === 'Woman'
                                ? 'bg-purple-700 text-white'
                                : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            Women Composers
                        </button>
                        <button
                            onClick={() => setSelectedCategory('LGBTQIA+')}
                            className={`px-4 py-2 rounded ${selectedCategory === 'LGBTQIA+'
                                ? 'bg-purple-700 text-white'
                                : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            Non-Binary Composers
                        </button>
                        <button
                            onClick={() => setSelectedCategory('Black')}
                            className={`px-4 py-2 rounded ${selectedCategory === 'Black'
                                ? 'bg-purple-700 text-white'
                                : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            Black Composers
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 pb-10">
                {loading ? (
                    <LoadingAnimation />
                ) : featuredPieces.length === 0 ? (
                    <div className="text-center mt-10">
                        No featured pieces found.
                    </div>
                ) : (
                    // Two cards per row on mobile; more columns for larger screens.
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
                        {featuredPieces.map((piece) => (
                            <MusicCard
                                key={piece.id}
                                id={piece.id}
                                title={piece.title}
                                composer_first_name={piece.composer_first_name}
                                composer_last_name={piece.composer_last_name}
                                level={piece.level}
                                instrumentation={piece.instrumentation}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FeaturedDatabases;
