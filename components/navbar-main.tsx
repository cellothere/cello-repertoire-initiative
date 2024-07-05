import Link from 'next/link';
import { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/dropdown';

const NavbarMain = () => {
  // State to track hover state
  const [isHovered, setIsHovered] = useState(false);

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
          <button className="bg-purple-500 hover:bg-teal-400 text-white font-bold py-2 px-4 rounded mx-2">
            Home
          </button>
        </Link>
        <Dropdown
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          isOpen={isHovered}
        >
          <DropdownTrigger>
            <button
              className="bg-purple-500 text-white font-bold py-2 px-4 rounded mx-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Link href="/music">
                Music
              </Link>
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Music Options"
            className="custom-dropdown-menu"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <DropdownItem className="custom-dropdown-item">
              <Link href="#">
                Violin Sheet Music
              </Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item">
              <Link href="#">
                Viola Sheet Music
              </Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item">
              <Link href="#">
                Cello Sheet Music
              </Link>
            </DropdownItem>
            <DropdownItem className="custom-dropdown-item">
              <Link href="#">
                Bass Sheet Music
              </Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Link href="/contact">
          <button className="bg-purple-500 hover:bg-teal-400 text-white font-bold py-2 px-4 rounded mx-2">
            Contact
          </button>
        </Link>
      </nav>
      <style jsx>{`
        .custom-dropdown-menu {
          background-color: white;
        }
        .custom-dropdown-item {
          margin-bottom: 8px; /* Adjust the value as needed */
        }
        .custom-dropdown-item:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </header>
  );
};

export default NavbarMain;
