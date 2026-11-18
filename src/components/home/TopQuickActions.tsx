// DevMeDoAnDrOiD
import React from 'react';
import { Plus, Megaphone } from 'lucide-react';

interface TopQuickActionsProps {
  onOpenAddService: () => void;
  onOpenReport: () => void;
}

export const TopQuickActions: React.FC<TopQuickActionsProps> = ({
  onOpenAddService,
  onOpenReport
}) => {
  return (
    <div className="w-full" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onOpenAddService}
          className="card-luxe flex items-center justify-between p-5 sm:p-6 hover:border-emerald-400 dark:hover:border-emerald-600 hover:-translate-y-0.5 active:scale-[0.985] cursor-pointer group text-right select-none"
        >
          <div className="space-y-1">
            <h3 className="card-title text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              أضف رقم أو خدمة
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              اقترح إضافة جديدة للدليل
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenReport}
          className="card-luxe flex items-center justify-between p-5 sm:p-6 hover:border-rose-400 dark:hover:border-rose-600 hover:-translate-y-0.5 active:scale-[0.985] cursor-pointer group text-right select-none"
        >
          <div className="space-y-1">
            <h3 className="card-title text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              بلّغ عن رقم خاطئ
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              ساعدنا في تصحيح البيانات
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-xs">
            <Megaphone className="w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
