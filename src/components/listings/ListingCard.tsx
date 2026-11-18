// DevMeDoAnDrOiD
import React, { useState, useEffect, memo } from 'react';
import { SmartImage } from '../common/SmartImage';
import {
  Phone,
  MessageCircle,
  Copy,
  MapPin,
  Clock,
  CheckCircle2,
  Star,
  ExternalLink,
  Truck,
  Eye,
  Sparkles,
  Heart
} from 'lucide-react';
import { Listing } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { CategoryIconBadge } from '../common/CategoryIcon';
import { IconicVerifiedBadge } from '../common/IconicVerifiedBadge';
import { isFavorite, toggleFavorite } from '../../utils/favorites';

interface ListingCardProps {
  listing: Listing;
  onOpenDetails: (listing: Listing) => void;
  onCopyPhone: (phone: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = memo(({
  listing,
  onOpenDetails,
  onCopyPhone
}) => {
  const { recordListingCall } = useDirectory();
  const [fav, setFav] = useState(() => isFavorite(listing.id));

  useEffect(() => {
    setFav(isFavorite(listing.id));
    const handleUpdate = () => {
      setFav(isFavorite(listing.id));
    };
    window.addEventListener('shaha_favorites_updated', handleUpdate);
    return () => window.removeEventListener('shaha_favorites_updated', handleUpdate);
  }, [listing.id]);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isAdded = toggleFavorite(listing.id);
    setFav(isAdded);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordListingCall(listing.id);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = listing.whatsapp || listing.phone;
    let cleanNumber = phone.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '20' + cleanNumber.substring(1);
    } else if (!cleanNumber.startsWith('20')) {
      cleanNumber = '20' + cleanNumber;
    }
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPhone(listing.phone);
  };

  return (
    <div
      onClick={() => onOpenDetails(listing)}
      className="card-luxe h-full p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 active:scale-[0.985] flex flex-col justify-between cursor-pointer group touch-manipulation select-none relative"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5 min-h-[36px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {listing.isFeatured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>مميز</span>
              </span>
            )}
            {listing.deliveryAvailable && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <Truck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>توصيل</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mr-auto">
            {typeof listing.ratingsCount === 'number' && listing.ratingsCount > 0 && typeof listing.rating === 'number' && (
              <div
                className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/70 dark:border-amber-800/50 tabular-nums"
                title={`${listing.ratingsCount} تقييم`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{listing.rating.toFixed(1)}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">({listing.ratingsCount})</span>
              </div>
            )}

            <button
              onClick={handleToggleFav}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer active:scale-90 ${
                fav
                  ? 'bg-rose-500 text-white shadow-xs shadow-rose-500/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
              title={fav ? 'محفوظ في المفضلة' : 'إضافة إلى المفضلة'}
              aria-label={fav ? 'محفوظ في المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-white text-white' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3.5 mb-3.5">
          {listing.imageUrl ? (
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs group-hover:scale-105 transition-transform">
              <SmartImage
                src={listing.imageUrl}
                alt={listing.name}
                className="w-full h-full object-cover"
                fallback={<CategoryIconBadge categoryId={listing.categoryId} size="md" className="w-full h-full" />}
              />
              {listing.isVerified && (
                <div className="absolute bottom-0 left-0 bg-emerald-600 text-white p-0.5 rounded-tr-md">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}
            </div>
          ) : (
            <CategoryIconBadge categoryId={listing.categoryId} size="md" className="mt-0.5" />
          )}

          <div className="min-w-0 flex-1">
            <h3 className="card-title flex w-full min-w-0 items-center gap-1.5 text-base sm:text-[17px] text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <span className="min-w-0 truncate">{listing.name}</span>
              <IconicVerifiedBadge listing={listing} size="sm" />
            </h3>
            {listing.titleOrSpecialty && (
              <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 mt-0.5 line-clamp-1">
                {listing.titleOrSpecialty}
              </p>
            )}
            {listing.subcategoryId && (
              <span className="inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {listing.subcategoryId}
              </span>
            )}
          </div>
        </div>

        <div className="card-meta-panel space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1 leading-relaxed">{listing.address}</span>
          </div>
          {listing.workingHours && (
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1 leading-relaxed">{listing.workingHours}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-footer-strip">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${listing.phone}`}
            onClick={handleCall}
            className="flex-1 min-h-[44px] py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all truncate touch-manipulation"
            title={`اتصال بـ ${listing.phone}`}
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span dir="ltr" className="truncate tabular-nums">{listing.phone}</span>
          </a>

          <button
            onClick={handleWhatsApp}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 active:scale-90 transition-all shrink-0 cursor-pointer touch-manipulation flex items-center justify-center"
            title="محادثة واتساب"
            aria-label="محادثة واتساب"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shrink-0 cursor-pointer touch-manipulation flex items-center justify-center"
            title="نسخ رقم الهاتف"
            aria-label="نسخ رقم الهاتف"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2.5 text-center">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline inline-flex items-center gap-1">
            <span>عرض كامل البيانات والتقييمات</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
});

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
