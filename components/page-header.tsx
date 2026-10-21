import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** `compact` keeps the header short on pages where the content should be visible immediately. */
  size?: 'default' | 'compact';
  align?: 'center' | 'left';
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, size = 'default', align = 'center', children }: PageHeaderProps) {
  const compact = size === 'compact';
  return (
    <header
      className={`relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white ${
        compact ? 'py-6 md:py-10' : 'py-9 md:py-20'
      } ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-4">
        <h1
          className={`font-bold tracking-tight ${
            compact ? 'text-[1.75rem] leading-tight md:text-4xl' : 'mb-2 text-3xl md:mb-4 md:text-6xl'
          } ${compact && subtitle ? 'mb-1.5 md:mb-2' : ''}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-gray-300 ${compact ? 'text-[0.9375rem] md:text-lg' : 'text-base md:text-xl'} ${
              align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-3xl'
            }`}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
