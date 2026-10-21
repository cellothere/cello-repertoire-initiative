import { baseLevel } from '@/utils/musicUtils';

const TONES: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  intermediate: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  advanced: 'bg-violet-50 text-violet-800 ring-violet-600/20',
  professional: 'bg-rose-50 text-rose-800 ring-rose-600/20',
};

function toneFor(level: string): string {
  const lower = baseLevel(level).toLowerCase();
  const tier = Object.keys(TONES).find((key) => lower.includes(key));
  return tier ? TONES[tier] : 'bg-gray-100 text-gray-700 ring-gray-500/20';
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
