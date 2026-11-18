import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Phone,
  Eye,
  Trash2,
  Search,
  ExternalLink,
  ChevronDown,
  Filter
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { HumanitarianRequest, HumanitarianStatus, HumanitarianCategory } from '../../types';
import { CustomModal } from '../common/CustomModal';
import { CustomSelect, SelectOption } from '../common/CustomSelect';

const STATUS_LABELS: Record<HumanitarianStatus, { label: string; color: string }> = {
  new: { label: 'طلب جديد', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  under_review: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  approved: { label: 'معتمد ومعروض', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  in_progress: { label: 'جاري جمع التبرع', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' },
  completed: { label: 'اكتملت الحالة ✓', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  rejected: { label: 'طلب مرفوض', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' }
};

const CATEGORY_LABELS: Record<HumanitarianCategory, string> = {
  medical_aid: 'علاج وعمليات جراحية',
  food_aid: 'سلال غذائية ووجبات',
  financial_aid: 'مساعدات مالية للأسر',
  medical_equipment: 'أجهزة طبية وأدوية',
  debt_relief: 'سداد ديون وغارمات',
  clothing: 'كسوة وبطاطين',
  other: 'مساعدات أخرى'
};

interface HumanitarianAidAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const HumanitarianAidAdmin: React.FC<HumanitarianAidAdminProps> = ({ onSuccessToast }) => {
  const {
    humanitarianRequests,
    updateHumanitarianStatus,
    updateHumanitarianProgress,
    deleteHumanitarianRequest,
    donors,
    updateDonorStatus,
    deleteDonorEntry,
    currentUser,
    adminSession
  } = useDirectory();

  const [adminSubTab, setAdminSubTab] = useState<'requests' | 'donors'>('requests');
  const [statusFilter, setStatusFilter] = useState<'all' | HumanitarianStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | HumanitarianCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected request for details/documents modal
  const [selectedCase, setSelectedCase] = useState<HumanitarianRequest | null>(null);

  // Status update modal
  const [updatingCase, setUpdatingCase] = useState<HumanitarianRequest | null>(null);
  const [newStatus, setNewStatus] = useState<HumanitarianStatus>('approved');
  const [adminNote, setAdminNote] = useState('');

  // Progress update modal
  const [progressModalCase, setProgressModalCase] = useState<HumanitarianRequest | null>(null);
  const [currentAmountInput, setCurrentAmountInput] = useState<number>(0);

  const reviewerName = adminSession?.name || currentUser?.displayName || 'مشرف الدليل';

  const filteredRequests = humanitarianRequests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        req.title.toLowerCase().includes(q) ||
        req.beneficiaryName.toLowerCase().includes(q) ||
        req.contactPhone.includes(q) ||
        req.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingCase) return;

    await updateHumanitarianStatus(updatingCase.id, newStatus, adminNote.trim());
    onSuccessToast(`تم تحديث حالة الحالة إلى: ${STATUS_LABELS[newStatus].label}`);
    setUpdatingCase(null);
    setAdminNote('');
  };

  const handleUpdateProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressModalCase) return;

    await updateHumanitarianProgress(progressModalCase.id, currentAmountInput);
    onSuccessToast('تم تحديث مبلغ المساعدة المحصل بنجاح');
    setProgressModalCase(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Banner */}
      <div className="bg-gradient-to-l from-rose-900 via-pink-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-rose-300 backdrop-blur-xs">
              <Heart className="w-5 h-5 fill-rose-300" />
            </span>
            <h2 className="text-xl font-black">إدارة المساعدات الإنسانية وبنك المتبرعين بالدم</h2>
          </div>
          <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
            مراجعة طلبات المساعدة والحالات المرضية والنداءات العاجلة. كإدارة معتمدة، يمكنك رؤية بيانات التواصل والمستندات الطبية المرفوعة للتأكد منها قبل النشر العام مع حفظ سرية المستفيد.
          </p>
        </div>
      </div>

      {/* Sub-Tabs: Requests vs Donors */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80 max-w-md">
        <button
          type="button"
          onClick={() => setAdminSubTab('requests')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            adminSubTab === 'requests'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          طلبات المساعدات ({humanitarianRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab('donors')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            adminSubTab === 'donors'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          دليل المتبرعين ({donors.length})
        </button>
      </div>

      {adminSubTab === 'requests' ? (
      <>
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالعنوان، اسم المستفيد، أو رقم الهاتف..."
            className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-48">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
              searchable={false}
              size="sm"
              options={[
                { value: 'all', label: `جميع الحالات (${humanitarianRequests.length})` },
                { value: 'new', label: 'طلبات جديدة', colorDot: 'bg-blue-500' },
                { value: 'under_review', label: 'قيد المراجعة', colorDot: 'bg-amber-500' },
                { value: 'approved', label: 'معتمدة ونشطة', colorDot: 'bg-emerald-500' },
                { value: 'in_progress', label: 'جاري جمع التبرع', colorDot: 'bg-sky-500' },
                { value: 'completed', label: 'مكتملة', colorDot: 'bg-purple-500' },
                { value: 'rejected', label: 'مرفوضة', colorDot: 'bg-rose-500' }
              ]}
            />
          </div>

          <div className="w-full sm:w-48">
            <CustomSelect
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val as any)}
              searchable={false}
              size="sm"
              options={[
                { value: 'all', label: 'كل الأقسام' },
                ...Object.entries(CATEGORY_LABELS).map(([k, label]) => ({
                  value: k,
                  label
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map(req => {
          const statusConfig = STATUS_LABELS[req.status];
          const percent = req.amountNeeded ? Math.min(100, Math.round(((req.amountRaised || 0) / req.amountNeeded) * 100)) : 0;

          return (
            <div
              key={req.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    req.urgency === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                    req.urgency === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {req.urgency === 'critical' ? 'طارئة جداً' : req.urgency === 'high' ? 'عاجلة' : 'متوسطة'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-rose-600 block mb-1">
                    {CATEGORY_LABELS[req.category]}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                {/* Progress bar if monetary */}
                {req.amountNeeded && (
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">المحصل: {req.amountRaised || 0} ج.م</span>
                      <span className="text-emerald-600">المطلوب: {req.amountNeeded} ج.م</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )}

                {/* Sensitive Info (Admin-Only visible) */}
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                    <span>بيانات الحالة الحقيقية (سرية للإدارة):</span>
                    {req.documents && req.documents.length > 0 && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {req.documents.length} مستند طبي مرفوع ✓
                      </span>
                    )}
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold">
                    المستفيد: <span className="font-bold">{req.beneficiaryName}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${req.contactPhone}`} className="text-blue-600 hover:underline">{req.contactPhone}</a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setUpdatingCase(req);
                    setNewStatus(req.status);
                    setAdminNote(req.adminNotes || '');
                  }}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  تغيير الحالة
                </button>

                {req.amountNeeded && (
                  <button
                    onClick={() => {
                      setProgressModalCase(req);
                      setCurrentAmountInput(req.amountRaised || 0);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs cursor-pointer hover:bg-emerald-100"
                    title="تحديث المبلغ"
                  >
                    تحديث التبرع
                  </button>
                )}

                <button
                  onClick={() => setSelectedCase(req)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  title="عرض التفاصيل والمستندات"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={async () => {
                    if (confirm(`هل أنت متأكد من حذف الحالة «${req.title}»؟`)) {
                      await deleteHumanitarianRequest(req.id);
                      onSuccessToast('تم حذف الطلب بنجاح');
                    }
                  }}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          لا توجد طلبات مساعدة تطابق معايير البحث الحالية.
        </div>
      )}
      </>
      ) : (
        /* Donors Admin Management View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              إجمالي المتبرعين المسجلين: <strong className="text-emerald-600 font-mono">{donors.length}</strong>
            </span>
            <span className="text-slate-400">
              البيانات الحساسة وأرقام الهواتف تظهر للإدارة فقط للتحقق والتنسيق الآمن.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donors.map(donor => (
              <div
                key={donor.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{donor.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {donor.isAnonymous && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                          مجهول (فاعل خير)
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        donor.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : donor.status === 'paused'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {donor.status === 'available' ? 'متاح' : donor.status === 'paused' ? 'متوقف' : 'مكتمل'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {donor.donorName}
                    </h4>
                    <span className="text-[11px] text-slate-400 block">
                      المنطقة: {donor.area || 'شها'} | الفئة: {donor.donationCategory}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {donor.donationDetails}
                  </p>

                  {/* Private Admin Info */}
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">هاتف المتبرع:</span>
                      <span className="font-mono font-bold dir-ltr">{donor.phone || 'غير مسجل'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">طريقة التنسيق:</span>
                      <span>
                        {donor.safeContactMethod === 'via_admin'
                          ? 'عبر المشرفين حصراً'
                          : donor.safeContactMethod === 'direct_whatsapp'
                          ? 'واتساب مباشر'
                          : 'اتصال مباشر'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {donor.phone && (
                      <a
                        href={`tel:${donor.phone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold"
                      >
                        اتصال
                      </a>
                    )}
                    {donor.phone && (
                      <a
                        href={`https://wa.me/2${donor.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold"
                      >
                        واتساب
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateDonorStatus(donor.id, donor.status === 'available' ? 'paused' : 'available')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold"
                    >
                      {donor.status === 'available' ? 'إيقاف مؤقت' : 'تفعيل'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`هل أنت متأكد من حذف المتبرع (${donor.donorName})؟`)) {
                          await deleteDonorEntry(donor.id);
                          onSuccessToast('تم حذف المتبرع من الدليل');
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {donors.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              لا يوجد متبرعون مسجلون حالياً في الدليل.
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Status Update */}
      {updatingCase && (
        <CustomModal
          isOpen={Boolean(updatingCase)}
          onClose={() => setUpdatingCase(null)}
          title="تحديث حالة طلب المساعدة"
          subtitle={`تعديل حالة «${updatingCase.title}»`}
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4" dir="rtl">
            <div>
              <CustomSelect
                label="اختر الحالة الجديدة:"
                value={newStatus}
                onChange={(val) => setNewStatus(val as HumanitarianStatus)}
                searchable={false}
                options={[
                  { value: 'approved', label: 'معتمد ومعروض للجمهور بالدليل (Approved)', colorDot: 'bg-emerald-500' },
                  { value: 'in_progress', label: 'جاري جمع التبرع والتنسيق (In Progress)', colorDot: 'bg-sky-500' },
                  { value: 'completed', label: 'تم جمع المبلغ واكتمال الحالة (Completed)', colorDot: 'bg-purple-500' },
                  { value: 'under_review', label: 'قيد الفحص والمراجعة (Under Review)', colorDot: 'bg-amber-500' },
                  { value: 'rejected', label: 'رفض الطلب (Rejected)', colorDot: 'bg-rose-500' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظة إدارية / سبب القرار:</label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="مثال: تم التواصل والتأكد من التقارير الطبية وموافقة لجنة الزكاة..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUpdatingCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                حفظ الحالة
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* Modal 2: Progress Update */}
      {progressModalCase && (
        <CustomModal
          isOpen={Boolean(progressModalCase)}
          onClose={() => setProgressModalCase(null)}
          title="تحديث المبلغ المحصل للمساعدة"
          subtitle={`الحالة: ${progressModalCase.title}`}
        >
          <form onSubmit={handleUpdateProgressSubmit} className="space-y-4" dir="rtl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المبلغ الذي تم جمعه حتى الآن (من إجمالي {progressModalCase.amountNeeded} ج.م):
              </label>
              <input
                type="number"
                min={0}
                max={progressModalCase.amountNeeded || 1000000}
                value={currentAmountInput}
                onChange={(e) => setCurrentAmountInput(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProgressModalCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                تحديث المبلغ
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* Modal 3: View Full Details & Documents */}
      {selectedCase && (
        <CustomModal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title="الملف الكامل للحالة الإنسانية"
          subtitle={`المقدمة بتاريخ: ${new Date(selectedCase.createdAt).toLocaleDateString('ar-EG')}`}
        >
          <div className="space-y-4 text-xs" dir="rtl">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedCase.title}</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{selectedCase.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <div>
                <span className="text-slate-400 block font-bold">اسم المستفيد / الحالة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedCase.beneficiaryName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">رقم الهاتف:</span>
                <span className="font-bold font-mono text-emerald-600">{selectedCase.contactPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">العنوان في شها:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCase.areaOrVillage || 'شها'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">القسم:</span>
                <span className="font-bold text-blue-600">{CATEGORY_LABELS[selectedCase.category]}</span>
              </div>
            </div>

            {selectedCase.documents && selectedCase.documents.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">المستندات والتقارير الطبية المرفوعة:</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCase.documents.map((docUrl, idx) => (
                    <a
                      key={idx}
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 flex items-center justify-between transition-all"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-300">مستند رقم {idx + 1}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
};
