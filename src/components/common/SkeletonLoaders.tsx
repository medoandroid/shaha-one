import React from 'react';

export const ListingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs animate-pulse flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl mb-2" />
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
};

export const ListingGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs animate-pulse flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
};

export const ListingDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-4 w-4/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
    </div>
  );
};
