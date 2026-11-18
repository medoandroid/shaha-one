import React, { useState } from 'react';
import { Tag, Sparkles, X, Phone, MessageCircle, ExternalLink, Percent, Gift } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { Advertisement } from '../../types';
import { isAdInPlacement } from '../../utils/ads';
import { HorizontalScrollStrip } from '../common/HorizontalScrollStrip';

export const DealsStoryBar: React.FC = () => {
  const { advertisements, isAdActiveNow, recordAdClick, recordAdView } = useDirectory();
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  // Get active ads for story bar or top deals
  const storyAds = advertisements.filter(ad => {
    if (!isAdActiveNow(ad)) return false;
    return isAdInPlacement(ad, 'deals_stories') || isAdInPlacement(ad, 'hero_slider') || ad.discountPercent;
  }).slice(0, 10);

  if (storyAds.length === 0) return null;

  const handleOpenStory = (ad: Advertisement) => {
    recordAdView(ad.id);
    setSelectedAd(ad);
  };

  const handleWhatsApp = (ad: Advertisement) => {
    recordAdClick(ad.id);
    const phone = ad.whatsapp || ad.phone;
    if (!phone) return;
    let cleanNumber = phone.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = '20' + cleanNumber.substring(1);
    else if (!cleanNumber.startsWith('20')) cleanNumber = '20' + cleanNumber;
    const text = encodeURIComponent(`السلام عليكم، تواصلت معك بشأن عروض «${ad.title}» في شها ون`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <section className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <Gift className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>عروض وتخفيضات أهالي شها اليومية</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                تخصم مجاني
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              انقر على القصة لمشاهدة التفاصيل والتواصل المباشر مع المحل
            </p>
          </div>
        </div>
      </div>

      <HorizontalScrollStrip contentClassName="flex items-center gap-3.5 pb-3 pt-1 px-1" ariaLabel="عروض وتخفيضات أهالي شها">
        {storyAds.map((ad) => {
          return (
            <button
              key={ad.id}
              onClick={() => handleOpenStory(ad)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer touch-manipulation select-none"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-600 group-hover:scale-108 transition-transform duration-300 shadow-md">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 relative">
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg">
                      {ad.title[0]}
                    </div>
                  )}

                  {/* Discount Badge Ribbon on Circle */}
                  {ad.discountPercent && (
                    <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[9px] font-black text-center py-0.5 leading-none">
                      -{ad.discountPercent}%
                    </div>
                  )}
                </div>

                {/* Star Sparkle */}
                {ad.isPinned && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border border-white dark:border-slate-900">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                  </div>
                )}
              </div>

              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[76px] text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {ad.title}
              </span>
            </button>
          );
        })}
      </HorizontalScrollStrip>

      {/* Story Detail Viewer Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-4 animate-scale-up">
            
            {/* Header image banner */}
            <div className="relative h-64 sm:h-72 bg-slate-950 overflow-hidden">
              {selectedAd.imageUrl ? (
                <img
                  src={selectedAd.imageUrl}
                  alt={selectedAd.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 via-rose-600 to-indigo-800 flex items-center justify-center text-white p-6 text-center">
                  <div>
                    <h2 className="text-2xl font-black">{selectedAd.title}</h2>
                    {selectedAd.subtitle && <p className="text-sm mt-1 text-amber-100">{selectedAd.subtitle}</p>}
                  </div>
                </div>
              )}

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Close button */}
              <button
                onClick={() => setSelectedAd(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Badge over image */}
              <div className="absolute bottom-4 right-4 left-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  {selectedAd.discountPercent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-xs">
                      خصم {selectedAd.discountPercent}%
                    </span>
                  )}
                  {selectedAd.badgeText && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
                      {selectedAd.badgeText}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black">{selectedAd.title}</h3>
                {selectedAd.subtitle && <p className="text-xs text-slate-300 mt-0.5 font-semibold">{selectedAd.subtitle}</p>}
              </div>
            </div>

            {/* Description & CTAs */}
            <div className="p-5 space-y-4">
              {selectedAd.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedAd.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {(selectedAd.whatsapp || selectedAd.phone) && (
                  <button
                    onClick={() => handleWhatsApp(selectedAd)}
                    className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>تواصل عبر واتساب</span>
                  </button>
                )}

                {selectedAd.phone && (
                  <a
                    href={`tel:${selectedAd.phone}`}
                    onClick={() => recordAdClick(selectedAd.id)}
                    className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25 cursor-pointer text-center"
                  >
                    <Phone className="w-4 h-4" />
                    <span>اتصل الآن ({selectedAd.phone})</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
