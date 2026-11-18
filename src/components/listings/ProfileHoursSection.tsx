import React from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  PhoneCall,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { Listing } from '../../types';

interface ProfileHoursSectionProps {
  listing: Listing;
}

export const ProfileHoursSection: React.FC<ProfileHoursSectionProps> = ({ listing }) => {
  return (
    <div className="space-y-4" dir="rtl">
      {/* Main Hours Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                مواعيد العمل وحالة التوفر
              </h3>
              <p className="text-xs text-slate-500">ساعات الاستقبال والاتصال والخدمة داخل شها</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>متاح الآن لاستقبال الاتصالات</span>
          </span>
        </div>

        {/* Schedule Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">أوقات العمل المحددة:</span>
            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {listing.workingHours || 'يومياً (متاح للاتصال والاستفسار)'}
            </p>
          </div>
        </div>

        {/* Delivery status card */}
        {listing.deliveryAvailable && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
                خدمة التوصيل المنزلي متوفرة بشها
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                يمكنك طلب توصيل الطلبات والخدمات إلى باب منزلك في أي مكان داخل القرية والمناطق التابعة.
              </p>
            </div>
          </div>
        )}

        {/* Recommendation Note */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            <span>نصيحة شها ون:</span>
          </div>
          <p className="leading-relaxed">
            يُفضل التواصل هاتفياً أو عبر واتساب قبل التوجه للمقر، لتأكيد التواجد وتجنب أوقات الذروة أو أيام الإجازات الأسبوعية.
          </p>
        </div>
      </div>
    </div>
  );
};
