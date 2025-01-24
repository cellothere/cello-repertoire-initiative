import { useState } from "react";
import { Dropdown, Link, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaSearch } from "react-icons/fa";
import { BiSolidHomeCircle } from "react-icons/bi";
import { useRouter } from "next/router";

const NavbarMain = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMusicHovered, setisMusicHovered] = useState(false);
  const [isAboutHovered, setisAboutHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-gray-100 text-black p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Link href="/">
            <img src="/assets/altLogo.png" alt="Logo" className="h-16 w-auto" />
          </Link>
        </div>
        <Link href="/" id="navName" className="hidden md:inline">
          <span className="ml-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br">
            Cello Repertoire Initiative
          </span>
        </Link>
      </div>
      <div className="flex-grow max-w-lg mx-4" id="searchMenu">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Find music, composers, and resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded bg-gray-300 border border-gray-600 text-black"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 rounded ml-2 hover:bg-teal-600 transition"
          >
            <FaSearch />
          </button>
        </form>
      </div>
      <nav className="hidden md:flex">
        <Link href="/">
          <button className="bg-black hover:bg-teal-600 text-white font-bold py-2 px-4 rounded mx-2">
            Home
          </button>
        </Link>
        <Dropdown
          onMouseEnter={() => setisMusicHovered(true)}
          onMouseLeave={() => setisMusicHovered(false)}
          isOpen={isMusicHovered}
          className="bg-white font-sans w-40"
        >
          <DropdownTrigger>
            <Button
              className="bg-black text-white hover:bg-teal-600 font-bold py-2 px-4 rounded mx-2"
              onMouseEnter={() => setisMusicHovered(true)}
              onMouseLeave={() => setisMusicHovered(false)}
            >
              <Link href="/cello-music">Music</Link>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Music Options"
            className="custom-dropdown-menu"
            onMouseEnter={() => setisMusicHovered(true)}
            onMouseLeave={() => setisMusicHovered(false)}
          >
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="/cello-music">Cello</Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="/cello-music">Recently Added</Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown
          onMouseEnter={() => setisAboutHovered(true)}
          onMouseLeave={() => setisAboutHovered(false)}
          isOpen={isAboutHovered}
          className="bg-white font-sans w-40"
        >
          <DropdownTrigger>
            <Button
              className="bg-black text-white hover:bg-teal-600 font-bold py-2 px-4 rounded mx-2"
              onMouseEnter={() => setisAboutHovered(true)}
              onMouseLeave={() => setisAboutHovered(false)}
            >
              About
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="About Options"
            className="custom-dropdown-menu"
            onMouseEnter={() => setisAboutHovered(true)}
            onMouseLeave={() => setisAboutHovered(false)}
          >
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="/coming-soon">Our Mission</Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="/coming-soon">Contact Us</Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="/coming-soon">Contribute</Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="/coming-soon">Other Resources</Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center">
        <Link href="/">
          <FaSearch size={25} className="mr-4" />
        </Link>
        <Link href="/">
          <BiSolidHomeCircle size={30} className="mr-3" />
        </Link>
        <Button
          variant="flat"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          className="bg-black text-white font-bold py-2 px-2 rounded mx-2"
        >
          <RxHamburgerMenu />
        </Button>
        {isMenuOpen && (
          <div className="z-50 mt-1 absolute top-16 right-0 bg-white w-48 border border-gray-400 rounded shadow-lg">
            <Link href="/">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">Home</button>
            </Link>
            <Link href="/cello-music">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">Music</button>
            </Link>
            <Link href="/contact">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">Contact</button>
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-dropdown-menu {
          background-color: white;
        }
        .custom-dropdown-item {
          margin-bottom: 8px;
        }
        .custom-dropdown-item:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          #navName {
            display: none;
          }
          #searchMenu {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default NavbarMain;
