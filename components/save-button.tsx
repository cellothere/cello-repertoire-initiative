import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { rememberPendingSave, useAuth } from '@/contexts/AuthContext';
import type { Instrument } from '@/lib/instruments';

interface SaveButtonProps {
  pieceId: number;
  instrument: Instrument;
  title: string;
  /** `icon` is a round overlay button for cards; `full` shows a text label. */
  variant?: 'icon' | 'full';
  className?: string;
}

export default function SaveButton({ pieceId, instrument, title, variant = 'icon', className = '' }: SaveButtonProps) {
  const router = useRouter();
  const { user, loading, isPieceSaved, savePiece, unsavePiece } = useAuth();
  const [busy, setBusy] = useState(false);
  const saved = isPieceSaved(pieceId, instrument);

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (loading || busy) return;

    if (!user) {
      rememberPendingSave(pieceId, instrument);
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setBusy(true);
    try {
      await (saved ? unsavePiece(pieceId, instrument) : savePiece(pieceId, instrument));
    } catch (error) {
      console.error('Failed to save/unsave piece:', error);
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? `Remove “${title}” from saved pieces` : `Save “${title}”`;
  const Icon = saved ? FaHeart : FaRegHeart;

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-pressed={saved}
        aria-label={label}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors disabled:opacity-60 ${
          saved ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-white text-gray-900 hover:bg-gray-100'
        } ${className}`}
      >
        <Icon className={saved ? 'text-rose-500' : ''} aria-hidden="true" />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Remove from saved pieces' : 'Save piece'}
      className={`rounded-full bg-white/90 p-2 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white disabled:opacity-60 ${className}`}
    >
      <Icon className={`h-4 w-4 ${saved ? 'text-rose-500' : 'text-gray-700'}`} aria-hidden="true" />
    </button>
  );
}
