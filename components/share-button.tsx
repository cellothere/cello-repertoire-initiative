import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { FaFacebookF } from 'react-icons/fa';
import { FiCheck, FiLink, FiMail, FiMessageCircle, FiMoreHorizontal, FiShare } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import type { ShareContent } from '@/lib/share';
import { hostnameOf } from '@/utils/musicUtils';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers, or a page without clipboard permission: copy through a temporary text field.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand('copy');
    field.remove();
    return ok;
  }
}

function Option({
  icon,
  label,
  href,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    'flex flex-col items-center gap-2 rounded-xl px-1 py-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm';
  const badge = (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-800 ring-1 ring-inset ring-gray-200">
      {icon}
    </span>
  );
  return href ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" onClick={onClick} className={className}>
      {badge}
      {label}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {badge}
      {label}
    </button>
  );
}

/**
 * A Share button that opens a share sheet: copy link, text message, email, Facebook and, where the device has one,
 * the system share menu ("More"). The sheet shows the branded link preview people will see when the link is pasted.
 */
export default function ShareButton({
  content,
  image,
  heading = 'Share',
  className = '',
}: {
  content: ShareContent;
  /** Site path of the link-preview image, shown in the sheet. */
  image?: string;
  heading?: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShareNatively, setCanShareNatively] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  const show = () => {
    setCanShareNatively(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    setOpen(true);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const copy = async () => setCopied(await copyText(content.url));

  const shareNatively = async () => {
    try {
      await navigator.share({ title: content.title, text: content.text, url: content.url });
      close();
    } catch {
      // Cancelled, or not allowed: leave the sheet open.
    }
  };

  const message = `${content.text}\n${content.url}`;
  const smsHref = `sms:?&body=${encodeURIComponent(message)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(content.emailSubject)}&body=${encodeURIComponent(content.emailBody)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`;

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-label={heading}
        title={heading}
        // Phones get a square icon button (44px, as tall as Save beside it); wider screens show the label too.
        className={`inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-100 max-sm:h-11 max-sm:w-11 max-sm:px-0 max-sm:py-0 ${className}`}
      >
        <FiShare className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* showModal() puts the sheet in the top layer, above the header's clipping and the phone tab bar. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false);
          setCopied(false);
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 mt-auto w-full max-w-full rounded-t-2xl bg-white p-0 focus:outline-none text-gray-900 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md sm:rounded-2xl"
      >
        {open && (
          <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="text-lg font-bold">
                {heading}
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="-mr-2 rounded-full p-2 text-gray-500 hover:bg-gray-100">
                <IoClose className="h-5 w-5" />
              </button>
            </div>

            {/* What the link looks like when it's pasted into a message or post. */}
            <div className="mt-4 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element -- a generated PNG; next/image would only re-encode it
                <img src={image} alt="" width={1200} height={630} className="aspect-[1200/630] w-full bg-gray-900 object-cover" />
              )}
              <div className="px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">{hostnameOf(content.url)}</p>
                <p className="line-clamp-1 text-sm font-semibold">{content.title}</p>
              </div>
            </div>

            <div className={`mt-4 grid gap-1 ${canShareNatively ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <Option
                icon={copied ? <FiCheck className="text-teal-600" /> : <FiLink />}
                label={copied ? 'Copied!' : 'Copy link'}
                onClick={copy}
              />
              <Option icon={<FiMessageCircle />} label="Message" href={smsHref} />
              <Option icon={<FiMail />} label="Email" href={mailHref} />
              <Option icon={<FaFacebookF />} label="Facebook" href={facebookHref} />
              {canShareNatively && <Option icon={<FiMoreHorizontal />} label="More" onClick={shareNatively} />}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 p-1.5 pl-3 ring-1 ring-inset ring-gray-200">
              <input
                readOnly
                value={content.url}
                aria-label="Link"
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-600 focus:outline-none"
              />
              <button type="button" onClick={copy} className="btn-primary shrink-0 px-3 py-1.5 text-sm">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {copied ? 'Link copied' : ''}
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
