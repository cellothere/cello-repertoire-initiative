import { baseLevel } from '@/utils/musicUtils';

const TONES: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  intermediate: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  advanced: 'bg-violet-50 text-violet-800 ring-violet-600/20',
  professional: 'bg-rose-50 text-rose-800 ring-rose-600/20',
};

/** Solid colour per tier, for the strip that replaces the card illustration on phones. */
const STRIPS: Record<string, string> = {
  beginner: 'bg-emerald-400',
  intermediate: 'bg-sky-400',
  advanced: 'bg-violet-400',
  professional: 'bg-rose-400',
};

function tierOf(level: string): string | undefined {
  const lower = baseLevel(level).toLowerCase();
  return Object.keys(TONES).find((key) => lower.includes(key));
}

function toneFor(level: string): string {
  const tier = tierOf(level);
  return tier ? TONES[tier] : 'bg-gray-100 text-gray-700 ring-gray-500/20';
}

export function levelStripClass(level: string): string {
  const tier = tierOf(level);
  return tier ? STRIPS[tier] : 'bg-gray-300';
}

export default function LevelBadge({ level, className = '' }: { level: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${toneFor(
        level
      )} ${className}`}
    >
      {level}
    </span>
  );
}
