import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const redirect = (router.query.redirect as string) || '/cello-music';
      router.push(redirect);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
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

      // Check for pending save
      const pendingSave = sessionStorage.getItem('pendingSave');
      if (pendingSave) {
        try {
          const { pieceId, instrument } = JSON.parse(pendingSave);
          await fetch('/api/user/saved-pieces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pieceId, instrument })
          });
          sessionStorage.removeItem('pendingSave');
        } catch (err) {
          console.error('Failed to save pending piece:', err);
        }
      }

      // Redirect
      const redirect = (router.query.redirect as string) || '/cello-music';
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavbarMain />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head>
        <title>Register | Cello Repertoire Initiative</title>
        <meta name="description" content="Create your Cello Repertoire Initiative account" />
      </Head>
      <NavbarMain />

      {/* Gradient Header */}
      <header className="relative py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl mb-3 font-bold tracking-tight">Register</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto px-4">
            Create an account to save your favorite pieces.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-lg rounded-xl p-8">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col">
              <label htmlFor="email" className="font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="username" className="font-semibold text-gray-900 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                pattern="[a-zA-Z0-9_]{3,20}"
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="yourname"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className="font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div className="flex flex-col">
              <label htmlFor="confirmPassword" className="font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-br from-purple-600 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href={`/login${router.query.redirect ? `?redirect=${router.query.redirect}` : ''}`} className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                Login here
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
