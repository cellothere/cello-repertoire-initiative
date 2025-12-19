import { useState, useEffect, useRef } from "react";
import {
  Dropdown,
  Link,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { BiSolidHomeCircle } from "react-icons/bi";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const NavbarMain = () => {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [isMusicHovered, setisMusicHovered] = useState(false);
  const [isAboutHovered, setisAboutHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Detect mobile view
  const [isMobileView, setIsMobileView] = useState(false);

  // Create refs for the menu containers
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // Adjust the breakpoint as needed
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize); // Update on window resize

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up on component unmount
    };
  }, []);

  // Close the menu if a click happens outside of the menuRef
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close the mobile user menu if a click happens outside
  useEffect(() => {
    if (!isMobileUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target as Node)) {
        setIsMobileUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileUserMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    if (isSearchOpen && searchQuery.trim()) {
      // Perform search when the search input is already open and has content
      router.push(`/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setIsSearchOpen((prev) => !prev);
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
            <Image 
              src="/assets/altLogo.png" 
              alt="Logo" 
              width={100} // Adjust width as needed
              height={64} // Adjust height as needed to match your design (h-16 ≈ 64px)
              className="h-16 w-auto" 
            />
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
        <form onSubmit={handleSearch} className="flex">
          {/* Relative container for input and clear button */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Find music, composers, and resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pr-10 rounded bg-gray-300 border border-gray-600 text-black"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-500 transition"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {/* Submit button */}
          <button
            type="submit"
            className="bg-black text-white px-4 rounded ml-2 hover:bg-teal-600 transition flex items-center justify-center"
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
                className="absolute right-1 top-2 mr-2 text-black hover:text-gray-500 transition"
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
          {router.pathname !== "/search-results" && <FaSearch size={25} />}
        </button>
        {!isSearchOpen && (
          <>
            <Link href="/">
              <BiSolidHomeCircle size={35} className="mr-3" />
            </Link>
            {!authLoading && (
              <button
                onClick={() => setIsMobileUserMenuOpen((prev) => !prev)}
                className="bg-black text-white p-2 rounded-full mr-2"
                aria-label="User menu"
              >
                <FaUserCircle size={24} />
              </button>
            )}
            <Button
              variant="flat"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
              className="bg-black text-white font-bold py-2 px-2 rounded mx-2"
            >
              <RxHamburgerMenu />
            </Button>
          </>
        )}

        {/* Hamburger menu for navigation items */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="z-50 mt-1 absolute top-16 items-center right-0 bg-white w-60 border border-gray-400 rounded shadow-lg flex flex-col"
          >
            <Link href="/cello-music">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Cello Music
              </button>
            </Link>
            <Link href="/recently-added">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Recently Added
              </button>
            </Link>
            <Link href="/featured-databases">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Featured Databases
              </button>
            </Link>
            <Link href="/composers">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Composer List
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                Contact
              </button>
            </Link>
            <Link href="/about-us">
              <button className="w-full py-2 px-4 text-left hover:bg-gray-200">
                About
              </button>
            </Link>
          </div>
        )}

        {/* Mobile user menu */}
        {isMobileUserMenuOpen && (
          <div
            ref={mobileUserMenuRef}
            className="z-50 mt-1 absolute top-16 items-center right-0 bg-white w-60 border border-gray-400 rounded shadow-lg flex flex-col"
          >
            {!authLoading && user ? (
              <>
                <Link href="/account">
                  <button
                    onClick={() => setIsMobileUserMenuOpen(false)}
                    className="w-full py-2 px-4 text-left hover:bg-gray-200"
                  >
                    Account Settings
                  </button>
                </Link>
                <Link href="/saved-pieces">
                  <button
                    onClick={() => setIsMobileUserMenuOpen(false)}
                    className="w-full py-2 px-4 text-left hover:bg-gray-200"
                  >
                    Saved Pieces
                  </button>
                </Link>
                <div className="w-full border-t border-gray-300"></div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileUserMenuOpen(false);
                  }}
                  className="w-full py-2 px-4 text-left hover:bg-gray-200 text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <button
                  onClick={() => setIsMobileUserMenuOpen(false)}
                  className="w-full py-2 px-4 text-left hover:bg-gray-200 text-purple-600 font-medium"
                >
                  Login
                </button>
              </Link>
            )}
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
          className="bg-white font-sans w-50"
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
            <DropdownItem key="CelloMusicSelection" className="custom-dropdown-item text-black p-2">
              <Link href="/cello-music">Cello Music</Link>
            </DropdownItem>
            <DropdownItem key="RecentlyAdded" className="custom-dropdown-item text-black p-2">
              <Link href="/recently-added">Recently Added</Link>
            </DropdownItem>
            <DropdownItem key="FeaturedDatabases" className="custom-dropdown-item text-black p-2">
              <Link href="/featured-databases">Featured Databases</Link>
            </DropdownItem>
            <DropdownItem key="ComposerSelection" className="custom-dropdown-item text-black p-2">
              <Link href="/composers">Composer List</Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {/* About Dropdown */}
        <Dropdown
          onMouseEnter={() => setisAboutHovered(true)}
          onMouseLeave={() => setisAboutHovered(false)}
          isOpen={isAboutHovered}
          className="bg-white font-sans w-45"
        >
          <DropdownTrigger>
            <Button
              className="bg-black text-white hover:bg-teal-600 font-bold py-2 px-4 rounded mx-2"
              onMouseEnter={() => setisAboutHovered(true)}
              onMouseLeave={() => setisAboutHovered(false)}
            >
              More
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="About Options"
            className="custom-dropdown-menu"
            onMouseEnter={() => setisAboutHovered(true)}
            onMouseLeave={() => setisAboutHovered(false)}
          >
            <DropdownItem key="OurMission" className="custom-dropdown-item text-black p-2">
              <Link href="/about-us">Our Mission</Link>
            </DropdownItem>
            <DropdownItem key="ContactUs" className="custom-dropdown-item text-black p-2">
              <Link href="/contact">Contact Us</Link>
            </DropdownItem>
            <DropdownItem key="Contribute" className="custom-dropdown-item text-black p-2">
              <Link href="/contribute">Contribute</Link>
            </DropdownItem>
            <DropdownItem key="OtherResources" className="custom-dropdown-item text-black p-2">
              <Link href="/resources">Resource Catalog</Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {/* User/Login Section */}
        {!authLoading && (
          user ? (
            <Dropdown
              onMouseEnter={() => setIsUserHovered(true)}
              onMouseLeave={() => setIsUserHovered(false)}
              isOpen={isUserHovered}
              className="bg-white font-sans w-45"
            >
              <DropdownTrigger>
                <Button
                  className="bg-black text-white hover:shadow-lg font-bold p-2 rounded-full mx-2"
                  onMouseEnter={() => setIsUserHovered(true)}
                  onMouseLeave={() => setIsUserHovered(false)}
                  isIconOnly
                  aria-label="User menu"
                >
                  <FaUserCircle size={24} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User Options"
                className="custom-dropdown-menu"
                onMouseEnter={() => setIsUserHovered(true)}
                onMouseLeave={() => setIsUserHovered(false)}
              >
                <DropdownItem
                  key="MyAccount"
                  className="custom-dropdown-item text-black p-2"
                  onClick={() => router.push('/account')}
                >
                  Account Settings
                </DropdownItem>
                <DropdownItem
                  key="SavedPieces"
                  className="custom-dropdown-item text-black p-2"
                  onClick={() => router.push('/saved-pieces')}
                >
                  Saved Pieces
                </DropdownItem>
                <DropdownItem
                  key="Logout"
                  className="custom-dropdown-item text-red-600 p-2"
                  onClick={() => logout()}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link href="/login" className="text-black font-bold mx-2 hover:underline">
              Login
            </Link>
          )
        )}
      </nav>
    </header>
  );
};

export default NavbarMain;
