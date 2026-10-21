import type { ReactNode } from 'react';
import PageHeader from './page-header';
import { Spinner } from './state-messages';

/** Shared shell for the sign-in, register and account pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="container mx-auto px-4 py-6 md:py-16">
        <div className="mx-auto max-w-md">{children}</div>
      </div>
    </>
  );
}

export function SubmitButton({ busy, busyLabel, children }: { busy: boolean; busyLabel: string; children: ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="btn-primary w-full py-3">
      {busy ? (
        <>
          <Spinner />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-gray-500" aria-busy="true" aria-label="Loading">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
