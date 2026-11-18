import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, Phone, AlertCircle, FileText, Lock } from 'lucide-react';
import { Listing } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface ClaimListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const ClaimListingModal: React.FC<ClaimListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const { submitListingClaim, currentUser } = useDirectory();

  const [ownerName, setOwnerName] = useState(currentUser?.displayName || '');
  const [contactPhone, setContactPhone] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !contactPhone.trim() || !proofNotes.trim()) {
      alert('يرجى كتابة الاسم ورقم الهاتف وتأكيد أهليتك لملكية هذا النشاط');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitListingClaim({
        listingId: listing.id,
        listingName: listing.name,
        ownerName: ownerName.trim(),
        contactPhone: contactPhone.trim(),
        proofNotes: proofNotes.trim(),
        documentUrl: documentUrl.trim() || undefined,
        applicantUserId: currentUser?.uid
      });

      if (success) {
        onSuccessToast('تم إرسال طلب توثيق واستلام ملكية النشاط بنجاح! سيقوم فريق إدارة شها ون بمراجعته والتواصل معك.');
        onClose();
      } else {
        alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                طلب توثيق واستلام ملكية النشاط
              </h3>
              <p className="text-xs text-slate-500">
                إدارة بروفايلك وتحديث أرقامك مباشرة على شها ون
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

        {/* Listing Target Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.name} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
              {listing.name.slice(0, 1)}
            </div>
          )}
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{listing.name}</h4>
            <p className="text-xs text-slate-500">{listing.titleOrSpecialty || listing.address}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم صاحب الخدمة / المتجر الكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="الاسم الثلاثي أو المسمى التجاري..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رابط التواصل أو هاتف صاحب النشاط <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="010XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              بيانات ومستندات أهليتك لملكية الخدمة <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={proofNotes}
              onChange={e => setProofNotes(e.target.value)}
              placeholder="اذكر تفاصيل إثبات الملكية (مثال: أنا صاحب عيادة د. فلان، أو صاحب سوبر ماركت البركة بشارع داير الناحية)..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب التوثيق والملكية'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
