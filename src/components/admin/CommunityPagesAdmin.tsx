import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Globe,
  RotateCcw,
  Crown,
  Lock
} from 'lucide-react';
import { CommunityFacebookPage } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface CommunityPagesAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const CommunityPagesAdmin: React.FC<CommunityPagesAdminProps> = ({ onSuccessToast }) => {
  const {
    communityPages,
    saveCommunityPage,
    deleteCommunityPage,
    toggleVerifyCommunityPage,
    isOwner
  } = useDirectory();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [followers, setFollowers] = useState('');
  const [category, setCategory] = useState('مجتمعي');
  const [isVerified, setIsVerified] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number>(1);
  const [isResetting, setIsResetting] = useState(false);

  // If not owner, block modifications
  if (!isOwner) {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-center space-y-4" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-amber-900 dark:text-amber-200">
            صلاحية حصرية للمالك السيادي
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
            تعديل وإضافة وحذف صفحات فيسبوك المجتمعية لقرية شها مقتصر فقط على حساب المالك السيادي للمنصة.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setUrl('https://www.facebook.com/');
    setDescription('');
    setFollowers('');
    setCategory('مجتمعي');
    setIsVerified(false);
    setIsActive(true);
    setOrder(communityPages.length + 1);
    setIsEditing(true);
  };

  const handleOpenEdit = (page: CommunityFacebookPage) => {
    setEditingId(page.id);
    setName(page.name);
    setUrl(page.url);
    setDescription(page.description);
    setFollowers(page.followers || '');
    setCategory(page.category || 'مجتمعي');
    setIsVerified(page.isVerified);
    setIsActive(page.isActive);
    setOrder(page.order);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      alert('يرجى ملء اسم الصفحة والرابط');
      return;
    }

    const success = await saveCommunityPage({
      id: editingId || undefined,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      followers: followers.trim() || undefined,
      category: category.trim(),
      isVerified,
      isActive,
      order: Number(order) || 1
    });

    if (success) {
      onSuccessToast(editingId ? 'تم تحديث بيانات الصفحة بنجاح' : 'تم إضافة الصفحة المجتمعية بنجاح');
      setIsEditing(false);
    } else {
      alert('تعذر حفظ الصفحة على الخادم. تأكد من تسجيل الدخول بحساب المالك واتصالك بالإنترنت ثم حاول مرة أخرى.');
    }
  };

  const handleDelete = async (id: string, pageName: string) => {
    if (confirm(`هل أنت متأكد من حذف صفحة (${pageName})؟`)) {
      const ok = await deleteCommunityPage(id);
      if (ok) {
        onSuccessToast('تم حذف الصفحة من الدليل');
      } else {
        alert('تعذر حذف الصفحة من الخادم. تأكد من صلاحية المالك.');
      }
    }
  };

  const handleToggleVerify = async (id: string) => {
    const ok = await toggleVerifyCommunityPage(id);
    if (ok) {
      onSuccessToast('تم تحديث حالة التوثيق للصفحة');
    } else {
      alert('تعذر تحديث حالة التوثيق على الخادم.');
    }
  };

  const handleRestoreCanonical = async () => {
    if (confirm('هل تريد استعادة الصفحات الرسمية الثلاث لشها بأسمائها وروابطها الأصلية؟')) {
      setIsResetting(true);
      try {
        const { INITIAL_COMMUNITY_PAGES } = await import('../../data/initialData');
        for (const p of INITIAL_COMMUNITY_PAGES) {
          await saveCommunityPage(p);
        }
        onSuccessToast('تمت استعادة وتثبيت الصفحات الرسمية الثلاث بنجاح');
      } catch (err) {
        console.error('Failed to restore canonical pages', err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const currentList = communityPages;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              f
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>إدارة صفحات شها على فيسبوك ({currentList.length})</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>خاص بالمالك فقط</span>
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            التحكم في أسماء الصفحات، روابطها المباشرة، الترتيب، وحالات التوثيق
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreCanonical}
            disabled={isResetting}
            className="min-h-[42px] px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="استعادة الصفحات الثلاث الأصلية"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>استعادة الصفحات الأصلية</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="min-h-[42px] px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صفحة جديدة</span>
          </button>
        </div>
      </div>

      {/* Editor Modal / Inline Card */}
      {isEditing && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl space-y-4 animate-scale-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {editingId ? 'تعديل بيانات صفحة فيسبوك' : 'إضافة صفحة مجتمعية جديدة'}
            </h4>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الصفحة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name || ''}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: الشهاوية"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الصفحة على فيسبوك <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url || ''}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://www.facebook.com/..."
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium text-right focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التصنيف
                </label>
                <input
                  type="text"
                  value={category || ''}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="مجتمعي / وفيات / إخباري"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عدد المتابعين (تقريبي)
                </label>
                <input
                  type="text"
                  value={followers || ''}
                  onChange={e => setFollowers(e.target.value)}
                  placeholder="مثال: 45,000+ متابع"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ترتيب الظهور
                </label>
                <input
                  type="number"
                  min="1"
                  value={order ?? 1}
                  onChange={e => setOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                وصف الصفحة
              </label>
              <textarea
                rows={2}
                value={description || ''}
                onChange={e => setDescription(e.target.value)}
                placeholder="نبذة عن محتوى الصفحة ورسالتها لأهالي شها..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none resize-none"
              />
            </div>

            {/* Checkboxes: Verified & Active */}
            <div className="flex items-center gap-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={e => setIsVerified(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>منح شارة توثيق معتمدة</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>مفعلة وتظهر في الموقع</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages Table / Cards */}
      <div className="space-y-3">
        {currentList.map(page => (
          <div
            key={page.id}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-black text-lg shrink-0">
                f
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    #{page.order}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {page.name}
                  </h4>
                  {page.isVerified && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>موثقة</span>
                    </span>
                  )}
                  {!page.isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      معطلة
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {page.description || 'لا يوجد وصف'}
                </p>

                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono dir-ltr inline-block"
                >
                  <ExternalLink className="w-3 h-3 inline ml-1" />
                  {page.url}
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => handleToggleVerify(page.id)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  page.isVerified
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600'
                }`}
                title={page.isVerified ? 'إلغاء التوثيق' : 'توثيق رسمي'}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{page.isVerified ? 'إلغاء التوثيق' : 'توثيق'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(page)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                title="تعديل"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(page.id, page.name)}
                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
