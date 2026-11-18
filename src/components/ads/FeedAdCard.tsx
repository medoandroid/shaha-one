// DevMeDoAnDrOiD
import React, { useEffect } from 'react';
import { Advertisement } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import {
  Sparkles,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  Pin
} from 'lucide-react';
import { navigateTo } from '../../utils/navigation';
import { isSafeHttpUrl } from '../../lib/security';

interface FeedAdCardProps {
  ad: Advertisement;
}

export const FeedAdCard: React.FC<FeedAdCardProps> = ({ ad }) => {
  const { recordAdView, recordAdClick } = useDirectory();

  useEffect(() => {
    recordAdView(ad.id);
  }, [ad.id]);

  const handleCall = () => {
    recordAdClick(ad.id);
    if (ad.phone) {
      window.location.href = `tel:${ad.phone}`;
    }
  };

  const handleWhatsApp = () => {
    recordAdClick(ad.id);
    if (ad.whatsapp || ad.phone) {
      const cleanPhone = (ad.whatsapp || ad.phone || '').replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
      const text = encodeURIComponent(`السلام عليكم، تواصلت معك من خلال إعلانك في شها ون: ${ad.title}`);
      window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCta = () => {
    recordAdClick(ad.id);
    if (ad.linkUrl) {
      if (ad.linkUrl.startsWith('#')) {
        const hash = ad.linkUrl.replace('#', '');
        const params = new URLSearchParams(hash);
        const page = params.get('page') || 'home';
        navigateTo({ page: page as any });
      } else if (isSafeHttpUrl(ad.linkUrl)) {
        window.open(ad.linkUrl.trim(), '_blank', 'noopener,noreferrer');
      }
    } else if (ad.phone) {
      handleCall();
    }
  };

  return (
    <div
      className="card-luxe h-full p-5 ring-1 ring-amber-400/50 dark:ring-amber-500/40 hover:border-amber-400 dark:hover:border-amber-500 relative overflow-hidden flex flex-col justify-between select-none"
      dir="rtl"
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-600" />
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5 min-h-[36px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {ad.isPinned && (
              <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs">
                <Pin className="w-3 h-3 rotate-45" />
                <span>مثبت</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>{ad.badgeText || 'إعلان وعرض تجاري'}</span>
            </span>

            {ad.discountPercent && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                خصم {ad.discountPercent}
              </span>
            )}
          </div>

          <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-200/70 dark:border-amber-800/60 shrink-0">
            شها ون
          </span>
        </div>

        <h3 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white mb-1 line-clamp-2">
          {ad.title}
        </h3>

        {ad.subtitle && (
          <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 line-clamp-1">
            {ad.subtitle}
          </p>
        )}

        {ad.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
            {ad.description}
          </p>
        )}

        {ad.imageUrl && (
          <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 relative">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className={`w-full h-full ${ad.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="card-footer-strip space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {ad.phone && (
            <button
              onClick={handleCall}
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>اتصال مباشر</span>
            </button>
          )}

          {(ad.whatsapp || ad.phone) && (
            <button
              onClick={handleWhatsApp}
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>واتساب</span>
            </button>
          )}
        </div>

        {ad.linkUrl && (
          <button
            onClick={handleCta}
            className="w-full min-h-[44px] py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <span>{ad.ctaText || 'زيارة العرض'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </button>
        )}
      </div>
    </div>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
