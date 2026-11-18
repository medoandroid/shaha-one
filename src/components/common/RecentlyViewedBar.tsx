import React, { useState, useEffect } from 'react';
import { History, X, ChevronLeft, Phone, Clock } from 'lucide-react';
import { Listing } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { HorizontalScrollStrip } from './HorizontalScrollStrip';

interface RecentlyViewedBarProps {
  onSelectListing: (listing: Listing) => void;
  onClear?: () => void;
}

export const RECENTLY_VIEWED_STORAGE_KEY = 'shaha_recently_viewed';

export function recordRecentlyViewed(listing: Listing) {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const existing: Listing[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(item => item.id !== listing.id);
    const updated = [listing, ...filtered].slice(0, 10);
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('shaha_recent_updated'));
  } catch {
    // Ignore localStorage errors
  }
}

export const RecentlyViewedBar: React.FC<RecentlyViewedBarProps> = ({
  onSelectListing,
  onClear
}) => {
  const [recentListings, setRecentListings] = useState<Listing[]>([]);

  const loadRecent = () => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (raw) {
        setRecentListings(JSON.parse(raw));
      } else {
        setRecentListings([]);
      }
    } catch {
      setRecentListings([]);
    }
  };

  useEffect(() => {
    loadRecent();
    const handleUpdate = () => loadRecent();
    window.addEventListener('shaha_recent_updated', handleUpdate);
    return () => window.removeEventListener('shaha_recent_updated', handleUpdate);
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
      setRecentListings([]);
      if (onClear) onClear();
    } catch {
      // ignore
    }
  };

  if (recentListings.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white/85 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 px-3.5 py-3 shadow-2xs space-y-2.5" dir="rtl" aria-label="آخر الخدمات التي تمت زيارتها">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <History className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
            شاهدت مؤخراً ({recentListings.length})
          </span>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          className="text-[11px] font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
        >
          مسح السجل
        </button>
      </div>

      <HorizontalScrollStrip contentClassName="flex items-center gap-2.5 pb-1" ariaLabel="الخدمات التي تمت مشاهدتها مؤخراً">
        {recentListings.map(listing => (
          <div
            key={listing.id}
            onClick={() => onSelectListing(listing)}
            className="group shrink-0 w-48 sm:w-56 p-2.5 sm:p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-2.5"
          >
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.name}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                {listing.name.slice(0, 1)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {listing.name}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {listing.titleOrSpecialty || listing.phone}
              </p>
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
          </div>
        ))}
      </HorizontalScrollStrip>
    </div>
  );
};
