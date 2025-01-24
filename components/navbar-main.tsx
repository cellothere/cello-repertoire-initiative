import { useState } from "react";
import {
  Dropdown,
  Link,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaSearch } from "react-icons/fa";
import { BiSolidHomeCircle } from "react-icons/bi";
import { useRouter } from "next/router";

const NavbarMain = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMusicHovered, setisMusicHovered] = useState(false);
  const [isAboutHovered, setisAboutHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    if (isSearchOpen && searchQuery.trim()) {
      // Perform search when the search input is already open and has content
      router.push(`/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setIsSearchOpen(!isSearchOpen);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Perform search when "Enter" key is pressed
      router.push(`/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-gray-100 text-black p-4 flex items-center justify-between">
      {/* Logo Section */}
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

      {/* Desktop Search Section */}
      <div className="flex-grow max-w-lg mx-4 hidden md:block" id="searchMenu">
        <form onSubmit={handleSearch} className="flex relative">
          <input
            type="text"
            placeholder="Find music, composers, and resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded bg-gray-300 border border-gray-600 text-black"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-10 top-2 text-black hover:text-gray-500 transition"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="bg-black text-white px-4 rounded ml-2 hover:bg-teal-600 transition"
          >
            <FaSearch />
          </button>
        </form>
      </div>

      {/* Mobile Menu Section */}
      <div className="md:hidden flex items-center relative">
        {isSearchOpen && (
          <div className="flex relative w-full">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown} // Trigger search on "Enter"
              className="w-full p-2 rounded bg-gray-300 border border-gray-600 text-black"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-1 top-2 text-black hover:text-gray-500 transition"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <button
          onClick={toggleSearch}
          className="bg-transparent text-black p-2 mx-2"
          aria-label="Toggle Search"
        >
          <FaSearch size={25} />
        </button>
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
          <div className="z-50 mt-1 absolute top-16 items-center right-0 bg-white w-40 border border-gray-400 rounded shadow-lg flex flex-col">
            <Link href="/">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Home
              </button>
            </Link>
            <Link href="/cello-music">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Music
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Contact
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex">
        <Link href="/">
          <button className="bg-black hover:bg-teal-600 text-white font-bold py-2 px-4 rounded mx-2">
            Home
          </button>
        </Link>
        {/* Music Dropdown */}
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
        {/* About Dropdown */}
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
    </header>
  );
};

export default NavbarMain;
