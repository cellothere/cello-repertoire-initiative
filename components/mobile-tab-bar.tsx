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
import BackButton from './back-button';
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
    matches: (p) => p === BROWSE_PATH || p.startsWith(`${BROWSE_PATH}/`) || p === '/violin-music' || p.endsWith('-piece/[id]'),
  },
  {
    href: '/featured-databases',
    label: 'Featured',
    Icon: HiOutlineSparkles,
    ActiveIcon: HiSparkles,
    matches: (p) => p.startsWith('/featured-databases'),
  },
  {
    href: '/composers',
    label: 'Composers',
    Icon: HiOutlineUserGroup,
    ActiveIcon: HiUserGroup,
    matches: (p) => p.startsWith('/composers'),
  },
];

// Pages reached from the tabs themselves aren't repeated in the "More" sheet.
const SHEET_MUSIC_LINKS = MUSIC_LINKS.filter((link) => !TABS.some((tab) => tab.href === link.href));

// Lifting a finger closes the "More" sheet after a pull this far (px) or a flick this fast (px per ms).
const SHEET_CLOSE_DISTANCE = 96;
const SHEET_CLOSE_SPEED = 0.5;
const SHEET_FLICK_WINDOW = 100;
const SHEET_SLIDE_OUT_MS = 200;

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
  const sheetScrollerRef = useRef<HTMLDivElement>(null);
  const sheetHandleRef = useRef<HTMLDivElement>(null);
  // Coming back to Browse from a piece returns to the same filtered list, not a fresh one.
  const [browseHref, setBrowseHref] = useState(BROWSE_PATH);
  if (router.pathname === BROWSE_PATH && router.isReady && browseHref !== router.asPath) setBrowseHref(router.asPath);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (moreOpen && !sheet.open) sheet.showModal();
    if (!moreOpen && sheet.open) sheet.close();
  }, [moreOpen]);

  // Drag the sheet down to dismiss it, from the handle at any time or from the list once it's scrolled to the top.
  // These are native listeners because stopping the browser's own scroll needs a non-passive touchmove.
  useEffect(() => {
    const sheet = sheetRef.current;
    const scroller = sheetScrollerRef.current;
    const handle = sheetHandleRef.current;
    if (!sheet || !scroller || !handle) return;

    // Speed is measured over the last moments of the drag: `flickY` and `flickTime` trail the finger by up to SHEET_FLICK_WINDOW.
    let drag: { startX: number; startY: number; distance: number; lastY: number; lastTime: number; flickY: number; flickTime: number; active: boolean } | null = null;

    const onStart = (event: TouchEvent) => {
      if (closeTimer !== undefined) return; // already sliding out
      const target = event.target as Node;
      const canDrag = target !== sheet && (handle.contains(target) || scroller.scrollTop <= 0);
      if (event.touches.length !== 1 || !canDrag) {
        drag = null;
        return;
      }
      const { clientX, clientY } = event.touches[0];
      const time = event.timeStamp;
      drag = { startX: clientX, startY: clientY, distance: 0, lastY: clientY, lastTime: time, flickY: clientY, flickTime: time, active: false };
    };

    const onMove = (event: TouchEvent) => {
      if (!drag) return;
      const { clientX, clientY } = event.touches[0];
      const distance = clientY - drag.startY;
      if (!drag.active) {
        // Anything but a downward pull, or a scroll the browser has already started, stays a normal scroll.
        if (distance < 0 || Math.abs(clientX - drag.startX) > distance || !event.cancelable) {
          drag = null;
          return;
        }
        drag.active = true;
        sheet.style.transition = 'none';
      }
      event.preventDefault();
      if (event.timeStamp - drag.flickTime > SHEET_FLICK_WINDOW) {
        drag.flickY = drag.lastY;
        drag.flickTime = drag.lastTime;
      }
      drag.lastY = clientY;
      drag.lastTime = event.timeStamp;
      drag.distance = Math.max(distance, 0);
      sheet.style.transform = `translateY(${drag.distance}px)`;
    };

    let closeTimer: number | undefined;
    const finish = (shouldClose: boolean) => {
      drag = null;
      if (!shouldClose) {
        // Back to the stylesheet's open state, which eases the sheet up from where the finger let go.
        sheet.style.transition = '';
        sheet.style.transform = '';
        return;
      }
      // Slide the rest of the way out from the finger's position, and only then close. Closing straight away handed the
      // animation to the stylesheet, and some browsers drew the sheet fully open for a frame before it slid away.
      sheet.style.transition = `transform ${SHEET_SLIDE_OUT_MS}ms cubic-bezier(0.4, 0, 1, 1)`;
      sheet.style.transform = 'translateY(100%)';
      closeTimer = window.setTimeout(() => {
        closeTimer = undefined;
        sheet.close();
        sheet.style.transition = '';
        sheet.style.transform = '';
      }, SHEET_SLIDE_OUT_MS);
    };
    const onEnd = (event: TouchEvent) => {
      if (!drag?.active) return;
      // A finger that stopped before lifting isn't a flick, however fast it moved earlier.
      const stillMoving = event.timeStamp - drag.lastTime < SHEET_FLICK_WINDOW;
      const elapsed = drag.lastTime - drag.flickTime;
      const speed = stillMoving && elapsed > 0 ? (drag.lastY - drag.flickY) / elapsed : 0;
      finish(drag.distance >= SHEET_CLOSE_DISTANCE || speed >= SHEET_CLOSE_SPEED);
    };
    const onCancel = () => {
      if (drag?.active) finish(false);
    };

    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove', onMove, { passive: false });
    sheet.addEventListener('touchend', onEnd);
    sheet.addEventListener('touchcancel', onCancel);
    return () => {
      window.clearTimeout(closeTimer);
      sheet.removeEventListener('touchstart', onStart);
      sheet.removeEventListener('touchmove', onMove);
      sheet.removeEventListener('touchend', onEnd);
      sheet.removeEventListener('touchcancel', onCancel);
    };
  }, []);

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
        className="mobile-tab-bar pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <BackButton className="pointer-events-auto" />
          {/* A floating, rounded bar, with the back button beside it when there is somewhere to go back to; the space
              around them lets taps through to the page. */}
          <ul className="pointer-events-auto grid h-14 min-w-0 flex-1 grid-cols-5 overflow-hidden rounded-full border border-gray-200 bg-white/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/85">
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
        </div>
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
        <div ref={sheetScrollerRef} className="max-h-[85dvh] overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* touch-none keeps the browser's own pull-down gestures (refresh, Chrome's tab actions) off the handle. */}
          <div ref={sheetHandleRef} className="sticky top-0 z-10 flex touch-none items-center justify-between bg-white px-3 pb-2 pt-3">
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
