// pages/search-results.tsx (or wherever your SearchResults component is located)
import { useState, useEffect } from "react";
import Head from "next/head";
import NavbarMain from "@/components/navbar-main";
import { NextPage } from "next";
import MusicCard from "../components/music-card"; // Import MusicCard

const SearchResults: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Optional: Loading state
  const [error, setError] = useState<string | null>(null); // Optional: Error state

  useEffect(() => {
    // Fetch query from URL if provided
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("query") || "";
      setSearchQuery(query);

      if (query) {
        fetchSearchResults(query);
      }
    }
  }, []);

  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const results = await response.json();
      setSearchResults(results);
    } catch (error: any) {
      console.error("Error fetching search results:", error);
      setError("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery.trim());
    }
  };

  return (
    <div>
      <Head>
        <title>
          {searchQuery.trim() ? `Search Results: ${searchQuery.trim()}` : "Search Results"}
        </title>
      </Head>
      <NavbarMain />
      <main className="p-4 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-6">Search Results</h1>
        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8 flex flex-col sm:flex-row items-stretch sm:items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or composer..."
            className="flex-grow p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search"
          />
          <button
            type="submit"
            className="mt-2 sm:mt-0 sm:ml-2 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Search
          </button>
        </form>

        {/* Loading and Error States */}
        {loading && <p className="text-center text-gray-700">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Search Results */}
        {!loading && !error && (
          <>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((result) => (
                  <MusicCard
                    key={result.id}
                    id={result.id}
                    title={result.title}
                    composer={result.composer}
                    level={result.level}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No results found.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
