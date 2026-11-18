import React, { useState } from 'react';
import { X, ThumbsUp, Plus, Lightbulb, CheckCircle2, MessageSquare } from 'lucide-react';
import { CommunitySuggestion } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface CommunitySuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const CommunitySuggestionsModal: React.FC<CommunitySuggestionsModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const {
    suggestions,
    submitCommunitySuggestion,
    upvoteSuggestion,
    currentUser
  } = useDirectory();

  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'service' | 'category' | 'improvement'>('service');
  const [suggestedBy, setSuggestedBy] = useState(currentUser?.displayName || '');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !suggestedBy.trim()) {
      alert('يرجى ملء عنوان وتفاصيل الاقتراح واسمك الكريـم');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitCommunitySuggestion({
        type,
        title: title.trim(),
        description: description.trim(),
        suggestedBy: suggestedBy.trim(),
        contactPhone: contactPhone.trim() || undefined,
        applicantUserId: currentUser?.uid
      });

      if (success) {
        onSuccessToast('تم تقديم الاقتراح بنجاح! سيتاح للتصويت والمراجعة من أهالي وإدارة شها ون.');
        setTitle('');
        setDescription('');
        setActiveTab('view');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (suggestionId: string) => {
    const success = await upvoteSuggestion(suggestionId);
    if (success) {
      onSuccessToast('تم تسجيل صوتك ودعمك للاقتراح بنجاح!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                اقتراحات ومشاركات أهالي شها
              </h3>
              <p className="text-xs text-slate-500">
                اقترح أقساماً أو أرقاماً جديدة وصوّت لمبادرات تطوير المنصة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'view'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            استعراض الاقتراحات ({suggestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            + تقديم اقتراح جديد
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'view' ? (
            suggestions.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Lightbulb className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  لا توجد اقتراحات حالية. كن أول من يقترح قسماً أو خدمة لشها!
                </p>
              </div>
            ) : (
              suggestions.map(sugg => {
                const hasVoted = Boolean(currentUser && sugg.votedUsers?.includes(currentUser.uid));
                return (
                  <div
                    key={sugg.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            {sugg.type === 'category' ? 'قسم جديد' : sugg.type === 'service' ? 'خدمة أو رقم' : 'تحسين بالمنصة'}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">{sugg.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {sugg.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpvote(sugg.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border min-w-[50px] transition-all cursor-pointer ${
                          hasVoted
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-blue-400'
                        }`}
                        title="دعم وتصويت"
                      >
                        <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current text-emerald-600' : ''}`} />
                        <span className="text-xs font-black mt-1">{sugg.upvotes || 0}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span>بواسطة: {sugg.suggestedBy}</span>
                      <span className="capitalize">الحالة: {sugg.status === 'approved' ? 'موافق عليه' : sugg.status === 'implemented' ? 'تم التنفيذ' : 'قيد الدراسة'}</span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الاقتراح
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                >
                  <option value="service">إضافة خدمة أو رقم جديد غير موجود</option>
                  <option value="category">مقترح إضافة قسم تخصصي جديد</option>
                  <option value="improvement">تطوير أو فكرة جديدة لشها ون</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الاقتراح <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: إضافة قسم متخصص لفنيي التكييف والتبريد بشها"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تفاصيل الفكرة والاقتراح <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="اشرح اقتراحك ولماذا سيفيد أهالي قرية شها..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم صاحب الاقتراح <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestedBy}
                    onChange={e => setSuggestedBy(e.target.value)}
                    placeholder="اسمك الكريـم..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الإرسال...' : 'تقديم الاقتراح'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
