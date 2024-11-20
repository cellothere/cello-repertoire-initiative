import { useState, useEffect } from "react";
import Head from "next/head";
import NavbarMain from "@/components/navbar-main";
import { NextPage } from "next";
import Link from "next/link";

const SearchResults: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    // Fetch query from URL if provided
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query") || "";
    setSearchQuery(query);

    if (query) {
      fetchSearchResults(query);
    }
  }, []);

  const fetchSearchResults = async (query: string) => {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchSearchResults(searchQuery);
  };

  return (
    <div>
      <Head>
        <title>Search Results</title>
      </Head>
      <NavbarMain />
      <main className="p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Search Results</h1>
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 border border-gray-300 rounded text-black"
          />
          <button
            type="submit"
            className="mt-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Search
          </button>
        </form>
        <div>
          {searchResults.length > 0 ? (
            <ul className="space-y-4">
              {searchResults.map((result, index) => (
                <li key={index} className="p-4 bg-white shadow rounded">
                  <h2 className="text-xl font-semibold">{result.title}</h2>
                  <p className="text-gray-600">{result.composer}</p>
                  <p className="text-gray-500">{result.level}</p>
                  <Link href={`/piece/${result.id}`} className="text-blue-500 hover:underline">
                    View Details
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No results found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
