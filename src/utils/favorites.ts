import { Listing } from '../types';

const FAVORITES_KEY = 'shaha_user_favorites';

export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  const ids = getFavoriteIds();
  return ids.includes(id);
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ids = getFavoriteIds();
    const index = ids.indexOf(id);
    let updated: string[];
    let isAdded = false;

    if (index >= 0) {
      updated = ids.filter(item => item !== id);
    } else {
      updated = [id, ...ids];
      isAdded = true;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('shaha_favorites_updated', { detail: { id, isAdded, favorites: updated } }));
    return isAdded;
  } catch {
    return false;
  }
}

export function getFavoriteListings(allListings: Listing[]): Listing[] {
  const ids = getFavoriteIds();
  if (ids.length === 0) return [];
  return allListings.filter(item => ids.includes(item.id));
}
