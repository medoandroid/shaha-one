import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, AlertCircle, Sparkles, Camera, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { CustomSelect } from '../common/CustomSelect';
import { CategoryIconBadge } from '../common/CategoryIcon';
import { optimizeImageFile } from '../../lib/security';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
  defaultCategoryId?: string;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
  defaultCategoryId
}) => {
  const { categories, submitServiceRequest } = useDirectory();

  const [categoryId, setCategoryId] = useState(defaultCategoryId || 'doctors');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentCategory = categories.find(c => c.id === categoryId);

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: c.nameAr,
    icon: <CategoryIconBadge category={c} size="sm" />,
    description: c.descriptionAr
  }));

  const subcategoryOptions = [
    { value: '', label: 'بدون تخصص فرعي محدد' },
    ...(currentCategory?.subcategories || []).map(sub => ({
      value: sub,
      label: sub
    }))
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!serviceName.trim() || !phone.trim() || !applicantPhone.trim()) {
      setErrorMessage('يرجى ملء الحقول الإلزامية المطلوبة (اسم الخدمة، رقم الهاتف، ورقم مقدم الطلب للتواصل)');
      return;
    }

    setIsSubmitting(true);
    const success = await submitServiceRequest({
      applicantName: applicantName.trim() || 'أحد أهالي شها',
      applicantPhone: applicantPhone.trim(),
      categoryId,
      subcategoryId: subcategoryId || (currentCategory?.subcategories?.[0] || ''),
      serviceName: serviceName.trim(),
      specialty: specialty.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      address: address.trim() || 'قرية شها - مركز المنصورة',
      workingHours: workingHours.trim() || 'يومياً',
      notes: notes.trim(),
      imageUrl: imageUrl.trim() || undefined
    });

    setIsSubmitting(false);

    if (success) {
      onSuccessToast('تم إرسال طلب إضافة الرقم بنجاح! سيتم مراجعته وتوثيقه بواسطة إدارة الدليل فوراً.');
      onClose();
      // Reset form
      setServiceName('');
      setSpecialty('');
      setPhone('');
      setWhatsapp('');
      setAddress('');
      setWorkingHours('');
      setNotes('');
      setImageUrl('');
      setApplicantPhone('');
    } else {
      setErrorMessage('تعذر إرسال الطلب. يرجى التحقق من الاتصال وإعادة المحاولة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[92vh] flex flex-col text-right" dir="rtl">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-l from-emerald-600 to-teal-700 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="text-xs font-bold text-emerald-100">خدمة مجانية لأهالي شها</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">إضافة رقم أو خدمة جديدة بالدليل</h2>
          <p className="text-xs text-emerald-100 mt-1">
            سجل رقم عيادتك، محلك، أو مهنتك لتظهر لأهالي شها بعد مراجعة المشرف
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Target Category & Dynamic Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="القسم الرئيسي"
                required
                options={categoryOptions}
                value={categoryId}
                onChange={(newCat) => {
                  setCategoryId(newCat);
                  setSubcategoryId('');
                }}
                placeholder="اختر القسم..."
                searchable={true}
                searchPlaceholder="ابحث في أقسام الدليل..."
              />
            </div>

            <div>
              <CustomSelect
                label="التخصص أو القسم الفرعي"
                options={subcategoryOptions}
                value={subcategoryId}
                onChange={(newSub) => setSubcategoryId(newSub)}
                placeholder="اختر التخصص الفرعي..."
                searchable={false}
              />
            </div>
          </div>

          {/* Section 2: Name & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الاسم (اسم الدكتور، المدرس، أو المحل) *
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="مثال: د. أحمد فؤاد، سوبر ماركت الأمانة..."
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المسمى أو التخصص الدقيق
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="مثال: أخصائي أطفال، مدرس لغة إنجليزية ثانوية..."
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Phones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الهاتف الرئيسي للاتصال *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678 أو 050..."
                className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الواتساب
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="010..."
                className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 4: Address & Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                العنوان داخل قرية شها *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: شارع داير الناحية - بجوار المسجد الكبير"
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مواعيد وساعات العمل
              </label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="مثال: يومياً من 5 مساءً حتى 10 مساءً"
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional Profile Photo / Storefront Logo */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>صورة شخصية أو صورة للمحل / العيادة (اختياري)</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إزالة الصورة</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <img
                  src={imageUrl}
                  alt="معاينة الصورة"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    تم إرفاق صورة البروفايل بنجاح
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ستظهر الصورة في بطاقة الخدمة والملف الشخصي لأهالي شها
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 rounded-xl cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-all text-center min-h-[44px]">
                  <Upload className={`w-5 h-5 text-emerald-600 ${isUploadingPhoto ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isUploadingPhoto ? 'جاري ضغط ومعالجة الصورة...' : 'اضغط لاختيار صورة من الكاميرا أو المعرض'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPhoto}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingPhoto(true);
                      try {
                        const dataUrl = await optimizeImageFile(file, 600);
                        setImageUrl(dataUrl);
                      } catch {
                        alert('تعذر قراءة الصورة، يرجى تجربة صورة أخرى');
                      } finally {
                        setIsUploadingPhoto(false);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Section 5: Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات أو نبذة عن الخدمات المقدمة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي تفاصيل أخرى ترغب في ظهورها بالدليل..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Section 6: Verification info */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
              بيانات التواصل مع مقدم الطلب (للتأكد والتوثيق من المشرف قبل النشر):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="اسمك الكريم..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="tel"
                required
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                placeholder="رقم تليفونك للاتصال بك *"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الإضافة للإدارة'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
