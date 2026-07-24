export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitEntry = {
  timestamps: number[];
};

/**
 * In-memory sliding-window rate limiter.
 *
 * Limitation (Cloudflare Workers / OpenNext): each isolate has its own Map, so
 * limits are per-isolate rather than globally shared across the edge. Acceptable
 * as a first pass against casual abuse; upgrade to KV / Durable Objects / the
 * Workers Rate Limiting binding for stronger global enforcement.
 */
const store = new Map<string, RateLimitEntry>();

const MAX_KEYS = 10_000;

function pruneStale(entry: RateLimitEntry, windowStart: number): void {
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);
  if (!entry) {
    if (store.size >= MAX_KEYS) {
      // Best-effort eviction when the map grows large (many unique IPs).
      const firstKey = store.keys().next().value;
      if (firstKey !== undefined) store.delete(firstKey);
    }
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  pruneStale(entry, windowStart);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0] ?? now;
    const retryAfterMs = oldest + config.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}
