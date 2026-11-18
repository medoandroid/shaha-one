import React, { useState } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { Advertisement } from '../../types';
import {
  Sparkles,
  Pin,
  Tag,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  LayoutGrid,
  Rows3,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

interface AdsShowcaseFeedProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  limit?: number;
  initialMode?: 'stack' | 'grid';
  targetCategory?: string;
}

export const AdsShowcaseFeed: React.FC<AdsShowcaseFeedProps> = ({
  title = 'عروض وإعلانات شها الحصرية والمثبتة',
  subtitle = 'أحدث عروض المحلات، تخفيضات الصيدليات، والمبادرات الموثقة تحت إشراف الإدارة',
  showFilters = true,
  limit,
  initialMode = 'stack',
  targetCategory
}) => {
  const { getOrderedAds, recordAdClick, recordAdView, canManageAds, toggleAdvertisementPin } = useDirectory();
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>(initialMode);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'discounts' | 'medical'>('all');

  // Fetch ordered ads (pinned first, then smart priority)
  const allActiveAds = getOrderedAds('all', targetCategory, 'smart');

  // Apply quick user filter
  const filteredAds = allActiveAds.filter(ad => {
    if (activeFilter === 'pinned') return ad.isPinned;
    if (activeFilter === 'discounts') return Boolean(ad.discountPercent) || ad.badgeType === 'discount';
    if (activeFilter === 'medical') return ad.targetCategory === 'pharmacies' || ad.targetCategory === 'doctors' || ad.targetCategory === 'laboratories';
    return true;
  });

  const displayAds = limit ? filteredAds.slice(0, limit) : filteredAds;

  if (displayAds.length === 0) {
    return null;
  }

  const handleCall = (ad: Advertisement) => {
    recordAdClick(ad.id);
    if (ad.phone) {
      window.location.href = `tel:${ad.phone}`;
    }
  };

  const handleWhatsApp = (ad: Advertisement) => {
    recordAdClick(ad.id);
    if (ad.whatsapp || ad.phone) {
      const cleanPhone = (ad.whatsapp || ad.phone || '').replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
      const text = encodeURIComponent(`السلام عليكم، استفسار بخصوص إعلانك في «شها ون»: ${ad.title}`);
      window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCta = (ad: Advertisement) => {
    recordAdClick(ad.id);
    if (ad.linkUrl) {
      if (ad.linkUrl.startsWith('#')) {
        const hash = ad.linkUrl.replace('#', '');
        const params = new URLSearchParams(hash);
        const page = params.get('page') || 'home';
        navigateTo({ page: page as any });
      } else if (/^https?:\/\//i.test(ad.linkUrl.trim())) {
        window.open(ad.linkUrl.trim(), '_blank', 'noopener,noreferrer');
      }
    } else if (ad.phone) {
      handleCall(ad);
    }
  };

  const getCardBorder = (ad: Advertisement) => {
    if (ad.isPinned) {
      return 'ring-2 ring-amber-400/60 dark:ring-amber-500/50 border-amber-400/80 dark:border-amber-500/70';
    }
    return 'hover:border-blue-400 dark:hover:border-blue-500';
  };

  return (
    <section className="space-y-4" dir="rtl">
      {/* Section Header with View Mode & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                {displayAds.length} {displayAds.length === 1 ? 'إعلان' : 'عروض'}
              </span>
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mr-8">
              {subtitle}
            </p>
          )}
        </div>

        {/* View Layout Controls & Filter Toggle */}
        <div className="flex items-center gap-2 mr-auto sm:mr-0 self-end sm:self-center">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('stack')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'stack'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="عرض متتالي منظم (تحت بعض)"
            >
              <Rows3 className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">متتالي</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="عرض شبكي (كروت)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">شبكي</span>
            </button>
          </div>

          <button
            onClick={() => navigateTo({ page: 'ads' })}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
          >
            <span>عرض كل الإعلانات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs if enabled */}
      {showFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            الكل ({allActiveAds.length})
          </button>
          <button
            onClick={() => setActiveFilter('pinned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'pinned'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            <Pin className="w-3 h-3 rotate-45" />
            <span>المثبتة في الصدارة ({allActiveAds.filter(a => a.isPinned).length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('discounts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'discounts'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>عروض وخصومات ({allActiveAds.filter(a => a.discountPercent || a.badgeType === 'discount').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('medical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'medical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            <span>صيدليات وعيادات</span>
          </button>
        </div>
      )}

      {/* Ads List / Grid Container */}
      <div
        className={
          viewMode === 'stack'
            ? 'space-y-4' // تحت بعض متفرقين ومنظمين
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
        }
      >
        {displayAds.map((ad) => {
          return (
            <article
              key={ad.id}
              className={`card-luxe relative overflow-hidden ${getCardBorder(ad)} ${
                viewMode === 'stack'
                  ? 'p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5'
                  : 'h-full p-5 flex flex-col justify-between'
              }`}
            >
              {ad.isPinned && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-br-2xl flex items-center gap-1 shadow-xs z-10">
                  <Pin className="w-3 h-3 rotate-45" />
                  <span>إعلان مثبت بأمر المشرف</span>
                </div>
              )}

              <div className={`space-y-2.5 flex-1 ${viewMode === 'stack' ? 'max-w-3xl' : ''}`}>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {ad.badgeText && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{ad.badgeText}</span>
                    </span>
                  )}

                  {ad.discountPercent && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <Flame className="w-3 h-3" />
                      <span>خصم {ad.discountPercent}</span>
                    </span>
                  )}

                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>موثق بالدليل</span>
                  </span>
                </div>

                <h3 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white">
                  {ad.title}
                </h3>

                {ad.subtitle && (
                  <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 leading-relaxed">
                    {ad.subtitle}
                  </p>
                )}

                {ad.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {ad.description}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{ad.viewsCount || 0} مشاهدة</span>
                  </span>
                  {ad.priority && ad.priority >= 8 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                      أولوية قصوى
                    </span>
                  )}
                </div>
              </div>

              {/* Optional Ad Image */}
              {ad.imageUrl && (
                <div
                  className={`rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shrink-0 ${
                    viewMode === 'stack'
                      ? 'w-full md:w-56 lg:w-64 h-36 md:h-32'
                      : 'w-full h-40 my-3'
                  }`}
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div
                className={`pt-3 border-t md:border-t-0 md:pt-0 border-slate-100 dark:border-slate-800 shrink-0 ${
                  viewMode === 'stack'
                    ? 'flex flex-row md:flex-col gap-2 w-full md:w-44'
                    : 'space-y-2 pt-3 border-t'
                }`}
              >
                {ad.phone && (
                  <button
                    onClick={() => handleCall(ad)}
                    className="flex-1 min-h-[44px] px-3 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                    <span dir="ltr" className="tabular-nums truncate">{ad.phone}</span>
                  </button>
                )}

                {(ad.whatsapp || ad.phone) && (
                  <button
                    onClick={() => handleWhatsApp(ad)}
                    className="flex-1 min-h-[44px] px-3 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>واتساب</span>
                  </button>
                )}

                {ad.linkUrl && (
                  <button
                    onClick={() => handleCta(ad)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{ad.ctaText || 'تفاصيل العرض'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Authorized Ads Manager Quick Pin Toggle */}
                {canManageAds && (
                  <button
                    onClick={() => toggleAdvertisementPin(ad.id, !ad.isPinned)}
                    className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      ad.isPinned
                        ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                        : 'bg-slate-50 text-slate-500 border-slate-300 hover:bg-slate-100'
                    }`}
                    title="تثبيت أو إلغاء تثبيت الإعلان في الصدارة"
                  >
                    <Pin className="w-3 h-3" />
                    <span>{ad.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الصدارة'}</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
