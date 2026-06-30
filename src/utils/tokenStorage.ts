import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Token storage (React Native).
 *
 * The web app stored tokens in cookies / localStorage, with a *synchronous*
 * `getTokenValue` used inside the axios request interceptor. React Native's
 * AsyncStorage is async-only, so we keep a synchronous in-memory cache as the
 * read path and mirror writes to AsyncStorage for persistence across launches.
 *
 * Call `hydrateTokens()` once at app start (before the first authed request) to
 * populate the cache from disk.
 */
const TOKEN_KEYS = [
  'authToken',
  'accessToken',
  'refreshToken',
  'tokenExpiresIn',
] as const;

type TokenKey = (typeof TOKEN_KEYS)[number];

const STORAGE_PREFIX = '@atlas/token/';
const storageKey = (key: TokenKey) => `${STORAGE_PREFIX}${key}`;

// Synchronous read-through cache (source of truth at runtime).
const cache = new Map<TokenKey, string>();

/** Load persisted tokens into the in-memory cache. Run once at app boot. */
export const hydrateTokens = async (): Promise<void> => {
  try {
    await Promise.all(
      TOKEN_KEYS.map(async (key) => {
        const value = await AsyncStorage.getItem(storageKey(key));
        if (value != null) {
          cache.set(key, value);
        }
      }),
    );
  } catch (error) {
    console.error('[tokenStorage] hydrate failed:', error);
  }
};

export const setTokenValue = (key: TokenKey, value: string): void => {
  cache.set(key, value);
  // Fire-and-forget persistence; the cache already reflects the new value.
  AsyncStorage.setItem(storageKey(key), value).catch((error) =>
    console.error('[tokenStorage] persist failed:', error),
  );
};

export const getTokenValue = (key: TokenKey): string | null => {
  return cache.get(key) ?? null;
};

export const removeTokenValue = (key: TokenKey): void => {
  cache.delete(key);
  AsyncStorage.removeItem(storageKey(key)).catch((error) =>
    console.error('[tokenStorage] remove failed:', error),
  );
};

export const clearTokenValues = (): void => {
  TOKEN_KEYS.forEach(removeTokenValue);
};
