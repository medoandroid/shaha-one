import React from 'react';
import {
  FileText,
  Briefcase,
  CheckCircle2,
  Award,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { Listing, Category } from '../../types';

interface ProfileOverviewSectionProps {
  listing: Listing;
  category?: Category;
}

export const ProfileOverviewSection: React.FC<ProfileOverviewSectionProps> = ({
  listing,
  category
}) => {
  return (
    <div className="space-y-4" dir="rtl">
      {/* 1. About / Description Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            نبذة تعريفية وتفاصيل النشاط
          </h3>
        </div>

        {listing.description ? (
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
            {listing.description}
          </p>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              {listing.name} مسجل وموثق بدليل أرقام وخدمات شها.
            </p>
            <p>
              يقدم خدماته لأهالي قرية شها والمناطق المجاورة بمركز المنصورة. تواصل عبر الأرقام المرفقة للاستفسار أو حجز موعد.
            </p>
          </div>
        )}

        {/* Highlight Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {listing.experienceYears && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 flex items-center gap-3">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block">سنوات الخبرة</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  أكثر من {listing.experienceYears} سنوات في المجال
                </span>
              </div>
            </div>
          )}

          {listing.deliveryAvailable && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40 flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">خدمة التوصيل</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  توصيل سريع لكافة أنحاء قرية شها
                </span>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">التوثيق والمطابقة</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                بيانات مراجعة ومعتمدة من إدارة الدليل
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Services / Offerings Card */}
      {listing.servicesProvided && listing.servicesProvided.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                الخدمات والتخصصات المتوفرة
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {listing.servicesProvided.length} خدمات
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {listing.servicesProvided.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {service}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Community Recommendation / Verification Guarantee Note */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/40 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-black text-slate-900 dark:text-white text-sm">
            ضمان الشفافية ومجتمع شها
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            جميع الأرقام والمعلومات الواردة بهذا الملف تخضع للمتابعة والتحديث المستمر من قِبل أهالي وإدارة شها. يمكنك تقييم الخدمة أو الإبلاغ عن أي تعديل لمساعدة الجميع.
          </p>
        </div>
      </div>
    </div>
  );
};
