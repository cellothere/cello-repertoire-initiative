import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NavbarMain from '@/components/navbar-main';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, updateUsername } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, loading, router]);

  // Set initial username
  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
    }
  }, [user]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await updateUsername(newUsername);
      setSuccess('Username updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
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
        <title>My Account | Cello Repertoire Initiative</title>
        <meta name="description" content="Manage your Cello Repertoire Initiative account" />
      </Head>
      <NavbarMain />

      {/* Gradient Header */}
      <header className="relative py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl mb-3 font-bold tracking-tight">My Account</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto px-4">
            Manage your profile and preferences.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Email</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                  {user.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Username (Editable) */}
              <div>
                <label htmlFor="username" className="block font-semibold text-gray-700 mb-2">
                  Username
                </label>
                {isEditing ? (
                  <form onSubmit={handleUpdateUsername} className="space-y-3">
                    <input
                      type="text"
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                      pattern="[a-zA-Z0-9_]{3,20}"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="yourname"
                    />
                    <p className="text-xs text-gray-500">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                    {error && (
                      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setNewUsername(user.username);
                          setError('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-800 flex justify-between items-center">
                      <span>{user.username}</span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                    </div>
                    {success && (
                      <div className="mt-2 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                        {success}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Account Created */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Member Since</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Saved Pieces Count */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Saved Pieces</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                  {user.savedPieces.length} piece{user.savedPieces.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
