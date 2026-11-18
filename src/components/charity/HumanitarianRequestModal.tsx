import React, { useState } from 'react';
import {
  X,
  HeartHandshake,
  ShieldCheck,
  Lock,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  User,
  Coins
} from 'lucide-react';
import {
  HumanitarianCategory,
  HumanitarianRequest,
  HumanitarianRequestType,
  HumanitarianPrivacy
} from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { CustomSelect, SelectOption } from '../common/CustomSelect';

interface HumanitarianRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

const CATEGORIES: { id: HumanitarianCategory; label: string; desc: string }[] = [
  { id: 'medical_equipment', label: 'أجهزة طبية وأكسجين', desc: 'أسطوانات أكسجين، أجهزة تنفس، كراسي متحركة، أسرة طبية' },
  { id: 'medical_aid', label: 'مساعدات علاج وعمليات', desc: 'أدوية شهرية، تحاليل حرجة، مساهمة في عمليات جراحية' },
  { id: 'food_aid', label: 'إطعام وسلات غذائية', desc: 'كراتين مواد غذائية أساسية لأسر الأيتام والمتعففين' },
  { id: 'financial_aid', label: 'دعم مالي طارئ', desc: 'ظروف معيشية حرجة، إيجار متأخر، حالات طارئة' },
  { id: 'debt_relief', label: 'سداد ديون وغارمات', desc: 'فك كرب أسر وغارمات بعد المراجعة الميدانية والتحقق' },
  { id: 'clothing', label: 'كسوة وملابس أطفال', desc: 'كسوة الشتاء وملابس أيتام ومستلزمات دراسية' },
  { id: 'other', label: 'احتياجات إنسانية أخرى', desc: 'أي مساعدات تكافلية أخرى تخدم أهالي القرية' }
];

