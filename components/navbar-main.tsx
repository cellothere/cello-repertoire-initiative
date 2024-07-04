//main nav bar
import Link from 'next/link';

const NavbarMain = () => {
  return (
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
    <Link href="/">
      <button className="bg-purple-500 hover:bg-teal-400  text-white font-bold py-2 px-4 rounded mx-2">
        Home
      </button>
    </Link>
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
  )
}

export default NavbarMain
