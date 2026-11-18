import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ArrowLeft, Phone, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { getFavoriteIds, getFavoriteListings, toggleFavorite } from '../../utils/favorites';
import { Listing } from '../../types';
import { CategoryIconBadge } from './CategoryIcon';

interface FavoritesBarProps {
  onSelectListing: (listing: Listing) => void;
  onCopyPhone: (phone: string) => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  onSelectListing,
  onCopyPhone
}) => {
  const { listings } = useDirectory();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteIds());

  useEffect(() => {
    const handleUpdate = () => {
      setFavoriteIds(getFavoriteIds());
    };
    window.addEventListener('shaha_favorites_updated', handleUpdate);
    return () => window.removeEventListener('shaha_favorites_updated', handleUpdate);
  }, []);

  const favoriteListings = getFavoriteListings(listings);

  if (favoriteListings.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-rose-500/10 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/40 rounded-3xl p-5 sm:p-6 border border-rose-200/80 dark:border-rose-900/50 shadow-sm space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-rose-200/60 dark:border-rose-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>المفضلة والمحفوظات</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300/40">
                {favoriteListings.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أرقام وأطباء وحرفيين قمت بحفظهم للوصول السريع
            </p>
          </div>
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoriteListings.map(listing => (
          <div
            key={listing.id}
            onClick={() => onSelectListing(listing)}
            className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-rose-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <CategoryIconBadge categoryId={listing.categoryId} size="md" className="shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-rose-600 transition-colors">
                    {listing.name}
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold truncate">
                    {listing.titleOrSpecialty || listing.address}
                  </p>
                </div>
              </div>

              {/* Un-heart button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(listing.id);
                }}
                className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                title="إزالة من المفضلة"
              >
                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <a
                href={`tel:${listing.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="font-mono">{listing.phone}</span>
              </a>

              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>عرض التفاصيل</span>
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
