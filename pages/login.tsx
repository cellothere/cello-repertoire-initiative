import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Seo from '@/components/seo';
import { AuthShell, PageSpinner, SubmitButton } from '@/components/auth-form';
import { FormAlert } from '@/components/state-messages';
import { safeRedirect, useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = safeRedirect(router.query.redirect);

  // Already signed in (or just signed in): continue to where the visitor was going.
  useEffect(() => {
    if (!loading && user) router.replace(redirect);
  }, [user, loading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Sign in" path="/login" noindex />
      <AuthShell title="Sign in" subtitle="Welcome back! Sign in to access your saved pieces.">
        {loading || user ? (
          <PageSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-6 p-5 shadow-xl sm:p-8">
            {error && <FormAlert tone="error">{error}</FormAlert>}

            <div className="flex flex-col">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isSubmitting}
                className="input"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isSubmitting}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <SubmitButton busy={isSubmitting} busyLabel="Signing in…">
              Sign in
            </SubmitButton>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href={{ pathname: '/register', query: router.query.redirect ? { redirect } : {} }}
                className="font-medium text-teal-700 hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        )}
      </AuthShell>
    </>
  );
}
