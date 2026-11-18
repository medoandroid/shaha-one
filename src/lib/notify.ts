// DevMeDoAnDrOiD
export type ToastKind = 'success' | 'error' | 'info';

export interface ToastDetail {
  message: string;
  type: ToastKind;
}

export interface ErrorEntry {
  id: string;
  message: string;
  context?: string;
  timestamp: string;
}

const ERROR_STORAGE_KEY = 'shaha_error_log_v1';
const errorListeners = new Set<(entries: ErrorEntry[]) => void>();

function readErrorLog(): ErrorEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ERROR_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ErrorEntry[]) : [];
  } catch {
    return [];
  }
}

function writeErrorLog(entries: ErrorEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(entries.slice(0, 30)));
  } catch {}
  errorListeners.forEach(fn => fn(entries.slice(0, 30)));
}

export function notify(message: string, type: ToastKind = 'info'): void {
  if (typeof window === 'undefined' || !message) return;
  window.dispatchEvent(new CustomEvent<ToastDetail>('shaha_toast', { detail: { message, type } }));
}

export function reportError(userMessage: string, technicalContext?: string): void {
  const sanitizedContext = technicalContext
    ? technicalContext.replace(/AIza[0-9A-Za-z_-]{10,}/g, '[REDACTED]').slice(0, 240)
    : undefined;
  const entry: ErrorEntry = {
    id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    message: userMessage,
    context: sanitizedContext,
    timestamp: new Date().toISOString()
  };
  const next = [entry, ...readErrorLog()].slice(0, 30);
  writeErrorLog(next);
  notify(userMessage, 'error');
}

export function getErrorHistory(): ErrorEntry[] {
  return readErrorLog();
}

export function clearErrorHistory(): void {
  writeErrorLog([]);
}

export function subscribeErrors(listener: (entries: ErrorEntry[]) => void): () => void {
  errorListeners.add(listener);
  listener(readErrorLog());
  return () => {
    errorListeners.delete(listener);
  };
}
// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