export const HumanitarianRequestModal: React.FC<HumanitarianRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const { submitHumanitarianRequest, currentUser } = useDirectory();

  const [title, setTitle] = useState('');
  const [requestType, setRequestType] = useState<HumanitarianRequestType>('need');
  const [privacy, setPrivacy] = useState<HumanitarianPrivacy>('anonymous');
  const [category, setCategory] = useState<HumanitarianCategory>('medical_equipment');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [contactPhone, setContactPhone] = useState(currentUser?.phoneNumber || '');
  const [areaOrVillage, setAreaOrVillage] = useState('شها');
  const [description, setDescription] = useState('');
  const [donorDetails, setDonorDetails] = useState('');
  const [amountNeeded, setAmountNeeded] = useState<string>('');
  const [urgency, setUrgency] = useState<'critical' | 'high' | 'normal'>('high');
  const [documentImages, setDocumentImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 900;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setDocumentImages(prev => [...prev.slice(0, 3), compressed]);
          }
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactPhone.trim() || !description.trim()) {
      alert('يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    const finalBeneficiaryName = privacy === 'anonymous'
      ? (requestType === 'donor_offer' ? 'فاعل خير من شها' : 'حالة إنسانية متعففة بشها')
      : (beneficiaryName.trim() || (requestType === 'donor_offer' ? 'متبرع من شها' : 'حالة مستحقة'));

    setIsSubmitting(true);
    const success = await submitHumanitarianRequest({
      title: title.trim(),
      requestType,
      privacy,
      category,
      beneficiaryName: finalBeneficiaryName,
      contactPhone: contactPhone.trim(),
      areaOrVillage: areaOrVillage.trim() || 'شها',
      description: description.trim(),
      donorDetails: donorDetails.trim() || undefined,
      amountNeeded: amountNeeded ? Number(amountNeeded) : undefined,
      urgency,
      documents: documentImages,
      isPubliclyVisible: privacy !== 'private',
      applicantUserId: currentUser?.uid
    });

    setIsSubmitting(false);
    if (success) {
      if (onSuccessToast) {
        onSuccessToast('تم تسجيل الطلب بنجاح! سيتم مراجعته بسرية وتدقيق تام من المشرفين.');
      }
      onClose();
    }
  };

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
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تسجيل طلب مساعدة إنسانية وتكافلية
              </h3>
              <p className="text-xs text-slate-500">
                منصة تواصل الخيرية لأهالي قرية شها
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

        {/* Privacy Assurance Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>خصوصية وسرية تامة مكفولة 100%:</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
            لن يظهر اسم المستفيد الحقيقي أو رقم هاتفه أو مستنداته للعامة على الموقع. يتم التحقق والتواصل فقط عبر المشرفين المعتمدين والموثقين بقرية شها.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
          {/* 1. Request Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              طبيعة الطلب أو المشاركة
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestType('need')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestType === 'need'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                طلب مساعدة أو احتياج
              </button>
              <button
                type="button"
                onClick={() => setRequestType('donor_offer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestType === 'donor_offer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                عرض تبرع أو مساهمة
              </button>
            </div>
          </div>

          {/* 2. Privacy Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              إعداد الخصوصية للطلب
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPrivacy('anonymous')}
                className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                  privacy === 'anonymous'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                مجهول (فاعل خير)
              </button>
              <button
                type="button"
                onClick={() => setPrivacy('public')}
                className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                  privacy === 'public'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                عام (بعد المراجعة)
              </button>
              <button
                type="button"
                onClick={() => setPrivacy('private')}
                className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                  privacy === 'private'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                خاص للإدارة فقط
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              تصنيف نوع المساعدة *
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-lg text-xs font-bold text-right transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان موجز للحالة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: توفير أسطوانة أكسجين لمريض كبار سن بشها"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>

          {/* Beneficiary Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المستفيد أو الأسرة * (محمي وسري)
              </label>
              <input
                type="text"
                required
                value={beneficiaryName}
                onChange={e => setBeneficiaryName(e.target.value)}
                placeholder="الاسم ثلاثي (لن يظهر للعامة)"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الهاتف للتواصل والمراجعة * (سري)
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Area & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المنطقة أو الحي بشها *
              </label>
              <input
                type="text"
                value={areaOrVillage}
                onChange={e => setAreaOrVillage(e.target.value)}
                placeholder="مثال: شارع داير الناحية / منطقة المحطة"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <CustomSelect
                label="درجة الإلحاح والأولوية"
                value={urgency}
                onChange={(val) => setUrgency(val as any)}
                searchable={false}
                options={[
                  { value: 'critical', label: 'حرجة وعاجلة جداً (خلال ساعات)', badge: 'عاجل جداً', badgeColor: 'bg-rose-500 text-white', colorDot: 'bg-rose-500' },
                  { value: 'high', label: 'مرتفعة الأهمية (خلال أيام)', badge: 'مهم', badgeColor: 'bg-amber-500 text-white', colorDot: 'bg-amber-500' },
                  { value: 'normal', label: 'عادية ومستمرة', colorDot: 'bg-emerald-500' }
                ]}
              />
            </div>
          </div>

          {/* Amount Needed */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              المبلغ التقديري المطلوب (اختياري - بالجنيه المصري)
            </label>
            <input
              type="number"
              value={amountNeeded || ''}
              onChange={e => setAmountNeeded(e.target.value)}
              placeholder="مثال: 2500"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شرح وتفاصيل الحالة والاحتياج *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="يرجى كتابة تفاصيل واضحة ودقيقة عن الحالة لمساعدة لجنة الفحص والمشرفين..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
            />
          </div>

          {/* Medical Documents / Photo Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              إرفاق تقرير طبي أو روشتة أو مستند تأكيدي (اختياري وسري)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>اختر صورة المستند أو التقرير</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {documentImages.length > 0 && (
              <div className="flex gap-2 mt-2">
                {documentImages.map((img, i) => (
                  <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                    <img src={img} alt="doc" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setDocumentImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white flex items-center justify-center rounded-bl text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={privacyAgreed}
                onChange={e => setPrivacyAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <span>أقر بأن البيانات صحيحة ولأغراض العمل الخيري الإنساني بشها</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال طلب المساعدة للمراجعة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
