import React from 'react';
import {
  Home,
  Newspaper,
  Plus,
  PhoneCall,
  Droplet
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenAddService: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenAddService
}) => {
  const itemClass = (active: boolean, accent: string) =>
    `flex h-full w-full select-none flex-col items-center justify-center gap-1 rounded-2xl py-1 text-center transition-all touch-manipulation active:scale-95 ${
      active ? `${accent} font-black` : 'font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
    }`;

  return (
    <nav
      aria-label="التنقل السفلي للهاتف"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-black/50 md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
    >
      <div className="mx-auto grid h-[72px] max-w-md grid-cols-5 items-center justify-around px-1.5">
        <button
          type="button"
          onClick={() => onNavigateTab('home')}
          aria-current={activeTab === 'home' ? 'page' : undefined}
          className={itemClass(activeTab === 'home', 'text-emerald-700 dark:text-emerald-300')}
        >
          <span className="relative flex items-center justify-center">
            <Home
              className={`h-6 w-6 transition-transform duration-200 ${
                activeTab === 'home' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.9]'
              }`}
              aria-hidden="true"
            />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-full bg-emerald-700 dark:bg-emerald-300" />
            )}
          </span>
          <span className="whitespace-nowrap text-xs leading-none">الرئيسية</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('news')}
          aria-current={activeTab === 'news' ? 'page' : undefined}
          className={itemClass(activeTab === 'news', 'text-emerald-700 dark:text-emerald-300')}
        >
          <span className="relative flex items-center justify-center">
            <Newspaper
              className={`h-6 w-6 transition-transform duration-200 ${
                activeTab === 'news' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.9]'
              }`}
              aria-hidden="true"
            />
            {activeTab === 'news' && (
              <span className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-full bg-emerald-700 dark:bg-emerald-300" />
            )}
          </span>
          <span className="whitespace-nowrap text-xs leading-none">الأخبار</span>
        </button>

        <div className="-mt-7 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenAddService}
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-700/35 transition-transform active:scale-90 dark:border-slate-900"
            title="إضافة رقم أو خدمة جديدة"
            aria-label="إضافة رقم أو خدمة جديدة"
          >
            <Plus className="h-7 w-7 stroke-[3]" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('emergency')}
          aria-current={activeTab === 'emergency' ? 'page' : undefined}
          className={itemClass(activeTab === 'emergency', 'text-red-700 dark:text-red-300')}
        >
          <span className="relative flex items-center justify-center">
            <PhoneCall
              className={`h-6 w-6 transition-transform duration-200 ${
                activeTab === 'emergency' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.9]'
              }`}
              aria-hidden="true"
            />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-600" />
            {activeTab === 'emergency' && (
              <span className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-300" />
            )}
          </span>
          <span className="whitespace-nowrap text-xs leading-none">الطوارئ</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('blood')}
          aria-current={activeTab === 'blood' ? 'page' : undefined}
          className={itemClass(activeTab === 'blood', 'text-rose-700 dark:text-rose-300')}
        >
          <span className="relative flex items-center justify-center">
            <Droplet
              className={`h-6 w-6 transition-transform duration-200 ${
                activeTab === 'blood' ? 'scale-110 fill-rose-600 stroke-[2.4]' : 'stroke-[1.9]'
              }`}
              aria-hidden="true"
            />
            {activeTab === 'blood' && (
              <span className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-300" />
            )}
          </span>
          <span className="whitespace-nowrap text-xs leading-none">بنك الدم</span>
        </button>
      </div>
    </nav>
  );
};
