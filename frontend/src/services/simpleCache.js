// Very small TTL-backed cache with optional localStorage persistence
const defaultTTL = 30 * 1000; // 30 seconds

function now() {
  return Date.now();
}

const cache = new Map();

export function setCache(key, value, ttl = defaultTTL, persist = false) {
  const entry = { value, expiresAt: now() + ttl };
  cache.set(key, entry);
  if (persist) {
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify({ value, expiresAt: entry.expiresAt }));
    } catch (e) {}
  }
}

export function getCache(key) {
  // First check memory
  const mem = cache.get(key);
  if (mem) {
    if (mem.expiresAt >= now()) return mem.value;
    cache.delete(key);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(`cache:${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.expiresAt && parsed.expiresAt >= now()) {
        // populate memory for faster subsequent access
        cache.set(key, { value: parsed.value, expiresAt: parsed.expiresAt });
        return parsed.value;
      }
      // expired in storage
      localStorage.removeItem(`cache:${key}`);
    }
  } catch (e) {}

  return null;
}

export function deleteCache(key) {
  try {
    cache.delete(key);
  } catch (e) {}
  try {
    localStorage.removeItem(`cache:${key}`);
  } catch (e) {}
}

export function deletePattern(prefix) {
  try {
    // delete in-memory keys that start with prefix
    for (const k of Array.from(cache.keys())) {
      if (k && k.indexOf(prefix) === 0) cache.delete(k);
    }
  } catch (e) {}
  try {
    // delete persisted keys in localStorage
    const keys = Object.keys(localStorage || {});
    for (const k of keys) {
      if (k && k.indexOf(`cache:${prefix}`) === 0) {
        try { localStorage.removeItem(k); } catch (e) {}
      }
    }
  } catch (e) {}
}
// Return cached value and also return a promise that resolves when fresh value is available
export function staleWhileRevalidate(key, fetcher, ttl = defaultTTL, persist = false) {
  const cached = getCache(key);
  // Kick off refresh in background regardless
  const refreshPromise = (async () => {
    try {
      const fresh = await fetcher();
      setCache(key, fresh, ttl, persist);
      try {
        // Emit a custom event so UI components can optionally listen for background updates
        if (typeof window !== 'undefined' && window?.CustomEvent) {
          const ev = new CustomEvent('cache:updated', { detail: { key, value: fresh } });
          window.dispatchEvent(ev);
        }
      } catch (e) {}
      return fresh;
    } catch (e) {
      // If fetch fails, bubble error to caller but don't remove cached value
      throw e;
    }
  })();

  return {
    cached,
    fresh: refreshPromise
  };
}

export default { setCache, getCache, staleWhileRevalidate, delete: deleteCache, deletePattern };
