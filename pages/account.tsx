import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowRight, FaHeart } from 'react-icons/fa';
import Seo from '@/components/seo';
import { AuthShell, PageSpinner } from '@/components/auth-form';
import { FormAlert, Spinner } from '@/components/state-messages';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, updateUsername, logout } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/account');
  }, [user, loading, router]);

  const startEditing = () => {
    setNewUsername(user?.username ?? '');
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await updateUsername(newUsername);
      setSuccess('Username updated.');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    // Leave first, otherwise the "not signed in" redirect to /login above would win the race.
    await router.push('/');
    await logout();
  };

  return (
    <>
      <Seo title="My Account" path="/account" noindex />
      <AuthShell title="My Account" subtitle="Manage your profile and saved pieces.">
        {loading || !user ? (
          <PageSpinner />
        ) : (
          <div className="space-y-6">
            <Link
              href="/saved-pieces"
              className="card group flex items-center gap-4 p-5 transition active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <FaHeart className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-gray-900">Saved pieces</span>
                <span className="block text-sm text-gray-600">
                  {user.savedPieces.length} {user.savedPieces.length === 1 ? 'piece' : 'pieces'} saved
                </span>
              </span>
              <FaArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>

            <section className="card space-y-5 p-5 sm:p-8">
              <h2 className="text-xl font-bold">Profile</h2>

              <div>
                <p className="label">Email</p>
                <p className="rounded-lg bg-gray-100 px-4 py-3 text-gray-700">{user.email}</p>
              </div>

              <div>
                {isEditing ? (
                  <form onSubmit={handleUpdateUsername} className="space-y-3">
                    <label htmlFor="username" className="label block">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                      pattern="[a-zA-Z0-9_]{3,20}"
                      title="3-20 characters: letters, numbers, and underscores"
                      autoComplete="username"
                      autoFocus
                      disabled={isSubmitting}
                      className="input"
                    />
                    <p className="text-xs text-gray-500">3–20 characters: letters, numbers, and underscores</p>
                    {error && <FormAlert tone="error">{error}</FormAlert>}
                    <div className="flex gap-3">
                      <button type="submit" disabled={isSubmitting} className="btn-primary">
                        {isSubmitting && <Spinner className="h-4 w-4" />}
                        Save
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="label">Username</p>
                    <div className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 text-gray-800">
                      <span>{user.username}</span>
                      <button type="button" onClick={startEditing} className="text-sm font-semibold text-teal-700 hover:underline">
                        Edit
                      </button>
                    </div>
                    {success && (
                      <div className="mt-2">
                        <FormAlert tone="success">{success}</FormAlert>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <p className="label">Member since</p>
                <p className="rounded-lg bg-gray-100 px-4 py-3 text-gray-700">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </section>

            <button type="button" onClick={handleLogout} className="btn-secondary w-full text-red-600 hover:border-red-300 hover:bg-red-50">
              Log out
            </button>
          </div>
        )}
      </AuthShell>
    </>
  );
}
