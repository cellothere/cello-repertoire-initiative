import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Cello Repertoire Initiative</title>
      </Head>
      <header className="bg-gray-100 text-black p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img src="/assets/altLogo.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <span className="ml-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br">Cello Repertoire Initiative</span>

        </div>
        <div className="flex-grow max-w-lg mx-4">
          <input
            type="text"
            placeholder="Find music, composers, and resources..."
            className="w-full p-2 rounded bg-gray-300 border border-gray-600 text-white"
          />
        </div>
        <nav>
          <button className="bg-purple-500 hover:bg-teal-400  text-white font-bold py-2 px-4 rounded mx-2">
            Home
          </button>
          <Link href="/music">
          <button className="bg-purple-500 hover:bg-teal-400  text-white font-bold py-2 px-4 rounded mx-2">
            Music
          </button>
          </Link>
          <button className="bg-purple-500 hover:bg-teal-400  text-white font-bold py-2 px-4 rounded mx-2">
            Contact
          </button>
        </nav>
      </header>
      <main className="p-4 flex flex-col items-center justify-center h-screen">
  <h1 className="text-2xl font-bold mb-4">Welcome to the Cello Repertoire Initiative!</h1>
  <p className="text-center">Your source for curated cello music pieces.</p>
</main>
    </div>
  );
};

export default Home;
