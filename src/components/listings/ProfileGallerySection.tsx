import React from 'react';
import { Images, Maximize2, Camera } from 'lucide-react';
import { Listing } from '../../types';

interface ProfileGallerySectionProps {
  listing: Listing;
  photos: string[];
  onOpenLightbox: (index: number) => void;
}

export const ProfileGallerySection: React.FC<ProfileGallerySectionProps> = ({
  listing,
  photos,
  onOpenLightbox
}) => {
  if (photos.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3" dir="rtl">
        <Camera className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h4 className="text-base font-bold text-slate-800 dark:text-white">
          لا يوجد صور مضافة حالياً
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          لم يتم رفع صور لهذا النشاط بعد. يمكنك الاستفسار عن مزيد من الصور عبر واتساب أو الهاتف.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4" dir="rtl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Images className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            معرض الصور والأعمال
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-400">
          {photos.length} {photos.length === 1 ? 'صورة' : 'صور'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photoUrl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onOpenLightbox(idx)}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="اضغط لتكبير الصورة"
          >
            <img
              src={photoUrl}
              alt={`صورة ${idx + 1} لـ ${listing.name}`}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
            {idx === 0 && (
              <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20">
                الرئيسية
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
