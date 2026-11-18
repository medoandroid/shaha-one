import React from 'react';
import { Phone, Heart, Shield, Droplet, Mail, MapPin, Newspaper } from 'lucide-react';
import { PlatformCreditsFooter } from '../common/PlatformCreditsFooter';
import { BrandMark } from '../common/BrandMark';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenAddService: () => void;
  onOpenContactAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenReport,
  onOpenAddService,
  onOpenContactAdmin
}) => {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="absolute inset-0 brand-pattern opacity-40 pointer-events-none" aria-hidden="true" />
      <div className="absolute -top-32 left-1/3 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandMark size="md" withRing />
              <div>
                <h3 className="font-display text-lg font-black text-white">SHAHA ONE | شها ون</h3>
                <p className="text-xs text-blue-300 font-semibold">شها كلها.. أقرب وأسهل في مكان واحد</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              منصتك الرقمية المتكاملة لخدمات أهالي شها – مركز المنصورة – محافظة الدقهلية. تجمع الخدمات والأرقام والأماكن والتواصل والمساعدات المجتمعية في مكان واحد.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/60 px-3 py-2 rounded-xl">
              <Shield className="w-4 h-4 shrink-0" />
              <span>منصة موثقة ومحمية بإشراف إداري محلي</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              أقسام المنصة الرئيسية
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigateTab('home')}
                  className="hover:text-sky-400 transition-colors"
                >
                  الرئيسية والبحث الذكي
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('categories')}
                  className="hover:text-sky-400 transition-colors"
                >
                  أطباء وصيدليات شها
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('news')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                  <span>أخبار وقرارات شها</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('emergency')}
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>طوارئ شها والمنصورة</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('blood')}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <Droplet className="w-3.5 h-3.5 text-rose-400" />
                  <span>طوارئ فصائل الدم والتبرع</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('charity')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مبادرات تواصل الخيرية</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Citizen Participation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              مشاركة أهالي شها
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              الدليل يكبر بكم! إذا كنت صاحب عمل أو حرفي أو طبيب أو مدرس بشها، سجل رقمك الآن مجاناً ليظهر للجميع.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={onOpenAddService}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all text-center"
              >
                + إضافة رقم أو خدمة جديدة
              </button>
              <button
                onClick={onOpenReport}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-center border border-slate-700 cursor-pointer"
              >
                الإبلاغ عن رقم خاطئ أو اقتراح تعديل
              </button>
              {onOpenContactAdmin && (
                <button
                  onClick={onOpenContactAdmin}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 transition-all text-center border border-indigo-800/80 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>مراسلة الإدارة والمالك سراً</span>
                </button>
              )}
            </div>
          </div>

          {/* Col 4: Village Location & Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              عن قرية شها
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>قرية شها – تابعة لمركز المنصورة – محافظة الدقهلية – جمهورية مصر العربية</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>إسعاف شها: 123 | شرطة النجدة: 122</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>تواصل مع المشرف: admin@shaha-directory.eg</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Section: Platform Contributors / Behind SHAHA ONE */}
        <div className="mt-10">
          <PlatformCreditsFooter />
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} – SHAHA ONE | شها ون
          </p>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">صُمم بكل فخر لخدمة أهالي قرية شها الكرام</span>
            <span className="text-[11px] font-mono text-slate-600 select-none">DevMeDoAnDrOiD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
