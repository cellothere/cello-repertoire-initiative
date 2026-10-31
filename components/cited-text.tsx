import { Fragment } from 'react';
import Linkify from './linkify';
import { hostnameOf } from '@/utils/musicUtils';

const MARKER_PATTERN = /\[(\d+)\]/g;

/** Remove [1]-style citation markers, for plain-text uses such as meta descriptions. */
export function stripCitations(text: string): string {
  return text.replace(MARKER_PATTERN, '');
}

/**
 * Render text whose [1], [2]… markers point at `sources` (item 0 is [1]), as superscript links like Wikipedia's,
 * with a numbered source list underneath. Markers without a matching source are left as plain text.
 */
export default function CitedText({ text, sources }: { text: string; sources: string[] }) {
  // With a capturing group, split() puts the marker numbers at odd indices.
  const parts = text.split(MARKER_PATTERN);
  const cited = parts.some((part, index) => index % 2 === 1 && sources[Number(part) - 1]);
  return (
    <>
      <span className="whitespace-pre-line break-words">
        {parts.map((part, index) => {
          if (index % 2 === 0) return <Linkify key={index} text={part} />;
          const url = sources[Number(part) - 1];
          if (!url) return <Fragment key={index}>[{part}]</Fragment>;
          return (
            <sup key={index}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={hostnameOf(url) ?? url}
                aria-label={`Source ${part}: ${hostnameOf(url) ?? url}`}
                className="font-medium text-teal-700 hover:underline"
              >
                [{part}]
              </a>
            </sup>
          );
        })}
      </span>
      {cited && (
        <ol className="mt-4 list-inside list-decimal space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
          {sources.map((url) => (
            <li key={url} className="break-all">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                {hostnameOf(url) ?? url}
              </a>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
