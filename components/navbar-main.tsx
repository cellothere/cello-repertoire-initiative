import { useState } from 'react';
import { Dropdown, Link, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaSearch } from "react-icons/fa";
import { BiSolidHomeCircle } from "react-icons/bi";

const NavbarMain = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-100 text-black p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Link href='/'>
            <img src="/assets/altLogo.png" alt="Logo" className="h-16 w-auto" />
          </Link>
        </div>
        <Link href='/' id='navName' className="hidden md:inline">
          <span className="ml-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br">Cello Repertoire Initiative</span>
        </Link>
      </div>
      <div className="flex-grow max-w-lg mx-4" id="searchMenu">
        <input
          type="text"
          placeholder="Find music, composers, and resources..."
          className="w-full p-2 rounded bg-gray-300 border border-gray-600 text-white"
        />
      </div>
      <nav className="hidden md:flex">
        <Link href="/">
          <button className="bg-black hover:bg-teal-600 text-white font-bold py-2 px-4 rounded mx-2">
            Home
          </button>
        </Link>
        <Dropdown
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          isOpen={isHovered}
          className="bg-white font-sans w-32"
        >
          <DropdownTrigger>
            <Button
              className="bg-black text-white font-bold py-2 px-4 rounded mx-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              
            >
              <Link href="/cello-music">
                Music
              </Link>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Music Options"
            className="custom-dropdown-menu"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <DropdownItem className="custom-dropdown-item text-black bg-white-500 text-black p-2">
              <Link href="#">
                Violin
              </Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="#">
                Viola 
              </Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="/cello-music">
                Cello
              </Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item text-black p-2">
              <Link href="#">
                Bass
              </Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Link href="/About">
          <button className="bg-black hover:bg-teal-600 text-white font-bold py-2 px-4 rounded mx-2">
            About
          </button>
        </Link>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center">
      <Link href="/">
        <FaSearch size={25} className="mr-4"/>
        </Link>
        <Link href="/">
        <BiSolidHomeCircle size={30} className="mr-3"/>
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
