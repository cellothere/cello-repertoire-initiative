import type { RecordingEmbed } from '@/utils/musicUtils';

/**
 * A streaming service's own player (Spotify, Apple Music, Deezer, SoundCloud) or a plain audio player,
 * for pieces whose only recording isn't on YouTube.
 */
export default function RecordingPlayer({ embed, title }: { embed: RecordingEmbed; title: string }) {
  if (embed.kind === 'audio') {
    return (
      <section className="card p-4 sm:p-5" aria-label="Recording">
        <audio controls preload="none" src={embed.src} className="w-full">
          <a href={embed.src}>Listen to the recording</a>
        </audio>
      </section>
    );
  }

  // Spotify and Apple Music draw their own rounded, coloured card; the others sit inside ours.
  const selfStyled = embed.service === 'Spotify' || embed.service === 'Apple Music';
  return (
    <section className={selfStyled ? 'overflow-hidden rounded-xl' : 'card overflow-hidden'} aria-label="Recording">
      <iframe
        src={embed.src}
        title={`Recording of ${title} on ${embed.service}`}
        height={embed.height}
        loading="lazy"
        allow="autoplay *; clipboard-write; encrypted-media *; fullscreen *; picture-in-picture"
        {...(embed.service === 'Apple Music' && {
          sandbox:
            'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation',
        })}
        className="block w-full border-0"
      />
    </section>
  );
}
