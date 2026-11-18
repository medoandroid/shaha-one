import React, { useState, useEffect } from 'react';
import { Megaphone, X, ArrowLeft, MessageCircle, Phone } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { Advertisement } from '../../types';
import { isAdInPlacement } from '../../utils/ads';

export const FloatingAdWidget: React.FC = () => {
  const { advertisements, isAdActiveNow, recordAdClick, recordAdView } = useDirectory();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Find active ad for floating widget
  const floatingAds = advertisements.filter(ad => {
    if (!isAdActiveNow(ad)) return false;
    return isAdInPlacement(ad, 'floating_widget') || isAdInPlacement(ad, 'top_banner');
  });

  const activeAd = floatingAds[0];

  useEffect(() => {
    if (activeAd) {
      recordAdView(activeAd.id);
    }
  }, [activeAd?.id]);

  if (!activeAd || isDismissed) return null;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordAdClick(activeAd.id);
    const phone = activeAd.whatsapp || activeAd.phone;
    if (!phone) return;
    let cleanNumber = phone.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = '20' + cleanNumber.substring(1);
    else if (!cleanNumber.startsWith('20')) cleanNumber = '20' + cleanNumber;
    const text = encodeURIComponent(`السلام عليكم، تواصلت معك بخصوص العرض المتاح في شها ون: ${activeAd.title}`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div
      className="hidden md:block fixed bottom-20 left-6 z-40 max-w-sm w-full animate-bounce-subtle"
      dir="rtl"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 relative overflow-hidden transition-all duration-300">
        
        {/* Close Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          title="إغلاق العرض"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          {activeAd.imageUrl ? (
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100">
              <img src={activeAd.imageUrl} alt={activeAd.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                {activeAd.badgeText || 'عرض خاص'}
              </span>
              {activeAd.discountPercent && (
                <span className="text-[10px] font-black text-red-600 dark:text-red-400">
                  خصم {activeAd.discountPercent}%
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate mt-1">
              {activeAd.title}
            </h4>
            {activeAd.subtitle && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {activeAd.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>واتساب مباشر</span>
          </button>
          
          {activeAd.phone && (
            <a
              href={`tel:${activeAd.phone}`}
              onClick={() => recordAdClick(activeAd.id)}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>اتصال</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
};
