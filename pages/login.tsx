import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setIsSubmitting(true);

    try {
      await login(email, password);

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
      setError(err instanceof Error ? err.message : 'Login failed');
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
        <title>Login | Cello Repertoire Initiative</title>
        <meta name="description" content="Login to your Cello Repertoire Initiative account" />
      </Head>
      <NavbarMain />

      {/* Gradient Header */}
      <header className="relative py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl mb-3 font-bold tracking-tight">Login</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto px-4">
            Welcome back! Sign in to access your saved pieces.
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
              <label htmlFor="password" className="font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href={`/register${router.query.redirect ? `?redirect=${router.query.redirect}` : ''}`} className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                Register here
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
