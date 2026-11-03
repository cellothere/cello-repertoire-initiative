import { COMPOSER_PORTRAITS } from '@/lib/composer-portraits';

/**
 * A strip of composer portraits drifting slowly sideways behind a page header. It is decoration, so it is
 * hidden from assistive technology; the portraits are muted and covered by a dark wash so the header text
 * stays readable. The strip is drawn twice and moved by exactly one copy's width, so the loop has no seam.
 * With reduced motion the global rule in globals.css stops the animation and the strip simply rests.
 */
export default function PortraitCarousel() {
  const strip = [...COMPOSER_PORTRAITS, ...COMPOSER_PORTRAITS];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="portrait-marquee flex h-full w-max">
        {strip.map((portrait, index) => (
          // Spacing is padding, not a flex gap, so both copies are exactly the same width.
          <div key={`${portrait.slug}-${index}`} className="h-full shrink-0 py-2 pr-2 md:py-3 md:pr-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static files; the optimiser adds nothing here */}
            <img
              src={`/assets/portraits/${portrait.slug}.jpg`}
              alt=""
              width={240}
              height={320}
              loading={index < 10 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className="h-full w-auto rounded-md object-cover opacity-45 grayscale [aspect-ratio:3/4]"
              style={portrait.focus ? { objectPosition: portrait.focus } : undefined}
            />
          </div>
        ))}
      </div>
      {/* Darkest in the middle, where the title sits, and lighter towards the edges so the faces show. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(17_24_39/0.92)_0%,rgb(17_24_39/0.7)_45%,rgb(17_24_39/0.35)_100%)]" />
    </div>
  );
}
