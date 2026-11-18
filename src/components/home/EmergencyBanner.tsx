import React, { useState } from 'react';
import {
  Phone,
  ShieldAlert,
  Flame,
  Zap,
  Droplets,
  HeartPulse,
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  LucideIcon,
  PhoneCall,
  Siren,
  X,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { EmergencyNumber } from '../../types';

const getEmergencyIcon = (phone: string, category: string): LucideIcon => {
  if (phone === '123') return HeartPulse;
  if (phone === '122') return ShieldAlert;
  if (phone === '180') return Flame;
  if (phone === '121') return Zap;
  if (phone === '125') return Droplets;
  if (phone === '129') return Flame;
  if (category === 'medical') return HeartPulse;
  if (category === 'security') return ShieldAlert;
  if (category === 'utilities') return Zap;
  return Building2;
};

export const EmergencyBanner: React.FC = () => {
  const { emergencyNumbers } = useDirectory();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const primaryEmergencies = emergencyNumbers.slice(0, 4);

  const filteredNumbers = emergencyNumbers.filter((em) => {
    if (activeCategoryFilter === 'all') return true;
    return em.category === activeCategoryFilter;
  });

  const handleCopy = (e: React.MouseEvent, em: EmergencyNumber) => {
    e.stopPropagation();
    navigator.clipboard.writeText(em.phone);
    setCopiedId(em.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative z-30">
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-rose-600 to-red-700 dark:from-red-950 dark:via-rose-950 dark:to-red-900 text-white rounded-2xl sm:rounded-full px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-lg shadow-red-950/15 border border-red-400/30 flex items-center gap-2 backdrop-blur-xl transition-all duration-300">
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-white" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-full bg-white/15 flex items-center justify-center">
              <Siren className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap">
              <span className="sm:hidden">طوارئ</span>
              <span className="hidden sm:inline">طوارئ عاجلة</span>
            </span>
            <span className="hidden md:inline-block text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/20 border border-white/20">
              24/7
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-1">
          {primaryEmergencies.map((em) => {
            const Icon = getEmergencyIcon(em.phone, em.category);
            return (
              <a
                key={em.id}
                href={`tel:${em.phone}`}
                className="group flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all duration-200 text-xs font-bold border border-white/20 shrink-0 touch-manipulation cursor-pointer"
                title={`اتصال مباشر بـ ${em.titleAr}`}
              >
                <Icon className="w-3 h-3 text-white shrink-0" />
                <span className="font-mono font-black text-[11px] sm:text-xs tracking-wider group-hover:text-emerald-200 transition-colors">
                  {em.phone}
                </span>
                <span className="hidden lg:inline text-[10px] font-bold text-red-100 opacity-90 truncate max-w-[85px]">
                  {em.titleAr}
                </span>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/30 hover:bg-black/45 text-[11px] font-black border border-white/25 shrink-0 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          aria-expanded={isExpanded}
        >
          <span className="hidden sm:inline">
            {isExpanded ? 'إغلاق' : `الدليل الشامل (${emergencyNumbers.length})`}
          </span>
          <span className="sm:hidden">
            {isExpanded ? 'إغلاق' : 'الكل'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 transition-transform" />
          )}
        </button>
      </div>

      {/* 2. Floating High-Tech Emergency Drawer Overlay */}
      {isExpanded && (
        <div className="absolute top-full right-0 left-0 mt-2 z-40 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-red-200 dark:border-red-900/60 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
          
          {/* Drawer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/20">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>دليل طوارئ شها والمنصورة المباشر</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {emergencyNumbers.length} رقم
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اتصال مباشر بضغطة زر واحدة بجميع الأجهزة الأمنية والطبية والمرافق
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="self-end sm:self-auto p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter Tabs inside Drawer */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
            {[
              { id: 'all', label: 'جميع أرقام الطوارئ', Icon: null },
              { id: 'medical', label: 'الخدمات الطبية والإسعاف', Icon: HeartPulse },
              { id: 'security', label: 'الشرطة والنجدة', Icon: ShieldAlert },
              { id: 'utilities', label: 'طوارئ المرافق', Icon: Zap },
              { id: 'local', label: 'طوارئ شها المحلية', Icon: Building2 }
            ].map((tab) => {
              const TabIcon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    activeCategoryFilter === tab.id
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Emergency Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto p-1 scrollbar-thin">
            {filteredNumbers.map((em, idx) => {
              const Icon = getEmergencyIcon(em.phone, em.category);
              const isCopied = copiedId === em.id;
              return (
                <div
                  key={em.id}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-red-400 dark:hover:border-red-600 hover:shadow-md transition-all duration-200 animate-fade-in"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/60 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {em.titleAr}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        {em.descriptionAr || 'طوارئ عاجلة 24/7'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleCopy(e, em)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="نسخ رقم الهاتف"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    
                    <a
                      href={`tel:${em.phone}`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{em.phone}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>إغلاق دليل الطوارئ</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};




