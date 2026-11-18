import React, { useState } from 'react';
import {
  PhoneCall,
  Plus,
  Edit,
  Trash2,
  HeartPulse,
  ShieldAlert,
  Zap,
  Building2,
  Phone,
  Check,
  Copy,
  ArrowUp,
  ArrowDown,
  Search
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { EmergencyNumber } from '../../types';
import { CustomModal } from '../common/CustomModal';

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'medical':
      return { label: 'طوارئ صحية وإسعاف', color: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900', icon: HeartPulse };
    case 'security':
      return { label: 'أمن ونجدة', color: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900', icon: ShieldAlert };
    case 'utilities':
      return { label: 'طوارئ المرافق', color: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900', icon: Zap };
    default:
      return { label: 'طوارئ شها المحلية', color: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900', icon: Building2 };
  }
};

interface EmergencyAdminTabProps {
  onSuccessToast: (msg: string) => void;
}

export const EmergencyAdminTab: React.FC<EmergencyAdminTabProps> = ({ onSuccessToast }) => {
  const { emergencyNumbers, saveEmergencyNumber, deleteEmergencyNumber } = useDirectory();
  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [editingEmergency, setEditingEmergency] = useState<Partial<EmergencyNumber> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter numbers
  const filteredNumbers = emergencyNumbers.filter(em => {
    if (selectedCatFilter !== 'all' && em.category !== selectedCatFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        em.titleAr.toLowerCase().includes(q) ||
        em.phone.includes(q) ||
        (em.descriptionAr && em.descriptionAr.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopy = (e: React.MouseEvent, em: EmergencyNumber) => {
    e.stopPropagation();
    navigator.clipboard.writeText(em.phone);
    setCopiedId(em.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmergency?.titleAr?.trim() || !editingEmergency?.phone?.trim()) {
      alert('يُرجى إدخال اسم الجهة ورقم الهاتف');
      return;
    }

    setIsSubmitting(true);
    try {
      const full: EmergencyNumber = {
        id: editingEmergency.id || 'em_' + Date.now(),
        titleAr: editingEmergency.titleAr.trim(),
        phone: editingEmergency.phone.trim(),
        category: (editingEmergency.category as any) || 'local',
        descriptionAr: editingEmergency.descriptionAr?.trim() || '',
        order: editingEmergency.order ?? (emergencyNumbers.length + 1)
      };

      await saveEmergencyNumber(full);
      onSuccessToast(`تم حفظ رقم طوارئ «${full.titleAr}» بنجاح!`);
      setEditingEmergency(null);
    } catch {
      alert('حدث خطأ أثناء حفظ رقم الطوارئ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (em: EmergencyNumber) => {
    if (confirm(`هل أنت متأكد من حذف رقم طوارئ «${em.titleAr}» نهائياً؟`)) {
      await deleteEmergencyNumber(em.id);
      onSuccessToast(`تم حذف رقم «${em.titleAr}» بنجاح`);
    }
  };

  const handleMoveOrder = async (em: EmergencyNumber, direction: 'up' | 'down') => {
    const sorted = [...emergencyNumbers].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(item => item.id === em.id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const neighbor = sorted[targetIdx];

    const currentOrder = em.order;
    const neighborOrder = neighbor.order === currentOrder ? (direction === 'up' ? currentOrder - 1 : currentOrder + 1) : neighbor.order;

    await saveEmergencyNumber({ ...em, order: neighborOrder });
    await saveEmergencyNumber({ ...neighbor, order: currentOrder });
    onSuccessToast('تم تحديث ترتيب ظهور رقم الطوارئ بنجاح');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الرقم في دليل الطوارئ..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'medical', label: 'صحي وإسعاف' },
              { id: 'security', label: 'أمن ونجدة' },
              { id: 'utilities', label: 'مرافق' },
              { id: 'local', label: 'شها المحلية' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCatFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedCatFilter === tab.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add New Emergency Button */}
        <button
          type="button"
          onClick={() => setEditingEmergency({
            titleAr: '',
            phone: '',
            category: 'medical',
            descriptionAr: 'متاح على مدار 24 ساعة',
            order: emergencyNumbers.length + 1
          })}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة رقم طوارئ جديد</span>
        </button>

      </div>

      {/* Emergency Numbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNumbers.map(em => {
          const badge = getCategoryBadge(em.category);
          const Icon = badge.icon;
          const isCopied = copiedId === em.id;

          return (
            <div
              key={em.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-400 dark:hover:border-red-600 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(em, 'up')}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
                      title="ترقية الترتيب للأعلى"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(em, 'down')}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
                      title="تنزيل الترتيب لأسفل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {em.titleAr}
                    </h3>
                    {em.descriptionAr && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {em.descriptionAr}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-left shrink-0">
                    <span className="font-mono text-lg font-black text-red-600 dark:text-red-400 block">
                      {em.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${em.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>تجربة الاتصال</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, em)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    title="نسخ الرقم"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingEmergency(em)}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    title="تعديل الرقم"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(em)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredNumbers.length === 0 && (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-slate-500 text-xs">
          لا توجد أرقام طوارئ مطابقة لخيارات البحث أو التصفية الحالية.
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingEmergency && (
        <CustomModal
          isOpen={Boolean(editingEmergency)}
          onClose={() => setEditingEmergency(null)}
          title={editingEmergency.id ? `تعديل رقم الطوارئ: ${editingEmergency.titleAr}` : 'إضافة رقم طوارئ جديد'}
        >
          <form onSubmit={handleSaveSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم الخدمة أو جهة الطوارئ *
              </label>
              <input
                type="text"
                required
                value={editingEmergency.titleAr || ''}
                onChange={(e) => setEditingEmergency({ ...editingEmergency, titleAr: e.target.value })}
                placeholder="مثال: إسعاف شها المباشر، طوارئ الكهرباء، نقطة شرطة شها..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف أو الخط الساخن *
                </label>
                <input
                  type="text"
                  required
                  value={editingEmergency.phone || ''}
                  onChange={(e) => setEditingEmergency({ ...editingEmergency, phone: e.target.value })}
                  placeholder="مثال: 123، 122، 01012345678"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تصنيف رقم الطوارئ *
                </label>
                <select
                  value={editingEmergency.category || 'medical'}
                  onChange={(e) => setEditingEmergency({ ...editingEmergency, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="medical">طوارئ صحية وإسعاف (medical)</option>
                  <option value="security">شرطة ونجدة وأمن (security)</option>
                  <option value="utilities">طوارئ المرافق: كهرباء/مياه/غاز (utilities)</option>
                  <option value="local">طوارئ شها والمنصورة المحلية (local)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الوصف أو تعليمات الاستجابة
              </label>
              <input
                type="text"
                value={editingEmergency.descriptionAr || ''}
                onChange={(e) => setEditingEmergency({ ...editingEmergency, descriptionAr: e.target.value })}
                placeholder="مثال: متاح 24 ساعة للإسهام في نقل الحالات الحرجة..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ترتيب الظهور بالدليل
              </label>
              <input
                type="number"
                value={editingEmergency.order ?? 1}
                onChange={(e) => setEditingEmergency({ ...editingEmergency, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingEmergency(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>

          </form>
        </CustomModal>
      )}

    </div>
  );
};
