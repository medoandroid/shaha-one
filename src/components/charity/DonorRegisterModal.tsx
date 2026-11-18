import React, { useState } from 'react';
import {
  X,
  Heart,
  ShieldCheck,
  Lock,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  Sparkles,
  Coins,
  Shirt,
  Utensils,
  Pill,
  Stethoscope,
  Info
} from 'lucide-react';
import { DonorCategory, SafeContactMethod } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { CustomSelect, SelectOption } from '../common/CustomSelect';

interface DonorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

const DONOR_CATEGORIES: { id: DonorCategory; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'money', label: 'دعم مالي وتكافل', desc: 'مساهمات مالية دورية أو طارئة للأسر الأولى بالرعاية', icon: Coins },
  { id: 'medicine', label: 'أدوية ومستلزمات علاج', desc: 'أدوية شهرية، أدوية مزمنة، مساهمة في روشتات', icon: Pill },
  { id: 'equipment', label: 'أجهزة ومعدات طبية', desc: 'أسطوانات أكسجين، كراسي متحركة، أسرة مرضى', icon: Stethoscope },
  { id: 'food', label: 'إطعام ومواد غذائية', desc: 'سلات غذائية، وجبات طعام، لحوم وتوزيع شهري', icon: Utensils },
  { id: 'clothes', label: 'ملابس وكسوة', desc: 'ملابس أطفال، كسوة شتاء، أغطية وبطاطين', icon: Shirt },
  { id: 'other', label: 'خدمات وتبرعات أخرى', desc: 'أي مساعدة عينية أو حرفية لخدمة أهالي شها', icon: Sparkles }
];

export const DonorRegisterModal: React.FC<DonorRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const { submitDonorEntry, currentUser } = useDirectory();

  const [donorName, setDonorName] = useState(currentUser?.displayName || '');
  const [donorType, setDonorType] = useState<'individual' | 'group' | 'business'>('individual');
  const [donationCategory, setDonationCategory] = useState<DonorCategory>('equipment');
  const [donationDetails, setDonationDetails] = useState('');
  const [area, setArea] = useState('شها');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [whatsapp, setWhatsapp] = useState('');

  // Privacy & Consent Settings
  const [privacyMode, setPrivacyMode] = useState<'public' | 'anonymous' | 'private_admin'>('anonymous');
  const [safeContactMethod, setSafeContactMethod] = useState<SafeContactMethod>('via_admin');
  const [consentGiven, setConsentGiven] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationDetails.trim() || !phone.trim()) {
      alert('يرجى ملء تفاصيل المساعدة ورقم الهاتف للتواصل السري');
      return;
    }
    if (!consentGiven) {
      alert('يرجى تأكيد الموافقة على شروط التكافل وحماية البيانات');
      return;
    }

    setIsSubmitting(true);
    const isPublic = privacyMode !== 'private_admin';
    const isAnonymous = privacyMode === 'anonymous';
    const displayName = isAnonymous ? 'فاعل خير من أهالي شها' : (donorName.trim() || 'فاعل خير');

    const success = await submitDonorEntry({
      donorName: displayName,
      donorType,
      donationCategory,
      donationDetails: donationDetails.trim(),
      area: area.trim() || 'شها',
      isPublic,
      isAnonymous,
      status: 'available',
      safeContactMethod,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      userId: currentUser?.uid
    });

    setIsSubmitting(false);
    if (success) {
      if (onSuccessToast) {
        onSuccessToast('بارك الله فيك وتقبل عطاءك! تم تسجيل مبادرتك في سجل الخير بنجاح.');
      }
      onClose();
    }
  };

  const categoryOptions: SelectOption[] = DONOR_CATEGORIES.map(c => ({
    value: c.id,
    label: c.label,
    description: c.desc
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <Heart className="w-5 h-5 fill-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                التسجيل في دليل المتبرعين وأهل الخير
              </h3>
              <p className="text-xs text-slate-500">
                مبادرة أهلية لربط الراغبين في التبرع بالمحتاجين بشها بسرية وأمان
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Privacy Level Choice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>خيارات الخصوصية وظهور البيانات</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
              أنت صاحب القرار الكامل في كيفية ظهور مبادرتك لأهالي القرية:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPrivacyMode('anonymous')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  privacyMode === 'anonymous'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="block text-xs font-bold">فاعل خير (مجهول)</span>
                <span className={`block text-[10px] ${privacyMode === 'anonymous' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  إخفاء اسمك الشخصي
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPrivacyMode('public')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  privacyMode === 'public'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="block text-xs font-bold">ظهور باسمي</span>
                <span className={`block text-[10px] ${privacyMode === 'public' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  إظهار اسم المتبرع
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPrivacyMode('private_admin')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  privacyMode === 'private_admin'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="block text-xs font-bold">سري للإدارة فقط</span>
                <span className={`block text-[10px] ${privacyMode === 'private_admin' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  لا ينشر في الدليل
                </span>
              </button>
            </div>
          </div>

          {/* Name (if not anonymous) */}
          {privacyMode === 'public' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المتبرع أو المبادرة
              </label>
              <div className="relative">
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="مثال: فاعل خير / أ. محمد عبد الرحمن"
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نوع المساعدة أو التبرع المتاح
            </label>
            <CustomSelect
              options={categoryOptions}
              value={donationCategory}
              onChange={val => setDonationCategory(val as DonorCategory)}
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              تفاصيل ما يمكنك تقديمه <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={donationDetails}
              onChange={e => setDonationDetails(e.target.value)}
              placeholder="اكتب بوضوح نوع المساعدة (مثال: توفير كرسي متحرك بحالة جيدة، كراتين مواد غذائية، ملابس أطفال شتوية، إلخ)..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-emerald-500 outline-none resize-none"
              required
            />
          </div>

          {/* Contact & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الهاتف (للتواصل السري) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  dir="ltr"
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium text-right focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المنطقة أو الحي بشها
              </label>
              <div className="relative">
                <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="مثال: شها - البحر الصغير"
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Safe Contact Method Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              طريقة التواصل المفضلة عند توفر حالة مستحقة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                safeContactMethod === 'via_admin'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="safeContact"
                  checked={safeContactMethod === 'via_admin'}
                  onChange={() => setSafeContactMethod('via_admin')}
                  className="text-blue-600"
                />
                <span>عبر المشرفين حصراً</span>
              </label>

              <label className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                safeContactMethod === 'direct_whatsapp'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="safeContact"
                  checked={safeContactMethod === 'direct_whatsapp'}
                  onChange={() => setSafeContactMethod('direct_whatsapp')}
                  className="text-emerald-600"
                />
                <span>واتساب مباشر</span>
              </label>

              <label className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                safeContactMethod === 'direct_phone'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="safeContact"
                  checked={safeContactMethod === 'direct_phone'}
                  onChange={() => setSafeContactMethod('direct_phone')}
                  className="text-amber-600"
                />
                <span>اتصال هاتفي مباشر</span>
              </label>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="donorConsent"
              checked={consentGiven}
              onChange={e => setConsentGiven(e.target.checked)}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="donorConsent" className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium cursor-pointer">
              أوافق بمحض إرادتي على تسجيل هذا التبرع في دليل تكافل أهالي شها، مع إمكانية تعديل الحالة أو إيقاف استقبال الطلبات في أي وقت من خلال التواصل مع الإدارة.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors min-h-[44px]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md transition-all active:scale-98 min-h-[44px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  <span>تأكيد التسجيل في الدليل</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
