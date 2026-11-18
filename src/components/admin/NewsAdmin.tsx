import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit,
  Pin,
  AlertTriangle,
  Eye,
  Check,
  X,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { VillageNews, NewsCategory } from '../../types';

interface NewsAdminProps {
  onSuccessToast?: (msg: string) => void;
}

export const NewsAdmin: React.FC<NewsAdminProps> = ({ onSuccessToast }) => {
  const { villageNews, saveVillageNews, deleteVillageNews, toggleNewsPin, adminSession } = useDirectory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<VillageNews> | null>(null);

  const [formData, setFormData] = useState<Partial<VillageNews>>({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    category: 'general',
    categoryLabel: 'أخبار عامة',
    publisherName: adminSession?.name || 'إدارة شها ون',
    isPinned: false,
    isUrgent: false
  });

  const categoryOptions: { id: NewsCategory; label: string }[] = [
    { id: 'general', label: 'أخبار عامة' },
    { id: 'emergency', label: 'طوارئ وإغاثة' },
    { id: 'services', label: 'خدمات وتطوير' },
    { id: 'projects', label: 'مشروعات شها' },
    { id: 'events', label: 'فعاليات ومناسبات' }
  ];

  const handleOpenAdd = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      imageUrl: '',
      category: 'general',
      categoryLabel: 'أخبار عامة',
      publisherName: adminSession?.name || 'إدارة شها ون',
      isPinned: false,
      isUrgent: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: VillageNews) => {
    setEditingNews(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleCategoryChange = (cat: NewsCategory) => {
    const opt = categoryOptions.find(c => c.id === cat);
    setFormData(prev => ({
      ...prev,
      category: cat,
      categoryLabel: opt ? opt.label : 'أخبار عامة'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.summary?.trim()) {
      alert('يُرجى كتابة عنوان الخبر وخلاصة الإعلان');
      return;
    }

    const success = await saveVillageNews(formData);
    if (success) {
      if (onSuccessToast) {
        onSuccessToast(editingNews ? 'تم تحديث الخبر بنجاح' : 'تم نشر الخبر بنجاح على المنصة');
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`هل أنت تأكد من حذف الخبر «${title}»؟`)) {
      const success = await deleteVillageNews(id);
      if (success && onSuccessToast) {
        onSuccessToast('تم حذف الخبر بنجاح');
      }
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    const success = await toggleNewsPin(id, !currentPin);
    if (success && onSuccessToast) {
      onSuccessToast(!currentPin ? 'تم تثبيت الخبر في الشريط الهام' : 'تم إلغاء التثبيت');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">إدارة أخبار وإعلانات شها</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إضافة وتعديل وتثبيت الأخبار الهامة والتنويهات لمواطني شها
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خبر جديد</span>
        </button>
      </div>

      {/* News Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {villageNews.map(item => (
          <div
            key={item.id}
            className="flex flex-col justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  {item.categoryLabel || item.category}
                </span>

                <div className="flex items-center gap-1">
                  {item.isPinned && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      مثبت
                    </span>
                  )}
                  {item.isUrgent && (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-700 dark:text-red-300 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      عاجل
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                {item.summary}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.publishedAt).toLocaleDateString('ar-EG')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.viewsCount || 0}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleTogglePin(item.id, item.isPinned || false)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  item.isPinned
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title={item.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الشريط الهام'}
              >
                <Pin className="w-3.5 h-3.5" />
                <span className="text-[11px]">{item.isPinned ? 'مثبت' : 'تثبيت'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="تعديل الخبر"
                >
                  <Edit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 transition-colors"
                  title="حذف الخبر"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* News Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-emerald-500" />
                <span>{editingNews ? 'تعديل الخبر' : 'إضافة خبر أو تنويه جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 no-scrollbar flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان الخبر الرئيسية *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: افتتاح مركز الخدمات التكنولوجية الجديد بشها..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    فئة الخبر
                  </label>
                  <select
                    value={formData.category || 'general'}
                    onChange={e => handleCategoryChange(e.target.value as NewsCategory)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم الناشر / الجهة
                  </label>
                  <input
                    type="text"
                    value={formData.publisherName || ''}
                    onChange={e => setFormData(prev => ({ ...prev, publisherName: e.target.value }))}
                    placeholder="مثال: وحدة كبار قرية شها / إدارة المنصة"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رابط صورة الخبر (اختياري)
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ملخص الخبر / التنويه (يظهر في البطاقة) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary || ''}
                  onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="ملخص قصير ومباشر يلخص الخبر في سطرين..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تفاصيل الخبر الكاملة
                </label>
                <textarea
                  rows={5}
                  value={formData.content || ''}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="نص الخبر بالتفصيل..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isPinned)}
                    onChange={e => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>تثبيت الخبر في صدارة المنصة والتنويه العاجل</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isUrgent)}
                    onChange={e => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>خبر عاجل (نبض أحمر)</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
                >
                  {editingNews ? 'تحديث البيانات' : 'نشر الخبر الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
