import Link from 'next/link';
import { MORE_LINKS, MUSIC_LINKS } from './navbar-main';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
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
            <ul className="space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
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
