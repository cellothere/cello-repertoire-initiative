import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { IconType } from 'react-icons';
import { FaSignInAlt } from 'react-icons/fa';
import {
  HiBars3,
  HiChevronRight,
  HiHome,
  HiMusicalNote,
  HiOutlineBars3,
  HiOutlineHome,
  HiOutlineMusicalNote,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineXMark,
  HiSparkles,
  HiUserGroup,
} from 'react-icons/hi2';
import { useAuth } from '@/contexts/AuthContext';
import { MORE_LINKS, MUSIC_LINKS } from './navbar-main';

interface Tab {
  href: string;
  label: string;
  Icon: IconType;
  ActiveIcon: IconType;
  matches: (pathname: string) => boolean;
}

const BROWSE_PATH = '/cello-music';

const TABS: Tab[] = [
  { href: '/', label: 'Home', Icon: HiOutlineHome, ActiveIcon: HiHome, matches: (p) => p === '/' },
  {
    href: BROWSE_PATH,
    label: 'Browse',
    Icon: HiOutlineMusicalNote,
    ActiveIcon: HiMusicalNote,
    matches: (p) => p === BROWSE_PATH || p === '/violin-music' || p.endsWith('-piece/[id]'),
  },
  {
    href: '/featured-databases',
    label: 'Featured',
    Icon: HiOutlineSparkles,
    ActiveIcon: HiSparkles,
    matches: (p) => p === '/featured-databases',
  },
  {
    href: '/composers',
    label: 'Composers',
    Icon: HiOutlineUserGroup,
    ActiveIcon: HiUserGroup,
    matches: (p) => p === '/composers',
  },
];

// Pages reached from the tabs themselves aren't repeated in the "More" sheet.
const SHEET_MUSIC_LINKS = MUSIC_LINKS.filter((link) => !TABS.some((tab) => tab.href === link.href));

function SheetLink({ href, label, description, current }: { href: string; label: string; description?: string; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`flex min-h-[3rem] items-center gap-3 rounded-xl px-3 py-2.5 active:bg-gray-100 ${current ? 'bg-teal-50' : ''}`}
    >
      <span className="min-w-0 flex-1">
        <span className={`block font-medium ${current ? 'text-teal-800' : 'text-gray-900'}`}>{label}</span>
        {description && <span className="block text-sm text-gray-500">{description}</span>}
      </span>
      <HiChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
    </Link>
  );
}

/** App-style navigation for phones: four main sections plus a "More" sheet. Hidden from `md` up. */
export default function MobileTabBar() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);
  // Coming back to Browse from a piece returns to the same filtered list, not a fresh one.
  const [browseHref, setBrowseHref] = useState(BROWSE_PATH);
  if (router.pathname === BROWSE_PATH && router.isReady && browseHref !== router.asPath) setBrowseHref(router.asPath);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (moreOpen && !sheet.open) sheet.showModal();
    if (!moreOpen && sheet.open) sheet.close();
  }, [moreOpen]);

  useEffect(() => {
    const close = () => setMoreOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  const pathname = router.pathname;
  const isCurrent = (href: string) => pathname === href;
  const tabActive = TABS.some((tab) => tab.matches(pathname));
  const loginHref = `/login${pathname === '/login' ? '' : `?redirect=${encodeURIComponent(router.asPath)}`}`;

  const tabClass = (active: boolean) =>
    `flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors active:bg-gray-100 ${
      active ? 'text-teal-700' : 'text-gray-500'
    }`;

  return (
    <>
      <nav
        aria-label="Primary"
        className="mobile-tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden"
      >
        <ul className="mx-auto grid h-14 max-w-lg grid-cols-5">
          {TABS.map((tab) => {
            const active = tab.matches(pathname);
            const Icon = active ? tab.ActiveIcon : tab.Icon;
            const href = tab.href === BROWSE_PATH ? browseHref : tab.href;
            return (
              <li key={tab.href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(event) => {
                    // Tapping the tab you're on scrolls back to the top, as in native apps.
                    if (active && isCurrent(tab.href)) {
                      event.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={tabClass(active)}
                >
                  {/* A soft pill grows behind the current tab's icon. */}
                  <span
                    className={`flex h-7 w-14 items-center justify-center rounded-full transition duration-300 ease-out-expo ${
                      active ? 'scale-100 bg-teal-50' : 'scale-90 bg-transparent'
                    }`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={`w-full ${tabClass(moreOpen || !tabActive)}`}
            >
              <span
                className={`flex h-7 w-14 items-center justify-center rounded-full transition duration-300 ease-out-expo ${
                  moreOpen || !tabActive ? 'scale-100 bg-teal-50' : 'scale-90 bg-transparent'
                }`}
              >
                {moreOpen || !tabActive ? <HiBars3 className="h-6 w-6" aria-hidden="true" /> : <HiOutlineBars3 className="h-6 w-6" aria-hidden="true" />}
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={sheetRef}
        onClose={() => setMoreOpen(false)}
        onClick={(event) => {
          // A click on the dialog element itself (not its contents) is a click on the backdrop.
          if (event.target === sheetRef.current) setMoreOpen(false);
        }}
        aria-label="More"
        className="dialog-sheet m-0 mt-auto w-full max-w-none rounded-t-2xl bg-white p-0 text-gray-900 shadow-2xl"
      >
        <div className="max-h-[85dvh] overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-3 pb-2 pt-3">
            <span className="mx-auto h-1 w-10 rounded-full bg-gray-300" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="absolute right-1 top-1.5 rounded-full p-2.5 text-gray-500 active:bg-gray-100"
              aria-label="Close"
            >
              <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {[
            { heading: 'Music', links: SHEET_MUSIC_LINKS },
            { heading: 'About', links: MORE_LINKS },
          ].map(({ heading, links }) => (
            <section key={heading} className="py-1">
              <h2 className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</h2>
              {links.map((link) => (
                <SheetLink key={link.href} {...link} current={isCurrent(link.href)} />
              ))}
            </section>
          ))}

          <section className="mt-2 border-t border-gray-200 pt-3">
            {authLoading ? null : user ? (
              <>
                <h2 className="truncate px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Signed in as {user.username}
                </h2>
                <SheetLink href="/saved-pieces" label={`Saved pieces (${user.savedPieces.length})`} current={isCurrent('/saved-pieces')} />
                <SheetLink href="/account" label="Account settings" current={isCurrent('/account')} />
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    logout();
                  }}
                  className="mt-1 flex min-h-[3rem] w-full items-center rounded-xl px-3 py-2.5 text-left font-medium text-red-600 active:bg-red-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="space-y-2 px-3 pb-1">
                <Link href={loginHref} className="btn-primary w-full py-3">
                  <FaSignInAlt aria-hidden="true" />
                  Sign in
                </Link>
                <p className="text-center text-sm text-gray-600">
                  New here?{' '}
                  <Link href="/register" className="font-medium text-teal-700 underline underline-offset-2">
                    Create an account
                  </Link>{' '}
                  to save pieces.
                </p>
              </div>
            )}
          </section>
        </div>
      </dialog>
    </>
  );
}
