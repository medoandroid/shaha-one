import React from 'react';
import { Home, ChevronLeft } from 'lucide-react';
import { AppRoute, navigateTo } from '../../utils/navigation';

export interface BreadcrumbItem {
  label: string;
  route?: AppRoute;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="مسار التنقل"
      className={`flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-2.5 px-3 sm:px-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 shadow-xs mb-4 scrollbar-none ${className}`}
    >
      <button
        onClick={() => navigateTo({ page: 'home' })}
        className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold shrink-0 transition-colors"
        title="الصفحة الرئيسية"
      >
        <Home className="w-3.5 h-3.5" />
        <span>الرئيسية</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {item.route && !isLast ? (
              <button
                onClick={() => item.route && navigateTo(item.route)}
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold truncate max-w-[150px] sm:max-w-[200px] transition-colors shrink-0"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={`font-black truncate max-w-[180px] sm:max-w-[260px] shrink-0 ${
                  isLast ? 'text-blue-700 dark:text-blue-400' : ''
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
