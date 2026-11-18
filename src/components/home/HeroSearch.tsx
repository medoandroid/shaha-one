import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Phone,
  Sparkles,
  MapPin,
  CheckCircle2,
  Stethoscope,
  GraduationCap,
  Pill,
  Wrench,
  Car,
  ShoppingBag
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { matchesQuery, matchesPhone } from '../../utils/search';
import { CategoryIconBadge } from '../common/CategoryIcon';
import { scheduleIdleTask } from '../../lib/net';
import { Listing } from '../../types';

const VillageMeridianCanvas = lazy(() =>
  import('./VillageMeridianCanvas').then(m => ({ default: m.VillageMeridianCanvas }))
);

function shouldEnableHero3D(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth < 768) return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return false;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return false;
  return true;
}

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectListing: (listing: Listing) => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenAddService: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  onSearchChange,
  onSelectListing,
  onSelectCategory,
  onOpenAddService
}) => {
  const { listings, categories, bloodDonors } = useDirectory();
  const [internalQuery, setInternalQuery] = useState(searchQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (!shouldEnableHero3D()) return;
    return scheduleIdleTask(() => setCanvasReady(true), 1200);
  }, []);

  // Synchronize internal state if parent prop changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== internalQuery) {
      setInternalQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleClear = () => {
    setInternalQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  // Suggestions while typing
  const liveSuggestions = useMemo(() => {
    const trimmed = internalQuery.trim();
    if (!trimmed || trimmed.length < 1) return [];

    return listings
      .filter(item => {
        return (
          matchesQuery(item.name, trimmed) ||
          matchesQuery(item.titleOrSpecialty, trimmed) ||
          matchesQuery(item.address, trimmed) ||
          matchesQuery(item.subcategoryId, trimmed) ||
          matchesPhone(item.phone, trimmed)
        );
      })
      .slice(0, 6);
  }, [listings, internalQuery]);

  const handleSearchSubmit = () => {
    if (liveSuggestions.length > 0) {
      onSelectListing(liveSuggestions[0]);
    } else if (internalQuery.trim()) {
      // Find category or listing or trigger callback
      const matchCat = categories.find(c => matchesQuery(c.nameAr, internalQuery));
      if (matchCat) {
        onSelectCategory(matchCat.id);
      }
    }
  };

  const quickChips = [
    { label: 'أطباء شها', id: 'doctors', icon: Stethoscope },
    { label: 'صيدليات', id: 'pharmacies', icon: Pill },
    { label: 'مدرسين القرية', id: 'teachers', icon: GraduationCap },
    { label: 'صنايعية ومهن حرة', id: 'craftsmen', icon: Wrench },
    { label: 'سواقين ونقل', id: 'transport', icon: Car },
    { label: 'مطاعم وكافيهات', id: 'restaurants', icon: ShoppingBag }
  ];

  return (
    <div
      className="relative px-3 sm:px-8 pt-6 pb-8 sm:pt-9 sm:pb-11 text-center isolate overflow-hidden rounded-3xl sm:rounded-[2rem] border border-emerald-900/10 dark:border-emerald-400/10 bg-gradient-to-b from-white/95 via-emerald-50/35 to-white/90 dark:from-slate-900/95 dark:via-emerald-950/20 dark:to-slate-900/90 shadow-sm animate-fade-in"
    >
      <div className="absolute inset-0 -z-20 brand-pattern opacity-[0.035] dark:opacity-[0.06] pointer-events-none" />
      <Suspense fallback={null}>
        {canvasReady && <VillageMeridianCanvas />}
      </Suspense>
      <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/95 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold mb-4 shadow-2xs backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>SHAHA ONE | المنصة الرقمية المتكاملة لأهالي شها</span>
      </div>

      <h1 className="font-display text-2xl sm:text-5xl lg:text-[3.4rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.18] max-w-4xl mx-auto mb-3.5">
        شها كلها..
        <span className="text-gradient-brand block mt-1">
          أقرب وأسهل في مكان واحد
        </span>
      </h1>

      <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-7 font-medium leading-relaxed">
        منصتك الرقمية المتكاملة لخدمات أهالي شها، تجمع الخدمات والأرقام والأماكن والتواصل والمساعدات المجتمعية بنقرة واحدة
      </p>

      <div className="max-w-3xl mx-auto relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
          className={`relative flex items-center bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border transition-all duration-300 shadow-lg shadow-emerald-950/5 ${
            isFocused
              ? 'border-emerald-600 ring-4 ring-emerald-500/15'
              : 'border-slate-200/90 dark:border-slate-700 hover:border-emerald-400/60 dark:hover:border-slate-600'
          }`}
        >
          <button
            type="submit"
            className="pr-3.5 sm:pr-4 pl-2 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
            title="بدء البحث"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 dark:text-emerald-400" />
          </button>

          <input
            type="text"
            value={internalQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
            placeholder="ابحث عن دكتور، مدرس، صيدلية، سباك، محل بقالة، أو رقم تليفون..."
            className="w-full py-3.5 sm:py-4.5 px-2 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-base font-semibold focus:outline-none"
            dir="rtl"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />

          {internalQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pl-2 cursor-pointer"
              title="مسح البحث"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="pl-2.5 sm:pl-3 pr-1.5 flex items-center gap-1.5">
            <button
              type="submit"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              بحث
            </button>
          </div>
        </form>

        {/* Live Autocomplete Dropdown */}
        {isFocused && liveSuggestions.length > 0 && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-right animate-fade-in">
            <div className="p-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 flex justify-between px-3">
              <span>نتائج فورية مقترحة لـ «{internalQuery}»</span>
              <span>{liveSuggestions.length} نتيجة</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {liveSuggestions.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectListing(item);
                  }}
                  className="p-3 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIconBadge categoryId={item.categoryId} size="sm" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {item.name}
                        {item.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.titleOrSpecialty || item.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{item.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-3xl mx-auto">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold ml-1">تصفح سريع:</span>
        {quickChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => onSelectCategory(chip.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/95 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl mx-auto mt-6 sm:mt-8">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs hover:border-teal-400 transition-colors">
          <span className="font-display tabular-nums text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400">
            {categories.length}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">قسم خدمي</p>
        </div>
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs hover:border-emerald-400 transition-colors">
          <span className="font-display tabular-nums text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {listings.length}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">رقم وخدمة مسجلة</p>
        </div>
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs hover:border-rose-400 transition-colors">
          <span className="font-display tabular-nums text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {bloodDonors.length}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">متبرع بالدم</p>
        </div>
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs hover:border-amber-400 transition-colors">
          <span className="font-display tabular-nums text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            100%
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">بيانات مدققة ومجانية</p>
        </div>
      </div>
    </div>
  );
};
