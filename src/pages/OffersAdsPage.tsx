import React, { useState } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { Advertisement } from '../types';
import {
  Sparkles,
  Pin,
  Tag,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  PlusCircle,
  Eye,
  Megaphone,
  ArrowUpRight
} from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import { HorizontalScrollStrip } from '../components/common/HorizontalScrollStrip';
import { useGsapReveal } from '../hooks/useGsapReveal';

export const OffersAdsPage: React.FC = () => {
  const { getOrderedAds, recordAdClick, canManageAds, toggleAdvertisementPin } = useDirectory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'pinned' | 'discounts'>('all');

  const allAds = getOrderedAds('all', undefined, 'smart');

  // Filter ads based on search and tabs
  const filteredAds = allAds.filter(ad => {
    if (selectedType === 'pinned' && !ad.isPinned) return false;
    if (selectedType === 'discounts' && !(ad.discountPercent || ad.badgeType === 'discount')) return false;
    if (selectedCategory !== 'all' && ad.targetCategory && ad.targetCategory !== 'all' && ad.targetCategory !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = ad.title.toLowerCase().includes(q);
      const matchSub = (ad.subtitle || '').toLowerCase().includes(q);
      const matchDesc = (ad.description || '').toLowerCase().includes(q);
      const matchBadge = (ad.badgeText || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchDesc && !matchBadge) return false;
    }

    return true;
  });

  const adsListRef = useGsapReveal<HTMLDivElement>({
    selector: '.ad-reveal',
    stagger: 0.06,
    y: 16,
    deps: [filteredAds.length, selectedType]
  });

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
      const text = encodeURIComponent(`السلام عليكم، استفسار بخصوص إعلانك في شها ون: ${ad.title}`);
      window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* Mobile Native Header Bar with Smart Back Button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigateTo({ page: 'home' })}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-xs min-h-[44px] cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-blue-600" />
          <span>العودة للرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-black border border-amber-300/40">
            {filteredAds.length} عروض معتمدة
          </span>
        </div>
      </div>

      <div className="page-hero p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-black text-amber-200 border border-white/15">
            <Megaphone className="w-4 h-4 text-amber-300" />
            <span>لوحة عروض وإعلانات قرية شها</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            عروض وتخفيضات وإعلانات شها الحصرية
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-semibold">
            تابع يومياً تخفيضات المحلات والعيادات ومراكز الدروس والمبادرات الخيرية في شها، مع إمكانية التواصل الفوري عبر الهاتف أو واتساب بنقرة واحدة.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-luxe p-4 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في العروض والإعلانات والتخفيضات بالاسم أو التخصص..."
            className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
        </div>

        <HorizontalScrollStrip contentClassName="flex items-center gap-2 pb-1" ariaLabel="تصفية العروض">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedType === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            جميع العروض ({allAds.length})
          </button>
          <button
            onClick={() => setSelectedType('pinned')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              selectedType === 'pinned'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50'
            }`}
          >
            <Pin className="w-3.5 h-3.5 rotate-45" />
            <span>المثبتة في الصدارة ({allAds.filter(a => a.isPinned).length})</span>
          </button>
          <button
            onClick={() => setSelectedType('discounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              selectedType === 'discounts'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>تخفيضات وخصومات ({allAds.filter(a => a.discountPercent || a.badgeType === 'discount').length})</span>
          </button>
        </HorizontalScrollStrip>
      </div>

      {/* Ads Feed: Displayed cleanly stacked (تحت بعض متفرقين ومنظمين) */}
      <div ref={adsListRef} className="space-y-5">
        {filteredAds.map((ad) => {
          return (
            <article
              key={ad.id}
              className={`ad-reveal card-luxe rounded-3xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                ad.isPinned
                  ? 'border-2 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20 shadow-lg'
                  : 'hover:border-blue-400'
              }`}
            >
              {/* Pinned Marker */}
              {ad.isPinned && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-3.5 py-1 rounded-br-2xl flex items-center gap-1 shadow-xs">
                  <Pin className="w-3 h-3 rotate-45" />
                  <span>إعلان مثبت بأمر المشرف</span>
                </div>
              )}

              {/* Ad Info */}
              <div className="space-y-3 flex-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {ad.badgeText && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{ad.badgeText}</span>
                    </span>
                  )}

                  {ad.discountPercent && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                      <Flame className="w-3.5 h-3.5" />
                      <span>خصم {ad.discountPercent}</span>
                    </span>
                  )}

                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>إشراف إدارة شها</span>
                  </span>
                </div>

                <h2 className="card-title text-lg sm:text-xl text-slate-900 dark:text-white">
                  {ad.title}
                </h2>

                {ad.subtitle && (
                  <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 leading-relaxed">
                    {ad.subtitle}
                  </p>
                )}

                {ad.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ad.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 tabular-nums">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{ad.viewsCount || 0} مشاهدة</span>
                  </span>
                  {ad.isPinned && (
                    <span className="text-amber-700 dark:text-amber-300 font-bold inline-flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5" />
                      <span>أولوية ظهور قصوى</span>
                    </span>
                  )}
                </div>
              </div>

              {ad.imageUrl && (
                <div className="w-full md:w-64 lg:w-72 h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="flex flex-row md:flex-col gap-2.5 w-full md:w-48 shrink-0 pt-3 border-t md:border-t-0 md:pt-0 border-slate-100 dark:border-slate-800">
                {ad.phone && (
                  <button
                    onClick={() => handleCall(ad)}
                    className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span dir="ltr" className="tabular-nums truncate">{ad.phone}</span>
                  </button>
                )}

                {(ad.whatsapp || ad.phone) && (
                  <button
                    onClick={() => handleWhatsApp(ad)}
                    className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>محادثة واتساب</span>
                  </button>
                )}

                {ad.linkUrl && (
                  <button
                    onClick={() => {
                      recordAdClick(ad.id);
                      if (ad.linkUrl && /^https?:\/\//i.test(ad.linkUrl.trim())) {
                        window.open(ad.linkUrl.trim(), '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{ad.ctaText || 'تفاصيل العرض'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Authorized Manager Quick Pin Control */}
                {canManageAds && (
                  <button
                    onClick={() => toggleAdvertisementPin(ad.id, !ad.isPinned)}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      ad.isPinned
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span>{ad.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الصدارة'}</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredAds.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm font-bold text-slate-500">
            لا توجد عروض أو إعلانات تطابق البحث حالياً.
          </p>
        </div>
      )}
    </div>
  );
};
