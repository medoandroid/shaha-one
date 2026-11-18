import React, { useState } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { PlatformCredit } from '../../types';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ExternalLink,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const PlatformCreditsAdmin: React.FC = () => {
  const { platformCredits, savePlatformCredit, deletePlatformCredit } = useDirectory();
  const [editingCredit, setEditingCredit] = useState<Partial<PlatformCredit> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingCredit({
      name: '',
      role: '',
      description: '',
      link: '',
      avatarUrl: '',
      order: platformCredits.length + 1,
      isActive: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (credit: PlatformCredit) => {
    setEditingCredit({ ...credit });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCredit || !editingCredit.name || !editingCredit.role) {
      alert('يرجى كتابة الاسم والدور الوظيفي للمساهم.');
      return;
    }

    setSaving(true);
    const success = await savePlatformCredit(editingCredit);
    setSaving(false);

    if (success) {
      setMsg('تم حفظ بيانات المساهم بنجاح!');
      setIsFormOpen(false);
      setEditingCredit(null);
      setTimeout(() => setMsg(null), 3000);
    } else {
      alert('حدث خطأ أثناء الحفظ.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت تأكد من حذف المساهم (${name})؟`)) return;
    const success = await deletePlatformCredit(id);
    if (success) {
      setMsg('تم حذف المساهم.');
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleToggleActive = async (credit: PlatformCredit) => {
    await savePlatformCredit({ ...credit, isActive: !credit.isActive });
  };

  const handleMoveOrder = async (credit: PlatformCredit, direction: 'up' | 'down') => {
    const currentOrder = credit.order ?? 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    await savePlatformCredit({ ...credit, order: newOrder });
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>إدارة صُنّاع وتطوير المنصة</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>صُنّاع SHAHA ONE والمساهمون</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            التحكم في قسم «وراء SHAHA ONE» الظاهر بأسفل الصفحة الرئيسية وحواشي المنصة.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مساهم جديد</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{msg}</span>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && editingCredit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {editingCredit.id ? 'تعديل بيانات مساهم' : 'إضافة مساهم جديد'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={editingCredit.name || ''}
                  onChange={e => setEditingCredit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: Mohamed Ayman أو M : Reda Elkhshen 🇫🇷"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الدور أو الوصف الوظيفي *
                </label>
                <input
                  type="text"
                  required
                  value={editingCredit.role || ''}
                  onChange={e => setEditingCredit(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="مثال: التطوير والتنفيذ أو صاحب الفكرة والمشاركة والدعم"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الصفحة أو الملف الشخصي (URL)
                </label>
                <input
                  type="url"
                  value={editingCredit.link || ''}
                  onChange={e => setEditingCredit(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono dir-ltr text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الصورة الرمزية Avatar URL (اختياري)
                </label>
                <input
                  type="url"
                  value={editingCredit.avatarUrl || ''}
                  onChange={e => setEditingCredit(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono dir-ltr text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الوصف الفرعي الإضافي
                </label>
                <input
                  type="text"
                  value={editingCredit.description || ''}
                  onChange={e => setEditingCredit(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="مطور المنصة / داعم الفكرة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCredit.isActive ?? true}
                    onChange={e => setEditingCredit(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">إظهار المساهم بالمنصة</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credits Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white text-sm">
          قائمة المساهمين الحالية ({platformCredits.length})
        </div>

        {platformCredits.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            لا يوجد مساهمون حالياً. اضغط «إضافة مساهم جديد» للبدء.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {platformCredits.map((credit) => (
              <div
                key={credit.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {credit.avatarUrl ? (
                    <img
                      src={credit.avatarUrl}
                      alt={credit.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shrink-0">
                      {credit.name.slice(0, 1)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {credit.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {credit.role}
                      </span>
                      {!credit.isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                          مخفي
                        </span>
                      )}
                    </div>
                    {credit.link && (
                      <a
                        href={credit.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1 dir-ltr text-right mt-0.5 font-mono"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-xs">{credit.link}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleMoveOrder(credit, 'up')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    title="تحريك للأعلى"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(credit, 'down')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    title="تحريك للأسفل"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(credit)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    title={credit.isActive ? 'إخفاء' : 'إظهار'}
                  >
                    {credit.isActive ? (
                      <Eye className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(credit)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(credit.id, credit.name)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
