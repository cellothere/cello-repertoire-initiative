import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Seo from '@/components/seo';
import { AuthShell, PageSpinner, SubmitButton } from '@/components/auth-form';
import { FormAlert } from '@/components/state-messages';
import { safeRedirect, useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = safeRedirect(router.query.redirect);

  useEffect(() => {
    if (!loading && user) router.replace(redirect);
  }, [user, loading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Create an account" path="/register" noindex />
      <AuthShell title="Create an account" subtitle="Save your favorite pieces and come back to them anytime.">
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
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3-20 characters: letters, numbers, and underscores"
                autoComplete="username"
                disabled={isSubmitting}
                aria-describedby="username-hint"
                className="input"
                placeholder="yourname"
              />
              <p id="username-hint" className="mt-1 text-xs text-gray-500">
                3–20 characters: letters, numbers, and underscores
              </p>
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
                minLength={8}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-describedby="password-hint"
                className="input"
                placeholder="••••••••"
              />
              <p id="password-hint" className="mt-1 text-xs text-gray-500">
                At least 8 characters
              </p>
            </div>

            <div className="flex flex-col">
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isSubmitting}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <SubmitButton busy={isSubmitting} busyLabel="Creating account…">
              Create account
            </SubmitButton>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={{ pathname: '/login', query: router.query.redirect ? { redirect } : {} }}
                className="font-medium text-teal-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </AuthShell>
    </>
  );
}
