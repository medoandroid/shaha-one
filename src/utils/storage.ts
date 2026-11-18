// DevMeDoAnDrOiD

const pendingWrites = new Map<string, { data: unknown; timer: ReturnType<typeof setTimeout> }>();

export function readCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function scheduleCacheWrite(key: string, data: unknown, delayMs = 350): void {
  if (typeof window === 'undefined') return;
  const existing = pendingWrites.get(key);
  if (existing) clearTimeout(existing.timer);

  const timer = setTimeout(() => {
    pendingWrites.delete(key);
    const flush = () => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // Ignore storage quota errors
      }
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(flush, { timeout: 1000 });
    } else {
      flush();
    }
  }, delayMs);

  pendingWrites.set(key, { data, timer });
}

export function removeCache(key: string): void {
  if (typeof window === 'undefined') return;
  const existing = pendingWrites.get(key);
  if (existing) {
    clearTimeout(existing.timer);
    pendingWrites.delete(key);
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
