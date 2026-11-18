import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Listing } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface ReportModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const { submitReport } = useDirectory();

  const [reportType, setReportType] = useState<'wrong_number' | 'closed' | 'changed_owner' | 'remove_request' | 'other'>('wrong_number');
  const [details, setDetails] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('يرجى توضيح تفاصيل البلاغ أو الرقم البديل الصحيح');
      return;
    }

    setIsSubmitting(true);
    const success = await submitReport({
      listingId: listing?.id || 'general',
      listingName: listing?.name || 'بلاغ عام عن الدليل',
      reportType,
      details: details.trim(),
      contactPhone: contactPhone.trim()
    });

    setIsSubmitting(false);

    if (success) {
      onSuccessToast('تم استلام بلاغك بنجاح! ستقوم إدارة الدليل بفحص الرقم وتحديثه فوراً.');
      onClose();
      setDetails('');
      setContactPhone('');
    } else {
      setError('تعذر إرسال البلاغ. يرجى إعادة المحاولة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col text-right" dir="rtl">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-l from-red-600 to-rose-700 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-200" />
            <span className="text-xs font-bold text-rose-100">تدقيق جودة البيانات</span>
          </div>
          <h2 className="text-xl font-black">الإبلاغ عن رقم خاطئ أو اقتراح تعديل</h2>
          {listing && (
            <p className="text-xs text-rose-100 mt-1 font-semibold">
              الخدمة المقصودة: {listing.name} ({listing.phone})
            </p>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              سبب الإبلاغ أو نوع التعديل *
            </label>
            <div className="space-y-2">
              {[
                { id: 'wrong_number', label: 'رقم الهاتف غير صحيح أو لا يرد نهائياً' },
                { id: 'closed', label: 'المحل أو العيادة أغلقت أو غيرت نشاطها' },
                { id: 'changed_owner', label: 'تغير صاحب المحل أو الإدارة' },
                { id: 'remove_request', label: 'أنا صاحب الرقم وأطلب حذفه من الدليل' },
                { id: 'other', label: 'سبب أو اقتراح آخر' }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer text-xs font-semibold transition-all ${
                    reportType === opt.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    checked={reportType === opt.id}
                    onChange={() => setReportType(opt.id as any)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              التفاصيل أو الرقم الصحيح البديل *
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="اكتب التوضيح أو الرقم الصحيح هنا لنقوم بتعديله فوراً..."
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم هاتفك للتواصل معك عند الحاجة (اختياري)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="010..."
              className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{isSubmitting ? 'جاري إرسال البلاغ...' : 'إرسال البلاغ لمشرف الدليل'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
