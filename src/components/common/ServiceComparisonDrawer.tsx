import React from 'react';
import { X, Check, Phone, MapPin, Clock, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { Listing } from '../../types';
import { getAvailabilityStatus } from '../../utils/availability';

interface ServiceComparisonDrawerProps {
  items: Listing[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const ServiceComparisonDrawer: React.FC<ServiceComparisonDrawerProps> = ({
  items,
  isOpen,
  onClose,
  onRemoveItem,
  onSelectListing
}) => {
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>مقارنة الخدمات والأطباء بشها</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {items.length} خدمات
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              قارن بين التخصصات والمواعيد والتقييمات لاختيار الأنسب لك
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((listing) => {
            const availability = getAvailabilityStatus(listing.workingHours);

            return (
              <div
                key={listing.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 relative group"
              >
                {/* Remove item button */}
                <button
                  onClick={() => onRemoveItem(listing.id)}
                  className="absolute top-3 left-3 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer"
                  title="إزالة من المقارنة"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                      {listing.titleOrSpecialty || 'خدمة مسجلة'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                      {listing.name}
                    </h4>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{listing.rating || 5.0}</span>
                    <span className="text-slate-400 font-normal">({listing.ratingsCount || 1} تقييم)</span>
                  </div>

                  {/* Availability Badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      availability.isOpen
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${availability.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{availability.statusText}</span>
                    </span>
                  </div>

                  {/* Address & Hours */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{listing.address}</span>
                    </div>
                    {listing.workingHours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{listing.workingHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex gap-2">
                  <a
                    href={`tel:${listing.phone}`}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer text-center"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصل</span>
                  </a>

                  <button
                    onClick={() => {
                      onSelectListing(listing);
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    التفاصيل
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
