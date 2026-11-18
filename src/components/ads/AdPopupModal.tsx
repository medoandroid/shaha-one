import React, { useState, useEffect } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { Advertisement } from '../../types';
import {
  X,
  Sparkles,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  Tag,
  CheckCircle2,
  Clock,
  Timer
} from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

export const AdPopupModal: React.FC = () => {
  const { advertisements, isAdActiveNow, recordAdView, recordAdClick } = useDirectory();
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [canSkip, setCanSkip] = useState<boolean>(true);
  const [imageError, setImageError] = useState(false);

  // Active popup ads
  const popupAds = advertisements.filter(
    ad => ad.placement === 'popup_modal' && isAdActiveNow(ad)
  );

  const activeAd: Advertisement | undefined = popupAds[0];

  useEffect(() => {
    if (!activeAd) return;

    // Check if dismissed previously today
    const dismissedUntil = localStorage.getItem('shaha_popup_dismissed_until');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Configure skip & timer
    const skipDuration = activeAd.allowSkip === false 
      ? (activeAd.skipTimerSeconds || 5) 
      : (activeAd.skipTimerSeconds || 0);

    if (skipDuration > 0) {
      setCountdown(skipDuration);
      setCanSkip(false);
    } else {
      setCountdown(0);
      setCanSkip(true);
    }

    // Delay popup slightly for smooth UX after initial load (1.2s)
    const timer = setTimeout(() => {
      setIsOpen(true);
      recordAdView(activeAd.id);
    }, 1200);

    return () => clearTimeout(timer);
  }, [activeAd?.id]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || countdown <= 0) {
      if (countdown <= 0) setCanSkip(true);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdown]);

  // Optional auto-close timer after display duration
  useEffect(() => {
    if (!isOpen || !activeAd?.displayDurationSeconds || activeAd.displayDurationSeconds <= 0) {
      return;
    }

    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, activeAd.displayDurationSeconds * 1000);

    return () => clearTimeout(autoCloseTimer);
  }, [isOpen, activeAd?.displayDurationSeconds]);

  if (!isOpen || !activeAd) return null;

  const handleClose = () => {
    if (!canSkip && activeAd.allowSkip === false) {
      return; // Skip locked until countdown finishes
    }

    if (dontShowToday) {
      // Dismiss for 24 hours
      localStorage.setItem('shaha_popup_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
    }
    setIsOpen(false);
  };

  const handleCall = () => {
    recordAdClick(activeAd.id);
    if (activeAd.phone) {
      window.location.href = `tel:${activeAd.phone}`;
    }
    handleClose();
  };

  const handleWhatsApp = () => {
    recordAdClick(activeAd.id);
    if (activeAd.whatsapp || activeAd.phone) {
      const cleanPhone = (activeAd.whatsapp || activeAd.phone || '').replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
      const text = encodeURIComponent(`السلام عليكم، تواصلت معك بخصوص إعلان «${activeAd.title}» في شها ون`);
      window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
    }
    handleClose();
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
    handleClose();
  };

  const getHeaderGradient = () => {
    switch (activeAd.backgroundColor) {
      case 'gradient_rose':
        return 'from-rose-600 via-red-600 to-rose-700';
      case 'gradient_emerald':
        return 'from-emerald-600 via-teal-700 to-emerald-800';
      case 'gradient_purple':
        return 'from-purple-700 via-indigo-700 to-slate-900';
      case 'gradient_amber':
        return 'from-amber-600 via-orange-600 to-amber-700';
      default:
        return 'from-blue-700 via-indigo-700 to-slate-900';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all select-none my-8 max-h-[92vh] flex flex-col">
        
        {/* Header with decorative design */}
        <div className={`p-5 sm:p-6 bg-gradient-to-l ${getHeaderGradient()} text-white relative shrink-0`}>
          {/* Top Skip / Close Control with Countdown */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {!canSkip && countdown > 0 ? (
              <span className="px-3 py-1.5 rounded-full bg-black/40 text-amber-200 font-mono font-bold text-xs flex items-center gap-1.5 backdrop-blur-xs border border-white/10 animate-pulse">
                <Timer className="w-3.5 h-3.5" />
                <span>تخطي بعد {countdown}ث</span>
              </span>
            ) : (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer min-h-[36px] flex items-center gap-1 text-xs font-bold border border-white/20 active:scale-95"
                title="إغلاق وتخطي الإعلان"
              >
                <span>تخطي</span>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2 pr-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeAd.badgeText || 'إعلان وعرض حصري'}</span>
            </span>

            {activeAd.discountPercent && (
              <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 text-xs font-black">
                خصم {activeAd.discountPercent}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black leading-snug">
            {activeAd.title}
          </h2>

          {activeAd.subtitle && (
            <p className="text-xs sm:text-sm text-white/90 mt-1 font-semibold">
              {activeAd.subtitle}
            </p>
          )}
        </div>

        {/* Optional Ad Image Banner */}
        {activeAd.imageUrl && !imageError && (
          <div className="relative w-full bg-slate-100 dark:bg-slate-800 overflow-hidden max-h-56 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <img
              src={activeAd.imageUrl}
              alt={activeAd.title}
              onError={() => setImageError(true)}
              className={`w-full max-h-56 ${activeAd.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {activeAd.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeAd.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {activeAd.phone && (
              <button
                onClick={handleCall}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>اتصال مباشر: {activeAd.phone}</span>
              </button>
            )}

            {(activeAd.whatsapp || activeAd.phone) && (
              <button
                onClick={handleWhatsApp}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-green-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة واتساب سريعة</span>
              </button>
            )}

            {activeAd.linkUrl && (
              <button
                onClick={handleCta}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-98 transition-all cursor-pointer"
              >
                <span>{activeAd.ctaText || 'زيارة العرض'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Footer with "Don't show again today" and Close */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4 cursor-pointer"
              />
              <span>عدم إظهار هذا الإعلان مجدداً اليوم</span>
            </label>

            {canSkip ? (
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-2 py-1 cursor-pointer"
              >
                إغلاق
              </button>
            ) : (
              <span className="text-[11px] font-mono text-slate-400">
                الانتظار {countdown} ثانية
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
