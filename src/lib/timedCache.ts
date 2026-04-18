type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();

export const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const getTimedCache = <T>(key: string): T | null => {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value as T;
};

export const setTimedCache = <T>(
  key: string,
  value: T,
  ttlMs: number = FIVE_MINUTES_MS,
): void => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

export const isTimedCacheFresh = (key: string): boolean => {
  const entry = cacheStore.get(key);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return false;
  }

  return true;
};

export const invalidateTimedCache = (key: string): void => {
  cacheStore.delete(key);
};

export const invalidateTimedCacheByPrefix = (prefix: string): void => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};
