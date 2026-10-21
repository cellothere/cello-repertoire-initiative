import { MongoClient, type Db } from 'mongodb';

declare global {
  // Preserved across HMR reloads in development so we don't open a new pool on every edit.
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Lazily connect on first use rather than at import time, so that importing this
 * module (e.g. during `next build`) never opens a connection or throws when the
 * env var is missing.
 */
export function getMongoClient(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return Promise.reject(new Error('MONGODB_URI is not defined in environment variables'));
    }
    global._mongoClientPromise = new MongoClient(uri).connect().catch((error) => {
      // Allow the next request to retry instead of caching a failed connection forever.
      global._mongoClientPromise = undefined;
      throw error;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  return (await getMongoClient()).db('repertoire');
}
