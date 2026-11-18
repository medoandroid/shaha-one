import { Advertisement, AdPlacement } from '../types';

/**
 * Checks if an advertisement matches a given target placement slot.
 * Supports both primary `ad.placement` and multi-placement `ad.placements` array.
 */
export function isAdInPlacement(ad: Advertisement, targetPlacement: AdPlacement): boolean {
  if (ad.placement === targetPlacement) return true;
  if (ad.placements && Array.isArray(ad.placements) && ad.placements.includes(targetPlacement)) {
    return true;
  }
  return false;
}

/**
 * Filters active advertisements for a specific placement slot and sorts them by priority/order.
 */
export function getActiveAdsForPlacement(
  ads: Advertisement[],
  placement: AdPlacement,
  isAdActiveNow: (ad: Advertisement) => boolean,
  targetCategory?: string
): Advertisement[] {
  return ads.filter(ad => {
    if (!isAdActiveNow(ad)) return false;
    if (!isAdInPlacement(ad, placement)) return false;
    if (targetCategory && ad.targetCategory && ad.targetCategory !== 'all' && ad.targetCategory !== targetCategory) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.priority || 1) - (a.priority || 1);
  });
}
