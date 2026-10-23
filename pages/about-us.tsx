import Link from 'next/link';
import { NextPage } from 'next';
import { FaArrowRight } from 'react-icons/fa';
import Seo from '@/components/seo';
import PageHeader from '@/components/page-header';

const NEXT_STEPS = [
  { href: '/cello-music', title: 'Browse the catalogue', body: 'Filter by level, instrumentation, composer and more.' },
  {
    href: '/featured-databases',
    title: 'Explore featured databases',
    body: 'Music by women, queer, Black and Indigenous composers.',
  },
  { href: '/contribute', title: 'Contribute a piece', body: 'Know something we are missing? Tell us about it.' },
];

const AboutUs: NextPage = () => {
  return (
    <>
      <Seo
        title="Our Mission"
        path="/about-us"
        description="The Cello Repertoire Initiative provides teachers, students, and performers with a searchable database of level-appropriate musical literature and teaching resources, highlighting underrepresented composers."
      />
      <PageHeader title="Our Mission" subtitle="Music that resonates with you and your students." />

      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
        <p className="text-lg leading-relaxed text-gray-800 sm:text-xl md:text-2xl md:leading-relaxed">
          We exist to provide teachers, students, and performers with a searchable database of level-appropriate
          musical literature and teaching resources.
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-700 sm:mt-6 sm:text-lg">
          By featuring works by under-recognized and underrepresented composers, we hope you will discover music that
          resonates with both you and your students.
        </p>
      </div>

      <section className="border-t border-gray-200 bg-white" aria-label="Get started">
        <div className="container mx-auto grid gap-3 px-4 py-8 sm:gap-6 md:grid-cols-3 md:py-12">
          {NEXT_STEPS.map((step) => (
            <Link key={step.href} href={step.href} className="card group p-5 transition active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                {step.title}
                <FaArrowRight className="h-3 w-3 text-teal-600 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </h2>
              <p className="mt-2 text-gray-600">{step.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default AboutUs;
