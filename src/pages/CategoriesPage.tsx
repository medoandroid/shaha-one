import React, { useState } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NativeTopBar } from '../components/common/NativeTopBar';
import { CategoryIconBadge } from '../components/common/CategoryIcon';
import { navigateTo } from '../utils/navigation';
import { Search, ArrowLeft } from 'lucide-react';
import { useGsapReveal } from '../hooks/useGsapReveal';

export const CategoriesPage: React.FC = () => {
  const { categories, listings } = useDirectory();
  const [searchCat, setSearchCat] = useState('');
  const gridRef = useGsapReveal<HTMLDivElement>({ stagger: 0.04, y: 16, deps: [categories.length] });

  const getCount = (catId: string) => {
    return listings.filter(l => l.categoryId === catId && l.status === 'active').length;
  };

  const filteredCategories = categories.filter(c =>
    c.nameAr.includes(searchCat) ||
    c.descriptionAr?.includes(searchCat) ||
    c.subcategories?.some(sub => sub.includes(searchCat))
  );

  return (
    <div className="space-y-5">
      {/* 1. Native Top Bar with Back Button */}
      <NativeTopBar
        title="أقسام وتصنيفات شها ون"
        subtitle={`دليل منظم يغطي كافة التخصصات والخدمات في شها`}
        backLabel="الرئيسية"
        backRoute={{ page: 'home' }}
        badgeText={`${categories.length} قسماً`}
      />

      {/* 2. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'أقسام وتصنيفات شها ون' }]} />

      <div className="page-hero p-6 sm:p-10 text-center space-y-4">
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h1 className="font-display text-2xl sm:text-4xl font-black text-white">
            أقسام وتصنيفات منصة شها ون
          </h1>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            تصفح الأقسام الـ {categories.length} المنظمة بدقة لتغطي كافة التخصصات الطبية، التعليمية، التجارية والمهنية لأهالي القرية.
          </p>

          <div className="relative max-w-md mx-auto pt-2">
            <input
              type="text"
              value={searchCat}
              onChange={(e) => setSearchCat(e.target.value)}
              placeholder="ابحث عن قسم أو تخصص (مثال: أطباء، صيدليات، كهربائي)..."
              className="w-full pl-4 pr-11 py-3.5 rounded-2xl text-xs sm:text-sm bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-lg"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredCategories.map(cat => {
          const count = getCount(cat.id);
          return (
            <div
              key={cat.id}
              data-reveal
              onClick={() => navigateTo({ page: 'category', categoryId: cat.id })}
              className="card-luxe h-full p-5 sm:p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-0.5 active:scale-[0.985] cursor-pointer group flex flex-col justify-between touch-manipulation select-none"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <CategoryIconBadge category={cat} size="lg" />
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 tabular-nums">
                    {count} {count === 1 ? 'جهة' : 'جهات مسجلة'}
                  </span>
                </div>

                <h2 className="card-title text-lg text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.nameAr}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[2.75rem]">
                  {cat.descriptionAr}
                </p>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                    {cat.subcategories.slice(0, 4).map((sub, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
                      >
                        {sub}
                      </span>
                    ))}
                    {cat.subcategories.length > 4 && (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 py-0.5 px-1 tabular-nums">
                        +{cat.subcategories.length - 4} أخرى
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="card-footer-strip flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                <span>تصفح جميع الأرقام</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
