import Head from 'next/head';
import { SITE_SHARE_IMAGE } from '@/lib/share';

export const SITE_URL = 'https://www.cellorepertoire.com';
export const SITE_NAME = 'Cello Repertoire Initiative';
const DEFAULT_DESCRIPTION =
  'A searchable database of level-appropriate cello repertoire and teaching resources, featuring works by under-recognized and underrepresented composers.';

interface SeoProps {
  /** Page title; the site name is appended automatically. Omit for the home page. */
  title?: string;
  description?: string;
  /** Path for the canonical URL, e.g. "/cello-music". */
  path?: string;
  noindex?: boolean;
  /** Site path of a page-specific link-preview image (see lib/share.ts); otherwise the branded site image. */
  image?: string;
  /** Describes the preview image for screen readers. */
  imageAlt?: string;
}

export default function Seo({ title, description = DEFAULT_DESCRIPTION, path, noindex, image, imageAlt }: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const imagePath = image ?? SITE_SHARE_IMAGE;
  const shareImage = imagePath.startsWith('/') ? `${SITE_URL}${imagePath}` : imagePath;
  // The generated images (/api/og/…) are 1200×630, which messaging apps and social sites show as a large card.
  const large = imagePath.startsWith('/api/og/');
  const alt = imageAlt ?? (title ? `${title} on the ${SITE_NAME}` : SITE_NAME);
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
      <meta key="og:image" property="og:image" content={shareImage} />
      {large && <meta key="og:image:width" property="og:image:width" content="1200" />}
      {large && <meta key="og:image:height" property="og:image:height" content="630" />}
      {large && <meta key="og:image:type" property="og:image:type" content="image/png" />}
      <meta key="og:image:alt" property="og:image:alt" content={alt} />
      <meta key="twitter:card" name="twitter:card" content={large ? 'summary_large_image' : 'summary'} />
      <meta key="twitter:title" name="twitter:title" content={fullTitle} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={shareImage} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={alt} />
    </Head>
  );
}
