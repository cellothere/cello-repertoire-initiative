/**
 * Two faint lines of real cello music drifting slowly behind the Cello Music header, the back line slower and
 * dimmer than the front so they read as depth rather than motion. Each ribbon is a strip of staff systems cut
 * from public-domain cello parts on IMSLP, turned into white notation on a transparent background:
 *   Mel Bonis, Cello Sonata Op. 67 (Demets, 1905)
 *   Ingeborg von Bronsart, Notturno Op. 13 (Breitkopf & Härtel)
 *   Samuel Coleridge-Taylor, Variations for Cello and Piano (Augener, 1918)
 *   Leokadiya Kashperova, Cello Sonata Op. 1 No. 1 (St Petersburg, n.d.)
 *   Luise Adolpha Le Beau, 4 Stücke Op. 24 (Rieter-Biedermann, 1882)
 *   Ethel Smyth, Cello Sonata Op. 5 (Peters, 1887)
 * The music fades out towards the left, where the title sits. Decoration only, so hidden from assistive
 * technology; with reduced motion the global rule in globals.css stops the drift.
 */
const RIBBONS = [
  { src: '/assets/score-ribbons/ribbon-a.png', width: 10259, className: 'score-ribbon-front top-[14%] opacity-[0.22]' },
  { src: '/assets/score-ribbons/ribbon-b.png', width: 10281, className: 'score-ribbon-back top-[54%] opacity-[0.12]' },
];

export default function ScoreRibbons() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent_15%,black_55%,black_92%,transparent)] md:[mask-image:linear-gradient(to_right,transparent_35%,black_62%,black_94%,transparent)]"
      aria-hidden="true"
    >
      {RIBBONS.map((ribbon) => (
        // Two copies side by side; the animation moves the pair left by exactly one copy, so the loop has no seam.
        <div key={ribbon.src} className={`absolute left-0 flex w-max ${ribbon.className}`}>
          {[0, 1].map((copy) => (
            // eslint-disable-next-line @next/next/no-img-element -- a wide static strip; the optimiser adds nothing here
            <img
              key={copy}
              src={ribbon.src}
              alt=""
              width={ribbon.width / 2}
              height={40}
              decoding="async"
              draggable={false}
              className="h-8 w-auto max-w-none md:h-10"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
