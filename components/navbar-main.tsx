import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaChevronDown, FaHeart, FaSearch, FaSignInAlt, FaUserCircle } from 'react-icons/fa';
import { RxHamburgerMenu } from 'react-icons/rx';
import { IoClose } from 'react-icons/io5';
import { useAuth } from '@/contexts/AuthContext';

interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export const MUSIC_LINKS: NavLink[] = [
  { href: '/cello-music', label: 'Cello Music', description: 'Search and filter the full catalogue' },
  { href: '/featured-databases', label: 'Featured Databases', description: 'Women, non-binary, Black & Indigenous composers' },
  { href: '/recently-added', label: 'Recently Added', description: 'The newest additions' },
  { href: '/composers', label: 'Composers', description: 'Browse every composer' },
];

export const MORE_LINKS: NavLink[] = [
  { href: '/about-us', label: 'Our Mission' },
  { href: '/resources', label: 'Resource Catalog' },
  { href: '/contribute', label: 'Contribute' },
  { href: '/contact', label: 'Contact Us' },
];

/** Close when clicking outside `ref` or pressing Escape. */
function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, close]);
}

function Dropdown({
  label,
  active,
  align = 'left',
  children,
  buttonClassName = '',
}: {
  label: ReactNode;
  active?: boolean;
  align?: 'left' | 'right';
  children: ReactNode;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const router = useRouter();

  useDismiss(ref, open, () => setOpen(false));
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => setOpen(false), 150);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-gray-100 ${
          active ? 'text-teal-700' : 'text-gray-800'
        } ${buttonClassName}`}
      >
        {label}
        <FaChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={id} className={`absolute top-full z-50 pt-2 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="min-w-[15rem] animate-fade-in overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownLink({ link, current }: { link: NavLink; current: boolean }) {
  return (
    <Link
      href={link.href}
      aria-current={current ? 'page' : undefined}
      className={`block px-4 py-2 transition-colors hover:bg-gray-50 ${current ? 'bg-teal-50' : ''}`}
    >
      <span className={`block font-medium ${current ? 'text-teal-800' : 'text-gray-900'}`}>{link.label}</span>
      {link.description && <span className="block text-sm text-gray-500">{link.description}</span>}
    </Link>
  );
}

function SearchForm({ autoFocus, onSubmitted, className = '' }: { autoFocus?: boolean; onSubmitted?: () => void; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/cello-music?q=${encodeURIComponent(trimmed)}`);
    setQuery('');
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search pieces or composers…"
        aria-label="Search pieces or composers"
        autoFocus={autoFocus}
        className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 transition-colors placeholder:text-gray-500 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </form>
  );
}

const NavbarMain = () => {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useDismiss(mobileRef, mobileMenuOpen, () => setMobileMenuOpen(false));
  useEffect(() => {
    const close = () => {
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    };
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  const isCurrent = (href: string) => router.pathname === href;
  const musicActive = MUSIC_LINKS.some((link) => isCurrent(link.href)) || router.pathname.endsWith('-piece/[id]');
  const moreActive = MORE_LINKS.some((link) => isCurrent(link.href));
  const loginHref = `/login${router.pathname === '/login' ? '' : `?redirect=${encodeURIComponent(router.asPath)}`}`;

  return (
    <header ref={mobileRef} className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Cello Repertoire Initiative home">
          <Image src="/assets/altLogo.png" alt="" width={40} height={39} priority className="h-10 w-10" />
          <span className="hidden bg-brand-gradient bg-clip-text text-lg font-bold leading-tight text-transparent xl:inline">
            Cello Repertoire Initiative
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Dropdown label="Music" active={musicActive}>
            {MUSIC_LINKS.map((link) => (
              <DropdownLink key={link.href} link={link} current={isCurrent(link.href)} />
            ))}
          </Dropdown>
          <Dropdown label="More" active={moreActive}>
            {MORE_LINKS.map((link) => (
              <DropdownLink key={link.href} link={link} current={isCurrent(link.href)} />
            ))}
          </Dropdown>
        </nav>

        <SearchForm className="ml-auto hidden w-full max-w-sm md:block" />

        <div className="hidden shrink-0 items-center md:flex">
          {authLoading ? (
            <div className="h-9 w-24" aria-hidden="true" />
          ) : user ? (
            <Dropdown
              align="right"
              label={
                <>
                  <FaUserCircle className="h-6 w-6" aria-hidden="true" />
                  <span className="max-w-[8rem] truncate">{user.username}</span>
                </>
              }
              active={['/account', '/saved-pieces'].includes(router.pathname)}
            >
              <DropdownLink
                link={{ href: '/saved-pieces', label: `Saved pieces (${user.savedPieces.length})` }}
                current={isCurrent('/saved-pieces')}
              />
              <DropdownLink link={{ href: '/account', label: 'Account settings' }} current={isCurrent('/account')} />
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onClick={() => logout()}
                className="block w-full px-4 py-2 text-left font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Log out
              </button>
            </Dropdown>
          ) : (
            <Link href={loginHref} className="btn-primary px-4 py-2 text-sm">
              <FaSignInAlt aria-hidden="true" />
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((value) => !value);
              setMobileMenuOpen(false);
            }}
            aria-expanded={mobileSearchOpen}
            aria-label="Search"
            className="rounded-lg p-2.5 text-gray-800 hover:bg-gray-100"
          >
            <FaSearch className="h-5 w-5" />
          </button>
          {user && (
            <Link href="/saved-pieces" aria-label="Saved pieces" className="rounded-lg p-2.5 text-gray-800 hover:bg-gray-100">
              <FaHeart className="h-5 w-5" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((value) => !value);
              setMobileSearchOpen(false);
            }}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="rounded-lg bg-black p-2.5 text-white"
          >
            {mobileMenuOpen ? <IoClose className="h-5 w-5" /> : <RxHamburgerMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden">
          <SearchForm autoFocus onSubmitted={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="max-h-[calc(100vh-4rem)] animate-fade-in overflow-y-auto border-t border-gray-200 bg-white px-4 pb-6 pt-2 shadow-lg md:hidden"
        >
          {[
            { heading: 'Music', links: MUSIC_LINKS },
            { heading: 'More', links: MORE_LINKS },
          ].map(({ heading, links }) => (
            <div key={heading} className="py-2">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</p>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2.5 font-medium ${
                    isCurrent(link.href) ? 'bg-teal-50 text-teal-800' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="border-t border-gray-200 pt-3">
            {user ? (
              <>
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Signed in as {user.username}
                </p>
                <Link href="/saved-pieces" className="block rounded-lg px-3 py-2.5 font-medium text-gray-900 hover:bg-gray-50">
                  Saved pieces ({user.savedPieces.length})
                </Link>
                <Link href="/account" className="block rounded-lg px-3 py-2.5 font-medium text-gray-900 hover:bg-gray-50">
                  Account settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href={loginHref} className="btn-primary w-full">
                <FaSignInAlt aria-hidden="true" />
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default NavbarMain;
