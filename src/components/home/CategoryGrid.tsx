import React from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { CategoryIconBadge } from '../common/CategoryIcon';
import { Category } from '../../types';
import { ArrowLeft } from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId: string | null;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategoryId
}) => {
  const { categories, listings } = useDirectory();

  // Count items per category
  const getCount = (catId: string) => {
    return listings.filter(l => l.categoryId === catId && l.status === 'active').length;
  };

  return (
    <section className="mb-14">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>أقسام الخدمات في شها</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {categories.length} قسماً
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            اختر القسم لتصفح الأطباء، المدرسين، المحلات، أو الخدمات المتخصصة
          </p>
        </div>
        
        {selectedCategoryId && (
          <button
            onClick={() => onSelectCategory('')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>عرض كل الأقسام</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const count = getCount(category.id);

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl transition-all duration-200 text-center border relative group touch-manipulation select-none active:scale-[0.97] cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30 ring-4 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                <CategoryIconBadge
                  category={category}
                  size="lg"
                  variant={isSelected ? 'solid' : 'subtle'}
                />
              </div>

              <div className="w-full">
                <h3
                  className={`text-xs sm:text-sm font-bold truncate leading-snug ${
                    isSelected ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
                  }`}
                >
                  {category.nameAr}
                </h3>
                <span
                  className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count > 0 ? `${count} مسجل` : 'متاح للتسجيل'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
