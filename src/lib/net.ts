/**
 * Small runtime helpers shared across the app.
 * Keeping them in one place avoids duplicated timeout logic and makes the
 * network behaviour predictable on slow connections.
 */

/** Run a promise with a hard timeout so a slow API can never hang the UI. */
export function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000, message = 'انتهت مهلة الاتصال'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/** `fetch` with an AbortController timeout. Aborts after `timeoutMs`. */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: init.signal ?? controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Defer non-critical work until the browser is idle (or a short timeout).
 * Returns a cancel function suitable for effect cleanup.
 */
export function scheduleIdleTask(task: () => void, timeoutMs = 1500): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(task, Math.min(timeoutMs, 200));
  return () => window.clearTimeout(id);
}

const API_BASE = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    return `${API_BASE}/${path}`;
  }
  return `${API_BASE}${path}`;
}

export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean as T;
}
