import type { ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card mx-auto max-w-lg p-6 text-center sm:p-8">
      <FaExclamationTriangle className="mx-auto mb-4 h-8 w-8 text-amber-500" aria-hidden="true" />
      <p className="mb-6 text-gray-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="card mx-auto max-w-lg px-6 py-10 text-center sm:py-12">
      {icon && <div className="mx-auto mb-4 flex justify-center text-gray-400">{icon}</div>}
      <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
      {children && <div className="text-gray-600">{children}</div>}
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  const styles =
    tone === 'error' ? 'border-red-500 bg-red-50 text-red-700' : 'border-teal-500 bg-teal-50 text-teal-800';
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded border-l-4 p-4 text-sm ${styles}`}>
      {children}
    </div>
  );
}
