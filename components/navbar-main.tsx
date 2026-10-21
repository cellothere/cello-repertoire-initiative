import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaChevronDown, FaHeart, FaSearch, FaSignInAlt, FaUserCircle } from 'react-icons/fa';
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
        className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-4 text-base text-gray-900 transition-colors placeholder:text-gray-500 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 md:py-2 md:text-sm"
      />
    </form>
  );
}

const NavbarMain = () => {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const close = () => setMobileSearchOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  const isCurrent = (href: string) => router.pathname === href;
  const musicActive = MUSIC_LINKS.some((link) => isCurrent(link.href)) || router.pathname.endsWith('-piece/[id]');
  const moreActive = MORE_LINKS.some((link) => isCurrent(link.href));
  const loginHref = `/login${router.pathname === '/login' ? '' : `?redirect=${encodeURIComponent(router.asPath)}`}`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="container mx-auto flex h-14 items-center gap-4 px-4 md:h-16">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 md:shrink-0 md:gap-3" aria-label="Cello Repertoire Initiative home">
          <Image src="/assets/altLogo.png" alt="" width={40} height={39} priority className="h-9 w-9 shrink-0 md:h-10 md:w-10" />
          {/* Shown on phones (where the links live in the tab bar) and wide screens, not in between. */}
          <span className="truncate bg-brand-gradient bg-clip-text text-base font-bold leading-tight text-transparent md:hidden xl:inline xl:text-lg">
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

        {/* Phone controls; the page links are in the bottom tab bar (MobileTabBar). */}
        <div className="-mr-2 ml-auto flex shrink-0 items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((value) => !value)}
            aria-expanded={mobileSearchOpen}
            aria-label={mobileSearchOpen ? 'Close search' : 'Search'}
            className="rounded-full p-3 text-gray-800 active:bg-gray-100"
          >
            {mobileSearchOpen ? <IoClose className="h-5 w-5" /> : <FaSearch className="h-5 w-5" />}
          </button>
          {user && (
            <Link href="/saved-pieces" aria-label="Saved pieces" className="rounded-full p-3 text-gray-800 active:bg-gray-100">
              <FaHeart className={`h-5 w-5 ${user.savedPieces.length > 0 ? 'text-rose-500' : ''}`} />
            </Link>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden">
          <SearchForm autoFocus onSubmitted={() => setMobileSearchOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default NavbarMain;
