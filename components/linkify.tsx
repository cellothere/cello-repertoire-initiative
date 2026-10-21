import { Fragment } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { hostnameOf } from '@/utils/musicUtils';

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/g;

/** Split trailing punctuation (e.g. the full stop ending a sentence) off a matched URL. */
function splitTrailing(match: string): [string, string] {
  let url = match;
  let trailing = '';
  while (/[.,;:!?'"\])]$/.test(url)) {
    if (url.endsWith(')') && url.split('(').length > url.split(')').length - 1) break;
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }
  return [url, trailing];
}

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 break-all font-medium text-teal-700 underline decoration-teal-700/30 underline-offset-2 transition-colors hover:decoration-teal-700"
    >
      {children}
      <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}

/** Render plain text with any http(s) URLs turned into links labelled by their domain. */
export default function Linkify({ text }: { text: string }) {
  // With a capturing group, split() puts URL matches at odd indices.
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;
        const [url, trailing] = splitTrailing(part);
        return (
          <Fragment key={index}>
            <ExternalLink href={url}>{hostnameOf(url) ?? url}</ExternalLink>
            {trailing}
          </Fragment>
        );
      })}
    </>
  );
}
