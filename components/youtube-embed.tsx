import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

/**
 * Shows the video thumbnail and only loads YouTube's (heavy) player once it's clicked,
 * which keeps piece pages fast. Uses the privacy-enhanced youtube-nocookie domain.
 */
export default function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`Recording of ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Play recording of ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, no need to proxy through the image optimiser */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:bg-red-600">
              <FaPlay className="ml-1 h-6 w-6" aria-hidden="true" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
