import React, { useState, useMemo } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NativeTopBar } from '../components/common/NativeTopBar';
import { MansouraEmergencySchedule } from '../components/emergency/MansouraEmergencySchedule';
import { HorizontalScrollStrip } from '../components/common/HorizontalScrollStrip';
import { PhoneCall, Search, ShieldAlert, HeartPulse, Flame, Wrench, AlertCircle, Copy, Building2 } from 'lucide-react';
import { EmergencyNumber } from '../types';

interface EmergencyPageProps {
  onCopyPhone: (phone: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({ onCopyPhone, onShowToast }) => {
  const { emergencyNumbers } = useDirectory();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'medical' | 'security' | 'utilities' | 'local'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNumbers = useMemo(() => {
    return emergencyNumbers.filter(item => {
      if (selectedFilter !== 'all' && item.category !== selectedFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.titleAr.toLowerCase().includes(q) ||
          item.descriptionAr.toLowerCase().includes(q) ||
          item.phone.includes(q)
        );
      }
      return true;
    });
  }, [emergencyNumbers, selectedFilter, searchQuery]);

  const getCategoryBadge = (cat: EmergencyNumber['category']) => {
    switch (cat) {
      case 'medical':
        return { label: 'طوارئ طبية', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
      case 'security':
        return { label: 'أمن ونجدة', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'utilities':
        return { label: 'طوارئ مرافق', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      default:
        return { label: 'محلي شها', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Native Top Bar with Back Button */}
      <NativeTopBar
        title="دليل طوارئ شها والمنصورة"
        subtitle="الإسعاف، النجدة، المطافئ، وطوارئ المرافق السريعة"
        backLabel="الرئيسية"
        backRoute={{ page: 'home' }}
        badgeText="متاح 24/7"
        badgeVariant="rose"
      />

      {/* 2. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'أرقام الطوارئ السريعة' }]} />

      {/* Mansoura Weekly Emergency Hospital Schedule Card */}
      <MansouraEmergencySchedule compactTeaser={false} />

      {/* Emergency Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-400/20">
        <div className="absolute inset-0 brand-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm shrink-0">
            <PhoneCall className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
              دليل أرقام الطوارئ بشها ومحافظة الدقهلية
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1 leading-relaxed">
              أرقام الإسعاف، النجدة، المطافي، وطوارئ الكهرباء والمياه للاتصال المباشر 24 ساعة دون انتظار.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في أرقام الطوارئ (إسعاف، كهرباء، نجدة، مطافي)..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <HorizontalScrollStrip contentClassName="flex items-center gap-2 pb-1" ariaLabel="تصنيفات أرقام الطوارئ">
          {[
            { id: 'all', label: 'جميع الأرقام' },
            { id: 'medical', label: 'طوارئ طبية وإسعاف' },
            { id: 'security', label: 'شرطة ونجدة' },
            { id: 'utilities', label: 'مرافق (كهرباء / مياه / غاز)' },
            { id: 'local', label: 'خدمات محلية بشها' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer inline-flex items-center justify-center active:scale-95 touch-manipulation ${
                selectedFilter === tab.id
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-red-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </HorizontalScrollStrip>
      </div>

      {/* Emergency Numbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNumbers.map(em => {
          const badge = getCategoryBadge(em.category);
          
          let IconComp = Building2;
          if (em.phone === '123' || em.category === 'medical') IconComp = HeartPulse;
          else if (em.phone === '122' || em.category === 'security') IconComp = ShieldAlert;
          else if (em.phone === '180') IconComp = Flame;
          else if (em.phone === '121' || em.phone === '125' || em.category === 'utilities') IconComp = Wrench;

          return (
            <div
              key={em.id}
              className="card-luxe h-full p-5 flex flex-col justify-between gap-4 hover:border-red-400 dark:hover:border-red-500 hover:-translate-y-0.5 touch-manipulation select-none"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200/50 dark:border-red-800/40">
                      <IconComp className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                    24 ساعة
                  </span>
                </div>
                <h3 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white">
                  {em.titleAr}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {em.descriptionAr}
                </p>
              </div>

              <div className="card-footer-strip space-y-2 mt-0">
                <a
                  href={`tel:${em.phone}`}
                  className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  <span>اتصال مباشر:</span>
                  <span dir="ltr" className="tabular-nums font-black">{em.phone}</span>
                </a>

                <button
                  onClick={() => {
                    onCopyPhone(em.phone);
                    onShowToast(`تم نسخ رقم ${em.titleAr} (${em.phone})`, 'success');
                  }}
                  className="w-full min-h-[44px] py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرقم</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Guidance Box */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-3xl p-5 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-black text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>إرشادات التعامل في حالات الطوارئ:</span>
        </div>
        <p>
          • عند الاتصال بالإسعاف (123) أو النجدة (122)، حدد مكانك بدقة: «قرية شها – مركز المنصورة – اسم الشارع أو أقرب معلم مميز».
        </p>
        <p>
          • في حالات انقطاع التيار أو كسر خطوط المياه، اتصل بأرقام طوارئ المرافق الموضحة أعلاه مباشرة للإبلاغ الفوري لغرفة العمليات.
        </p>
      </div>
    </div>
  );
};
