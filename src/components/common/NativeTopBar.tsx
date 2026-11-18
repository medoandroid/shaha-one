import React from 'react';
import { ArrowRight, Home, Share2 } from 'lucide-react';
import { AppRoute, goBack, navigateTo } from '../../utils/navigation';
import { Category } from '../../types';
import { CategoryIconBadge } from './CategoryIcon';

export interface NativeTopBarProps {
  title: string;
  subtitle?: string;
  backLabel?: string;
  backRoute?: AppRoute;
  category?: Category | { id?: string; icon?: string; nameAr?: string };
  badgeText?: string;
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
  onShare?: () => void;
  actions?: React.ReactNode;
  showHomeShortcut?: boolean;
  className?: string;
}

export const NativeTopBar: React.FC<NativeTopBarProps> = ({
  title,
  subtitle,
  backLabel = 'رجوع',
  backRoute = { page: 'home' },
  category,
  badgeText,
  badgeVariant = 'blue',
  onShare,
  actions,
  showHomeShortcut = true,
  className = ''
}) => {
  const handleBack = () => {
    goBack(backRoute);
  };

  const badgeStyles = {
    blue: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    rose: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };

  return (
    <div
      className={`sticky top-16 sm:top-20 z-30 mb-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-sm transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        
        {/* Right side in RTL: Touch-friendly Back Button + Title + Icon */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          
          {/* Native Top Back Button (زر الرجوع الذكي للأعلى بمقاس لمسي 44px+) */}
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-black text-xs sm:text-sm transition-all cursor-pointer touch-manipulation select-none shrink-0 border border-slate-200/70 dark:border-slate-700/70 shadow-xs"
            title="الرجوع للصفحة السابقة"
            aria-label="الرجوع للصفحة السابقة"
          >
            <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 dark:text-slate-200 shrink-0" strokeWidth={2.4} />
            <span className="truncate">{backLabel}</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

          {/* Domain Category Icon Badge if available */}
          {category && (
            <CategoryIconBadge category={category} size="sm" className="hidden xs:flex shrink-0" />
          )}

          {/* Screen Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {title}
              </h1>
              {badgeText && (
                <span
                  className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles[badgeVariant]} shrink-0`}
                >
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Left side in RTL: Actions (Share, Home, Custom actions with min 44px touch targets) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {actions}

          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 text-slate-600 dark:text-slate-300 transition-all cursor-pointer touch-manipulation border border-slate-200/60 dark:border-slate-700/60"
              title="مشاركة الصفحة"
              aria-label="مشاركة الصفحة"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {showHomeShortcut && (
            <button
              type="button"
              onClick={() => navigateTo({ page: 'home' })}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 text-slate-600 dark:text-slate-300 transition-all cursor-pointer touch-manipulation border border-slate-200/60 dark:border-slate-700/60"
              title="العودة للصفحة الرئيسية"
              aria-label="العودة للصفحة الرئيسية"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
