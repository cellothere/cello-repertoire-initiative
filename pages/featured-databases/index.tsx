import type { GetServerSideProps } from 'next';
import { DATABASE_SLUGS } from '@/lib/featured-databases';
import { databasePath } from '@/lib/slugs';

/**
 * /featured-databases opens a database's own page. Older links chose the database with ?category= (and the queer
 * database was once "non-binary"); they keep working, along with any filters in the link.
 */
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { category, ...rest } = query;
  const requested = category === 'non-binary' ? 'queer' : category;
  const slug = DATABASE_SLUGS.find((value) => value === requested) ?? 'women';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(rest)) {
    for (const item of ([] as string[]).concat(value ?? [])) search.append(key, item);
  }
  const queryString = search.toString();
  return {
    redirect: { destination: `${databasePath(slug)}${queryString ? `?${queryString}` : ''}`, permanent: false },
  };
};

export default function FeaturedDatabasesIndex() {
  return null;
}
