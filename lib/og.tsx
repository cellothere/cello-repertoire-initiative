/* eslint-disable @next/next/no-img-element -- next/og draws plain <img> elements; next/image does not apply here */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { NextApiResponse } from 'next';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';

/**
 * Branded link-preview images (Open Graph), drawn with next/og. The fonts and pictures are read from disk, so
 * next.config.js lists them in outputFileTracingIncludes for the /api/og routes.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const ROOT = process.cwd();
const BRAND_PURPLE = '#623d88';
const BRAND_TEAL = '#36c190';

type Font = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };
let fonts: Promise<Font[]> | undefined;

/** Inter regular and bold, Latin and Latin Extended (names like Hägg and Garścia), loaded once per server. */
function loadFonts(): Promise<Font[]> {
  fonts ??= Promise.all(
    (
      [
        ['inter-latin-400-normal.woff', 400],
        ['inter-latin-ext-400-normal.woff', 400],
        ['inter-latin-700-normal.woff', 700],
        ['inter-latin-ext-700-normal.woff', 700],
      ] as const
    ).map(async ([file, weight]) => {
      const buffer = await readFile(path.join(ROOT, 'lib', 'og-fonts', file));
      const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
      return { name: 'Inter', data, weight, style: 'normal' as const };
    })
  ).catch((error) => {
    fonts = undefined;
    throw error;
  });
  return fonts;
}

export interface OgPicture {
  src: string;
  width: number;
  height: number;
}

/**
 * A picture from public/ (an illustration or a cover), shrunk to fit inside the box and inlined as a data URL.
 * Returns null if the path isn't one of ours or the file can't be read, so the image still renders without it.
 */
export async function publicPicture(sitePath: string, maxWidth: number, maxHeight: number): Promise<OgPicture | null> {
  if (!/^\/(assets|covers)\/[\w./-]+$/.test(sitePath) || sitePath.includes('..')) return null;
  try {
    const { data, info } = await sharp(path.join(ROOT, 'public', sitePath))
      .resize({ width: maxWidth * 2, height: maxHeight * 2, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    const scale = Math.min(maxWidth / info.width, maxHeight / info.height);
    return {
      src: `data:image/jpeg;base64,${data.toString('base64')}`,
      width: Math.round(info.width * scale),
      height: Math.round(info.height * scale),
    };
  } catch (error) {
    console.error('Share image picture failed:', sitePath, error);
    return null;
  }
}

/** Shortens text to `max` characters at a word break, with an ellipsis. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).trimEnd()}…`;
}

const chipBase = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 20px',
  borderRadius: 999,
  fontSize: 26,
  marginRight: 14,
  marginTop: 12,
} as const;

export function Chip({ children, strong = false }: { children: string; strong?: boolean }) {
  return (
    <div
      style={
        strong
          ? { ...chipBase, backgroundColor: BRAND_TEAL, color: '#04271b', fontWeight: 700 }
          : { ...chipBase, backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.22)', color: '#e5e7eb' }
      }
    >
      {children}
    </div>
  );
}

/**
 * The shared layout: dark header-style background with the brand glow, the logo and name at the top left,
 * `children` in the middle, the address at the bottom, an optional picture on the right and the brand gradient
 * along the bottom edge.
 */
export function OgFrame({ logo, picture, children }: { logo: OgPicture | null; picture: OgPicture | null; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        fontFamily: 'Inter',
        color: '#ffffff',
        backgroundColor: '#0b0f14',
        backgroundImage: `radial-gradient(circle at 0% 0%, rgba(54,193,144,0.30), rgba(54,193,144,0) 55%), radial-gradient(circle at 100% 100%, rgba(98,61,136,0.55), rgba(98,61,136,0) 60%), linear-gradient(135deg, #111827, #030712)`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 48px 52px 64px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {logo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 68,
                height: 68,
                borderRadius: 999,
                backgroundColor: '#ffffff',
                marginRight: 20,
              }}
            >
              <img src={logo.src} width={56} height={Math.round((56 * logo.height) / logo.width)} alt="" />
            </div>
          )}
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Cello Repertoire Initiative</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>{children}</div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: '#9ca3af' }}>
          <div style={{ display: 'flex', width: 14, height: 14, borderRadius: 999, backgroundColor: BRAND_TEAL, marginRight: 14 }} />
          cellorepertoire.com
        </div>
      </div>

      {picture && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 420, paddingRight: 56 }}>
          <img
            src={picture.src}
            width={picture.width}
            height={picture.height}
            alt=""
            style={{ borderRadius: 22, border: '6px solid rgba(255,255,255,0.92)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 12,
          backgroundImage: `linear-gradient(to right, ${BRAND_PURPLE}, ${BRAND_TEAL})`,
        }}
      />
    </div>
  );
}

/** Renders the element to a PNG and sends it, cached by the CDN (the URL carries a version, so edits show up). */
export async function sendOgImage(res: NextApiResponse, element: React.ReactElement) {
  const image = new ImageResponse(element, { width: OG_WIDTH, height: OG_HEIGHT, fonts: await loadFonts() });
  const png = Buffer.from(await image.arrayBuffer());
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800');
  res.status(200).send(png);
}

export const logoPicture = () => publicPicture('/assets/altLogo.png', 56, 56);
