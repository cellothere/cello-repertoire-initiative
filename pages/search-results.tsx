import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavbarMain from "@/components/navbar-main";
import { NextPage } from "next";
import MusicCard from "@/components/music-card";
import LoadingAnimation from "@/components/loading-animation";

const SearchResults: NextPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchResults = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const results = await response.json();
      setSearchResults(results);
    } catch (err: any) {
      console.error("Error fetching search results:", err);
      setError("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const queryParam = (router.query.query as string) || "";
      setSearchQuery(queryParam);
      if (queryParam) {
        fetchSearchResults(queryParam);
      }
    }
  }, [router.isReady, router.query.query, fetchSearchResults]);

  const handleSearch = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery) {
        router.push(`/search-results?query=${encodeURIComponent(trimmedQuery)}`);
        fetchSearchResults(trimmedQuery);
      }
    },
    [searchQuery, router, fetchSearchResults]
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    router.push("/search-results");
  }, [router]);

  return (
    <div>
      <Head>
        <title>
          {searchQuery.trim() ? `Search Results: ${searchQuery.trim()}` : "Search Results"}
        </title>
      </Head>
      <NavbarMain />
      <main className="p-4 min-h-screen container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Search Results</h1>
        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="max-w-md mx-auto mb-8 flex flex-col sm:flex-row items-stretch sm:items-center"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or composer..."
            className="flex-grow p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search"
          />
          <div className="flex mt-2 sm:mt-0 sm:ml-2 gap-2">
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Loading and Error States */}
        {loading && (
          <p className="text-gray-700 text-center">
            <LoadingAnimation />
          </p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Search Results */}
        {!loading && !error && (
          <>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.map((result) => (
                  <MusicCard
                    key={result.id}
                    id={result.id}
                    instrument='cello'
                    title={result.title}
                    composer_first_name={result.composer_first_name}
                    composer_last_name={result.composer_last_name}
                    level={result.level}
                    instrumentation={result.instrumentation}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-white">No results found.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
