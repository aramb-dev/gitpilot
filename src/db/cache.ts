import { eq, lt } from 'drizzle-orm';
import { db } from './index';
import { cachedGithubData } from './schema';

type CacheDataType = 'repositories' | 'issues' | 'pulls' | 'orgs' | 'user';

interface CacheOptions {
  ttlMinutes?: number;
  etag?: string;
}

interface CacheEntry<T> {
  data: T;
  etag: string | null;
  isStale: boolean;
}

const DEFAULT_TTL_MINUTES = 5;

function generateCacheId(userId: string, key: string): string {
  return `${userId}:${key}`;
}

export async function getCached<T>(userId: string, key: string): Promise<CacheEntry<T> | null> {
  try {
    const cacheId = generateCacheId(userId, key);
    const result = await db
      .select()
      .from(cachedGithubData)
      .where(eq(cachedGithubData.id, cacheId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const entry = result[0];
    const now = new Date();
    const isStale = entry.expiresAt < now;

    return {
      data: entry.data as T,
      etag: entry.etag,
      isStale,
    };
  } catch (_error) {
    return null;
  }
}

export async function setCache<T>(
  userId: string,
  key: string,
  dataType: CacheDataType,
  data: T,
  options: CacheOptions = {},
): Promise<void> {
  const { ttlMinutes = DEFAULT_TTL_MINUTES, etag } = options;
  const cacheId = generateCacheId(userId, key);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  try {
    await db
      .insert(cachedGithubData)
      .values({
        id: cacheId,
        userId,
        key,
        dataType,
        data: data as object,
        etag: etag ?? null,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: cachedGithubData.id,
        set: {
          data: data as object,
          etag: etag ?? null,
          expiresAt,
          updatedAt: now,
        },
      });
  } catch (_error) {}
}

export async function invalidateCache(userId: string, key?: string): Promise<void> {
  try {
    if (key) {
      const cacheId = generateCacheId(userId, key);
      await db.delete(cachedGithubData).where(eq(cachedGithubData.id, cacheId));
    } else {
      await db.delete(cachedGithubData).where(eq(cachedGithubData.userId, userId));
    }
  } catch (_error) {}
}

export async function invalidateCacheByPrefix(userId: string, keyPrefix: string): Promise<void> {
  try {
    const entries = await db
      .select({ id: cachedGithubData.id, key: cachedGithubData.key })
      .from(cachedGithubData)
      .where(eq(cachedGithubData.userId, userId));

    const idsToDelete = entries.filter((e) => e.key.startsWith(keyPrefix)).map((e) => e.id);

    for (const id of idsToDelete) {
      await db.delete(cachedGithubData).where(eq(cachedGithubData.id, id));
    }
  } catch (_error) {}
}

export async function cleanupExpiredCache(): Promise<number> {
  try {
    const now = new Date();
    const result = await db
      .delete(cachedGithubData)
      .where(lt(cachedGithubData.expiresAt, now))
      .returning({ id: cachedGithubData.id });

    return result.length;
  } catch (_error) {
    return 0;
  }
}

export async function getCacheWithStaleWhileRevalidate<T>(
  userId: string,
  key: string,
  fetchFn: () => Promise<{ data: T; etag?: string }>,
  options: CacheOptions = {},
): Promise<T> {
  const cached = await getCached<T>(userId, key);

  if (cached && !cached.isStale) {
    return cached.data;
  }

  if (cached?.isStale) {
    fetchFn().then(async ({ data, etag }) => {
      await setCache(userId, key, 'repositories', data, { ...options, etag });
    });
    return cached.data;
  }

  const { data, etag } = await fetchFn();
  await setCache(userId, key, 'repositories', data, { ...options, etag });
  return data;
}
