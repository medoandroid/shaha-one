import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NativeTopBar } from '../components/common/NativeTopBar';
import { navigateTo } from '../utils/navigation';
import { useGsapReveal } from '../hooks/useGsapReveal';
import {
  Building2,
  ShieldCheck,
  Heart,
  PhoneCall,
  Search,
  Users,
  CheckCircle2,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

interface AboutPageProps {
  onOpenAddService: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenAddService }) => {
  const pillarsRef = useGsapReveal<HTMLDivElement>({ stagger: 0.08, y: 16 });
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Native Top Bar with Back Button */}
      <NativeTopBar
        title="عن منصة شها ون"
        subtitle="منصة رقمية متكاملة لخدمات أهالي قرية شها"
        backLabel="الرئيسية"
        backRoute={{ page: 'home' }}
        badgeText="SHAHA ONE"
      />

      {/* 2. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'عن شها ون' }]} />

      <div className="page-hero p-6 sm:p-10 space-y-4">
        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold border border-white/15">
          <Building2 className="w-3.5 h-3.5" />
          <span>منصة خدمية ومجتمعية شاملة</span>
        </div>
        <h1 className="relative z-10 font-display text-2xl sm:text-4xl font-black tracking-tight">
          SHAHA ONE | شها ون
        </h1>
        <p className="relative z-10 text-base sm:text-lg text-amber-300 font-semibold">
          «شها كلها.. أقرب وأسهل في مكان واحد»
        </p>
        <p className="relative z-10 text-xs sm:text-sm text-white/85 leading-relaxed max-w-2xl">
          منصتك الرقمية المتكاملة لخدمات أهالي شها (مركز المنصورة – محافظة الدقهلية). تجمع الخدمات والأرقام والأماكن والتواصل والمساعدات المجتمعية وبنك الدم والتصنيفات الخدمية بنقرة واحدة.
        </p>
      </div>

      <div ref={pillarsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div data-reveal className="card-luxe p-6 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-black text-slate-900 dark:text-white">سهولة وسرعة الوصول</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            محرك بحث ذكي وسريع بالاسم، التخصص، أو رقم الهاتف مع تصنيف دقيق لأكثر من 15 قسماً.
          </p>
        </div>

        <div data-reveal className="card-luxe p-6 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-black text-slate-900 dark:text-white">توثيق ومراجعة البيانات</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            مراجعة وتدقيق مستمر للأرقام ومواعيد العمل لتفادي الأرقام الخاطئة أو المغلقة.
          </p>
        </div>

        <div data-reveal className="card-luxe p-6 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-black text-slate-900 dark:text-white">خدمة مجتمعية وتكافل</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            دعم متبرعي بنك الدم وحالات الطوارئ والمبادرات الخيرية لخدمة كل بيت في شها.
          </p>
        </div>
      </div>

      <div className="card-luxe p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          نبذة عن قرية شها
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          شها هي إحدى قرى مركز المنصورة العريقة بمحافظة الدقهلية، وتتميز بموقعها الحيوي وكثافتها السكانية ونشاطها التجاري والمهني المتميز. يهدف هذا الدليل إلى تمكين أبناء شها والمقيمين بها من الحصول على كافة الخدمات اليومية والتواصل المباشر مع أصحاب المهن والمحلات بكل سهولة.
        </p>
      </div>

      {/* Contribution CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">
            شارك في بناء وتحديث دليل قريتك!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-lg">
            إذا كنت تقدم خدمة، أو صاحب محل، أو طبيب أو مدرس، أو ترغب في تسجيل متبرع في بنك الدم، أضف بياناتك مجاناً الآن.
          </p>
        </div>

        <button
          onClick={onOpenAddService}
          className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 font-black text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>أضف رقمك الآن</span>
        </button>
      </div>
    </div>
  );
};
