import { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import FadeImage from '@/components/fade-image';
import { useRouter } from 'next/router';
import { FaArrowRight, FaSearch } from 'react-icons/fa';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Seo from '@/components/seo';

const FEATURES = [
  {
    href: '/cello-music',
    src: '/assets/cellist3.png',
    label: 'Cello Music',
    description: 'Search the catalogue by level, instrumentation, composer and more.',
  },
  {
    href: '/featured-databases',
    src: '/assets/whatsNew.png',
    label: 'Featured Databases',
    description: 'Music by women, non-binary, Black and Indigenous composers.',
  },
  {
    href: '/contribute',
    src: '/assets/contribute.png',
    label: 'Contribute',
    description: 'Suggest a piece or teaching resource for our catalogue.',
  },
];

const LEVEL_SHORTCUTS = [
  { label: 'Beginner', levels: ['Early Beginner', 'Beginner', 'Late Beginner'] },
  { label: 'Intermediate', levels: ['Early Intermediate', 'Intermediate', 'Late Intermediate'] },
  { label: 'Advanced', levels: ['Early Advanced', 'Advanced'] },
  { label: 'Professional', levels: ['Professional'] },
];

const levelHref = (levels: string[]) =>
  `/cello-music?${levels.map((level) => `level=${encodeURIComponent(level)}`).join('&')}`;

const Home: NextPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/cello-music?q=${encodeURIComponent(trimmed)}` : '/cello-music');
  };

  return (
    <>
      <Seo description="Discover music that resonates with you and your students: a searchable database of level-appropriate cello repertoire featuring under-recognized and underrepresented composers." />

      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_45%)]"
          aria-hidden="true"
        />
        <div className="container relative mx-auto px-4 py-12 text-center md:py-24">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Teach. Learn. Perform.</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90 md:mt-4 md:text-xl">
            Discover music that resonates with you and your students.
          </p>

          <form onSubmit={search} role="search" className="mx-auto mt-7 flex max-w-xl gap-2 rounded-2xl bg-white p-1.5 shadow-2xl sm:mt-8 sm:p-2">
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                enterKeyHint="search"
                placeholder="Search by title or composer"
                aria-label="Search by title or composer"
                className="h-full w-full rounded-xl py-3 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-primary rounded-xl px-4 sm:px-5" aria-label="Find music">
              <span className="hidden sm:inline">Find music</span>
              <FaArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="w-full text-white/80 sm:w-auto">Browse by level:</span>
            {LEVEL_SHORTCUTS.map((shortcut) => (
              <Link
                key={shortcut.label}
                href={levelHref(shortcut.levels)}
                className="rounded-full bg-white/15 px-4 py-2 font-medium text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/25 active:bg-white/30 sm:px-3 sm:py-1"
              >
                {shortcut.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-16" aria-label="Explore">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {FEATURES.map((feature, index) => (
            <Link
              key={feature.href}
              href={feature.href}
              style={{ '--i': index } as React.CSSProperties}
              className="reveal group relative block aspect-[16/9] overflow-hidden rounded-2xl bg-slate-800 shadow-lg transition-transform duration-300 ease-out-expo active:scale-[0.98] sm:aspect-[2/1] md:aspect-[3/4]"
            >
              <FadeImage
                src={feature.src}
                alt=""
                fill
                priority={index === 0}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                  {feature.label}
                  <FaArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </h2>
                <p className="mt-0.5 text-sm text-white/85 sm:mt-1 sm:text-base">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="container mx-auto max-w-3xl px-4 py-10 text-center md:py-16">
          <h2 className="text-2xl font-bold md:text-3xl">Our mission</h2>
          <p className="mt-3 text-base leading-relaxed text-gray-700 sm:mt-4 sm:text-lg">
            We provide teachers, students, and performers with a searchable database of level-appropriate musical
            literature and teaching resources, featuring works by under-recognized and underrepresented composers.
          </p>
          <Link href="/about-us" className="mt-6 inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline">
            Learn more about us
            <FaArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SpeedInsights />
    </>
  );
};

export default Home;
