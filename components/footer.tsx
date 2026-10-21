import Link from 'next/link';
import { MORE_LINKS, MUSIC_LINKS } from './navbar-main';

const Footer = () => {
  return (
    // On phones the bottom padding keeps the last line clear of the tab bar.
    <footer className="bg-gray-950 pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-gray-400 md:pb-0">
      <div className="container mx-auto grid grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 md:grid-cols-[2fr_1fr_1fr] md:gap-10 md:py-12">
        <div className="col-span-2 md:col-span-1">
          <p className="bg-brand-gradient bg-clip-text text-lg font-bold text-transparent brightness-150">
            Cello Repertoire Initiative
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            A searchable database of level-appropriate repertoire and teaching resources, featuring under-recognized and
            underrepresented composers.
          </p>
        </div>
        {[
          { heading: 'Explore', links: MUSIC_LINKS },
          { heading: 'Organization', links: MORE_LINKS },
        ].map(({ heading, links }) => (
          <nav key={heading} aria-label={heading}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{heading}</h2>
            <ul className="text-sm md:space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block py-1.5 transition-colors hover:text-white md:inline md:py-0">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="container mx-auto px-4 py-5 text-xs">
          © {new Date().getFullYear()} Cello Repertoire Initiative. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
