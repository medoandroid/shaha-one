import React, { useState, useEffect } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { Advertisement } from '../../types';
import {
  Sparkles,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Tag,
  Clock,
  CheckCircle2,
  Pin
} from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

export const HeroAdSlider: React.FC = () => {
  const { getOrderedAds, recordAdView, recordAdClick } = useDirectory();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active hero slider ads (pinned first, then smart weighted)
  const heroAds = getOrderedAds('hero_slider', undefined, 'smart');

  const activeAd: Advertisement | undefined = heroAds[currentIndex % (heroAds.length || 1)];

  // Record impression
  useEffect(() => {
    if (activeAd) {
      recordAdView(activeAd.id);
    }
  }, [activeAd?.id]);

  // Auto slide every 7 seconds
  useEffect(() => {
    if (heroAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroAds.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroAds.length]);

  if (!activeAd || heroAds.length === 0) {
    return null;
  }

  const handleCall = () => {
    recordAdClick(activeAd.id);
    if (activeAd.phone) {
      window.location.href = `tel:${activeAd.phone}`;
    }
  };

  const handleWhatsApp = () => {
    recordAdClick(activeAd.id);
    if (activeAd.whatsapp || activeAd.phone) {
      const cleanPhone = (activeAd.whatsapp || activeAd.phone || '').replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
      const text = encodeURIComponent(`السلام عليكم، تواصلت معك من خلال إعلانك في «شها ون»: ${activeAd.title}`);
      window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
    }
  };

  const handleCta = () => {
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
      handleCall();
    }
  };

  const getGradientStyles = () => {
    switch (activeAd.backgroundColor) {
      case 'gradient_emerald':
        return 'from-emerald-700 via-teal-800 to-slate-900 border-emerald-500/30';
      case 'gradient_rose':
        return 'from-rose-700 via-red-800 to-slate-900 border-rose-500/30';
      case 'gradient_purple':
        return 'from-purple-800 via-indigo-900 to-slate-900 border-purple-500/30';
      case 'gradient_amber':
        return 'from-amber-700 via-orange-800 to-slate-900 border-amber-500/30';
      default:
        return 'from-blue-800 via-indigo-900 to-slate-900 border-blue-500/30';
    }
  };

  return (
    <div className="relative mb-6 group" dir="rtl">
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-l ${getGradientStyles()} p-6 sm:p-8 text-white shadow-xl border transition-all duration-500`}
      >
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-3 max-w-2xl flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {activeAd.isPinned && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md">
                  <Pin className="w-3.5 h-3.5 rotate-45" />
                  <span>إعلان مثبت في الصدارة</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-black text-amber-200 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeAd.badgeText || 'إعلان وعرض حصري'}</span>
              </span>

              {activeAd.discountPercent && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-black shadow-xs">
                  خصم {activeAd.discountPercent}
                </span>
              )}

              <span className="text-[11px] text-white/70 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>موثق بالدليل</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-snug tracking-tight">
              {activeAd.title}
            </h3>

            {activeAd.subtitle && (
              <p className="text-sm sm:text-base font-semibold text-white/90 leading-relaxed">
                {activeAd.subtitle}
              </p>
            )}

            {activeAd.description && (
              <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
                {activeAd.description}
              </p>
            )}
          </div>

          {/* Optional Prominent Image Visual */}
          {activeAd.imageUrl && (
            <div className="w-full sm:w-64 lg:w-72 h-40 sm:h-44 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-lg bg-black/20 relative group-hover:scale-[1.02] transition-transform">
              <img
                src={activeAd.imageUrl}
                alt={activeAd.title}
                className={`w-full h-full ${activeAd.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                عرض شها
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            {activeAd.phone && (
              <button
                onClick={handleCall}
                className="flex-1 sm:flex-initial min-h-[48px] px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>اتصال: {activeAd.phone}</span>
              </button>
            )}

            {(activeAd.whatsapp || activeAd.phone) && (
              <button
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-initial min-h-[48px] px-5 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </button>
            )}

            {activeAd.linkUrl && (
              <button
                onClick={handleCta}
                className="flex-1 sm:flex-initial min-h-[48px] px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>{activeAd.ctaText || 'تفاصيل العرض'}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Ad Pagination Dots & Arrows */}
        {heroAds.length > 1 && (
          <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              {heroAds.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentIndex % heroAds.length
                      ? 'w-6 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`شريحة إعلانية ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/70 font-mono">
                {currentIndex % heroAds.length + 1} من {heroAds.length}
              </span>
              <button
                onClick={() => setCurrentIndex(prev => (prev - 1 + heroAds.length) % heroAds.length)}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
                title="الإعلان السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => (prev + 1) % heroAds.length)}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
                title="الإعلان التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
