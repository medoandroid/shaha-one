import React, { useState, useEffect } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { Megaphone, X, ExternalLink, ChevronLeft, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

export const TopAnnouncementBar: React.FC = () => {
  const { advertisements, isAdActiveNow, recordAdView, recordAdClick } = useDirectory();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Filter top banner ads that are currently active
  const topAds = advertisements.filter(
    ad => ad.placement === 'top_banner' && isAdActiveNow(ad)
  );

  const activeAd = topAds[currentIndex % (topAds.length || 1)];

  // Record impression
  useEffect(() => {
    if (activeAd && !isDismissed) {
      recordAdView(activeAd.id);
    }
  }, [activeAd?.id, isDismissed]);

  // Rotate between announcements if multiple
  useEffect(() => {
    if (topAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % topAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [topAds.length]);

  if (!activeAd || topAds.length === 0 || isDismissed) {
    return null;
  }

  const handleCtaClick = () => {
    recordAdClick(activeAd.id);
    if (activeAd.linkUrl) {
      if (activeAd.linkUrl.startsWith('#')) {
        const hash = activeAd.linkUrl.replace('#', '');
        const params = new URLSearchParams(hash);
        const page = params.get('page') || 'home';
        navigateTo({ page: page as any });
      } else if (activeAd.linkUrl.startsWith('http')) {
        window.open(activeAd.linkUrl, '_blank', 'noopener,noreferrer');
      }
    } else if (activeAd.phone) {
      window.location.href = `tel:${activeAd.phone}`;
    }
  };

  const getGradient = () => {
    switch (activeAd.backgroundColor) {
      case 'gradient_rose':
        return 'from-rose-600 via-red-600 to-rose-700 text-white';
      case 'gradient_emerald':
        return 'from-emerald-700 via-teal-700 to-emerald-800 text-white';
      case 'gradient_purple':
        return 'from-purple-700 via-indigo-700 to-purple-800 text-white';
      case 'gradient_amber':
        return 'from-amber-600 via-orange-600 to-amber-700 text-white';
      default:
        return 'from-blue-700 via-indigo-700 to-blue-800 text-white';
    }
  };

  return (
    <div
      className={`relative z-40 bg-gradient-to-r ${getGradient()} px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Indicator & Content */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div className="p-1 rounded-lg bg-white/20 shrink-0">
            <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
          </div>

          {activeAd.badgeText && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] sm:text-xs font-black">
              {activeAd.badgeText}
            </span>
          )}

          <div className="truncate flex items-center gap-2">
            <span className="font-black truncate">{activeAd.title}</span>
            {activeAd.subtitle && (
              <span className="hidden md:inline text-white/90 text-xs truncate">
                — {activeAd.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {(activeAd.ctaText || activeAd.linkUrl || activeAd.phone) && (
            <button
              onClick={handleCtaClick}
              className="px-3 py-1 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-black text-[11px] sm:text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer min-h-[32px]"
            >
              <span>{activeAd.ctaText || 'عرض التفاصيل'}</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}

          {topAds.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 bg-black/20 rounded-md px-1">
              <button
                onClick={() => setCurrentIndex(prev => (prev - 1 + topAds.length) % topAds.length)}
                className="p-1 hover:text-white/80 cursor-pointer"
                title="السابق"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => (prev + 1) % topAds.length)}
                className="p-1 hover:text-white/80 cursor-pointer"
                title="التالي"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="إخفاء التنويه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
