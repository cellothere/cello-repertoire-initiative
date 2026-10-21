import Head from 'next/head';

export const SITE_URL = 'https://www.cellorepertoire.com';
export const SITE_NAME = 'Cello Repertoire Initiative';
const DEFAULT_DESCRIPTION =
  'A searchable database of level-appropriate cello repertoire and teaching resources, featuring works by under-recognized and underrepresented composers.';
const DEFAULT_IMAGE = `${SITE_URL}/assets/altLogo.png`;

interface SeoProps {
  /** Page title; the site name is appended automatically. Omit for the home page. */
  title?: string;
  description?: string;
  /** Path for the canonical URL, e.g. "/cello-music". */
  path?: string;
  noindex?: boolean;
}

export default function Seo({ title, description = DEFAULT_DESCRIPTION, path, noindex }: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = path ? `${SITE_URL}${path}` : undefined;

  return (
    <Head>
      <title key="title">{fullTitle}</title>
      <meta key="description" name="description" content={description} />
      {url && <link key="canonical" rel="canonical" href={url} />}
      {noindex && <meta key="robots" name="robots" content="noindex" />}
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:title" property="og:title" content={fullTitle} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:type" property="og:type" content="website" />
      {url && <meta key="og:url" property="og:url" content={url} />}
      <meta key="og:image" property="og:image" content={DEFAULT_IMAGE} />
      <meta key="twitter:card" name="twitter:card" content="summary" />
      <meta key="twitter:title" name="twitter:title" content={fullTitle} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={DEFAULT_IMAGE} />
    </Head>
  );
}
