import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, XCircle, ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { CommunitySuggestion } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface CommunitySuggestionsAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const CommunitySuggestionsAdmin: React.FC<CommunitySuggestionsAdminProps> = ({ onSuccessToast }) => {
  const { suggestions, reviewCommunitySuggestion } = useDirectory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'implemented'>('all');

  const filtered = suggestions.filter(s => filter === 'all' || s.status === filter);

  const handleReview = async (id: string, status: 'approved' | 'implemented' | 'rejected') => {
    const success = await reviewCommunitySuggestion(id, status);
    if (success) {
      onSuccessToast('تم تحديث حالة الاقتراح بنجاح!');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              إدارة مقترحات وتصويت المواطنين ({suggestions.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            مراجعة أفكار واقتراحات أهالي شها واعتماد الأكثر تصويتاً للإنتاج
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'قيد الدراسة' },
            { id: 'approved', label: 'المعتمدة' },
            { id: 'implemented', label: 'تم تنفيذها' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <Lightbulb className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد مقترحات في هذه الفئة حالياً.
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {item.type === 'category' ? 'قسم جديد' : item.type === 'service' ? 'خدمة أو رقم' : 'تطوير'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">بواسطة: {item.suggestedBy} {item.contactPhone ? `(${item.contactPhone})` : ''}</p>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs shrink-0">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{item.upvotes || 0} أصوات</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                {item.description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleReview(item.id, 'approved')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  موافقة واعتماد
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(item.id, 'implemented')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  تعيين كـ «تم التنفيذ 🎉»
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(item.id, 'rejected')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                >
                  رفض
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
