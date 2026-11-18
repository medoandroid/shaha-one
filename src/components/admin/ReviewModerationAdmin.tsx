import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  MessageSquare,
  AlertTriangle,
  Clock,
  ShieldCheck,
  User
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { Review } from '../../types';
import { CustomModal } from '../common/CustomModal';
import { CustomSelect } from '../common/CustomSelect';

interface ReviewModerationAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const ReviewModerationAdmin: React.FC<ReviewModerationAdminProps> = ({ onSuccessToast }) => {
  const {
    reviews,
    listings,
    moderateReview,
    deleteReview,
    adminSession,
    currentUser
  } = useDirectory();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Rejection modal state
  const [rejectingReview, setRejectingReview] = useState<Review | null>(null);
  const [rejectionReason, setRejectionReason] = useState('مخالفة معايير النشر أو لغة غير لائقة');

  const moderatorName = adminSession?.name || currentUser?.displayName || 'مشرف الجودة';

  const filteredReviews = reviews.filter(rev => {
    const revStatus = rev.status || 'approved'; // legacy default
    if (statusFilter !== 'all' && revStatus !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const listingName = listings.find(l => l.id === rev.listingId)?.name || '';
      return (
        rev.userName.toLowerCase().includes(q) ||
        rev.comment.toLowerCase().includes(q) ||
        listingName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  const handleApprove = async (review: Review) => {
    await moderateReview(review.id, 'approved');
    onSuccessToast(`تم اعتماد تقييم «${review.userName}» ونشره على صفحة الخدمة`);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReview) return;

    await moderateReview(rejectingReview.id, 'rejected', rejectionReason.trim());
    onSuccessToast('تم رفض التقييم وتدوين سبب الرفض');
    setRejectingReview(null);
  };

  const handleDelete = async (review: Review) => {
    if (confirm(`هل أنت متأكد من حذف تقييم ${review.userName} نهائياً؟`)) {
      await deleteReview(review.id);
      onSuccessToast('تم حذف التقييم بنجاح');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Banner */}
      <div className="bg-gradient-to-l from-amber-700 via-orange-800 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-amber-300 backdrop-blur-xs">
              <Star className="w-5 h-5 fill-amber-300" />
            </span>
            <h2 className="text-xl font-black">مراقبة واعتماد تقييمات أهالي شها (Review Moderation)</h2>
          </div>
          <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
            فحص التقييمات الواردة قبل ظهورها في الدليل لمكافحة التقييمات الوهمية والإساءات، وضمان أن تعكس الآراء تجارب حقيقية تدعم مصداقية الدليل.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm shrink-0">
            <Clock className="w-4 h-4" />
            <span>{pendingCount} تقييمات جديدة قيد الانتظار</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم صاحب التقييم أو اسم المحل أو نص التعليق..."
            className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="w-full sm:w-56">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            searchable={false}
            size="sm"
            options={[
              { value: 'all', label: `جميع التقييمات (${reviews.length})` },
              { value: 'pending', label: `المعلقة للمراجعة (${pendingCount})`, colorDot: 'bg-amber-500', badge: pendingCount > 0 ? `${pendingCount}` : undefined, badgeColor: 'bg-amber-500 text-white' },
              { value: 'approved', label: 'المعتمدة والمنشورة', colorDot: 'bg-emerald-500' },
              { value: 'rejected', label: 'المرفوضة', colorDot: 'bg-rose-500' }
            ]}
          />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReviews.map(rev => {
          const revStatus = rev.status || 'approved';
          const listing = listings.find(l => l.id === rev.listingId);

          return (
            <div
              key={rev.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between gap-3 ${
                revStatus === 'pending'
                  ? 'border-amber-400 dark:border-amber-700/80 ring-2 ring-amber-400/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-black text-sm text-slate-900 dark:text-white">{rev.userName}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    revStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    revStatus === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {revStatus === 'approved' ? 'منشور معتمد ✓' : revStatus === 'pending' ? 'قيد المراجعة ⏳' : 'مرفوض ✕'}
                  </span>
                </div>

                {/* Rating stars & target listing */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    الخدمة: {listing?.name || 'رقم محذوف أو غير متوفر'}
                  </div>
                </div>

                {/* Comment body */}
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl leading-relaxed">
                  {rev.comment}
                </p>

                {/* Rejection Reason if any */}
                {rev.rejectionReason && (
                  <div className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
                    سبب الرفض: {rev.rejectionReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {revStatus !== 'approved' && (
                  <button
                    onClick={() => handleApprove(rev)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>اعتماد ونشر</span>
                  </button>
                )}

                {revStatus !== 'rejected' && (
                  <button
                    onClick={() => setRejectingReview(rev)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>رفض</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(rev)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="حذف نهائي"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          لا توجد تقييمات مسجلة تطابق التصفية.
        </div>
      )}

      {/* Reject Modal */}
      {rejectingReview && (
        <CustomModal
          isOpen={Boolean(rejectingReview)}
          onClose={() => setRejectingReview(null)}
          title="رفض تقييم مستخدم"
          subtitle={`صاحب التقييم: ${rejectingReview.userName}`}
        >
          <form onSubmit={handleConfirmReject} className="space-y-4" dir="rtl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سبب الرفض:</label>
              <textarea
                required
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                تأكيد الرفض
              </button>
            </div>
          </form>
        </CustomModal>
      )}
    </div>
  );
};
