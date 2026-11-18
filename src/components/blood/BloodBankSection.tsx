import React, { useState } from 'react';
import {
  Droplet,
  Phone,
  PlusCircle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Hospital,
  Clock,
  MapPin,
  Send,
  X
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { BloodDonor, BloodRequest } from '../../types';
import { CustomSelect } from '../common/CustomSelect';
import { HorizontalScrollStrip } from '../common/HorizontalScrollStrip';

interface BloodBankSectionProps {
  onSuccessToast: (msg: string) => void;
}

export const BloodBankSection: React.FC<BloodBankSectionProps> = ({ onSuccessToast }) => {
  const {
    bloodDonors,
    bloodRequests,
    registerBloodDonor,
    submitBloodRequest
  } = useDirectory();

  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [showRegisterDonorModal, setShowRegisterDonorModal] = useState(false);
  const [showRequestBloodModal, setShowRequestBloodModal] = useState(false);

  // Registration Form State
  const [donorName, setDonorName] = useState('');
  const [donorGroup, setDonorGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorArea, setDonorArea] = useState('قرية شها');
  const [donorNotes, setDonorNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Emergency Request State
  const [patientName, setPatientName] = useState('');
  const [reqBloodGroup, setReqBloodGroup] = useState('O+');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [hospital, setHospital] = useState('مستشفى المنصورة الدولي للطوارئ');
  const [reqPhone, setReqPhone] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Filter donors
  const filteredDonors = bloodDonors.filter(donor => {
    if (!donor.consentGiven || !donor.isAvailable) return false;
    if (selectedBloodGroup !== 'all' && donor.bloodGroup !== selectedBloodGroup) return false;
    return true;
  });

  const urgentRequests = bloodRequests.filter(r => r.status === 'urgent');

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorPhone.trim() || !consentGiven) return;

    setIsRegistering(true);
    const success = await registerBloodDonor({
      name: donorName.trim(),
      bloodGroup: donorGroup,
      phone: donorPhone.trim(),
      area: donorArea.trim() || 'شها',
      isAvailable: true,
      consentGiven: true,
      notes: donorNotes.trim()
    });
    setIsRegistering(false);

    if (success) {
      onSuccessToast('بارك الله فيك! تم تسجيلك في بنك متبرعي الدم بشها.');
      setShowRegisterDonorModal(false);
      setDonorName('');
      setDonorPhone('');
      setDonorNotes('');
    }
  };

  const handleRequestBlood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPhone.trim() || !hospital.trim()) return;

    setIsRequesting(true);
    const success = await submitBloodRequest({
      patientName: patientName.trim() || 'حالة طارئة بشها',
      bloodGroup: reqBloodGroup,
      unitsNeeded: Number(unitsNeeded) || 1,
      hospital: hospital.trim(),
      contactPhone: reqPhone.trim(),
      notes: reqNotes.trim()
    });
    setIsRequesting(false);

    if (success) {
      onSuccessToast('تم نشر نداء التبرع بالدم العاجل! نسأل الله الشفاء العاجل.');
      setShowRequestBloodModal(false);
      setPatientName('');
      setReqPhone('');
      setReqNotes('');
    }
  };

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-900/10 mb-8 border border-rose-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-rose-100">
              <Droplet className="w-4 h-4 fill-white text-white" />
              <span>طوارئ إنقاذ الأرواح بشها</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              بنك متبرعي الدم بشها – فصائل الدم الثمانية
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-2xl font-medium leading-relaxed">
              «وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا» — منصة تكافلية لأهالي شها لتسجيل المتبرعين وحماية بياناتهم والتواصل المباشر في الحالات الحرجة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRegisterDonorModal(true)}
              className="px-5 py-3 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-black text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              <HeartHandshake className="w-5 h-5 text-rose-600" />
              <span>التطوع كمتبرع بالدم</span>
            </button>
            <button
              onClick={() => setShowRequestBloodModal(true)}
              className="px-5 py-3 rounded-2xl bg-black/30 hover:bg-black/40 text-white border border-white/20 font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-amber-300" />
              <span>طلب متبرع عاجل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Blood Requests Ticker */}
      {urgentRequests.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>حالات ونداءات طارئة تحتاج متبرعين حالياً:</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentRequests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-rose-600 text-white">
                      مطلوب فصيلة {req.bloodGroup}
                    </span>
                    <span className="text-xs text-rose-800 dark:text-rose-300 font-bold">
                      {req.unitsNeeded} أكياس
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {req.hospital}
                  </h4>
                  {req.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {req.notes}
                    </p>
                  )}
                </div>
                <a
                  href={`tel:${req.contactPhone}`}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال ({req.contactPhone})</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <HorizontalScrollStrip className="mb-6" contentClassName="flex items-center gap-2 pb-4" ariaLabel="فصائل الدم">
        <button
          onClick={() => setSelectedBloodGroup('all')}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all inline-flex items-center justify-center cursor-pointer active:scale-95 touch-manipulation ${
            selectedBloodGroup === 'all'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
          }`}
        >
          جميع الفصائل ({bloodDonors.filter(d => d.consentGiven && d.isAvailable).length})
        </button>
        {bloodGroups.map(bg => {
          const count = bloodDonors.filter(d => d.bloodGroup === bg && d.consentGiven && d.isAvailable).length;
          return (
            <button
              key={bg}
              onClick={() => setSelectedBloodGroup(bg)}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 touch-manipulation ${
                selectedBloodGroup === bg
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-black'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
              }`}
            >
              <span>{bg}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </HorizontalScrollStrip>

      {filteredDonors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDonors.map(donor => (
            <div
              key={donor.id}
              className="card-luxe h-full p-5 hover:border-rose-400 dark:hover:border-rose-500 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    فصيلة {donor.bloodGroup}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/70 dark:border-emerald-800/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متاح للتبرع</span>
                  </span>
                </div>

                <h4 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white mb-2.5">
                  {donor.name}
                </h4>

                <div className="card-meta-panel text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>المنطقة: {donor.area || 'شها'}</span>
                  </div>
                  {donor.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      ملاحظة: {donor.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="card-footer-strip">
                <a
                  href={`tel:${donor.phone}`}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>اتصال بالمتبرع</span>
                  <span dir="ltr" className="tabular-nums opacity-95">({donor.phone})</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-luxe text-center py-12 p-6">
          <Droplet className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            لا توجد بيانات مسجلة حالياً لهذه الفصيلة
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            إذا كنت من أبناء شها وتحمل هذه الفصيلة، بادر بتسجيل بياناتك لتكون سبباً في إنقاذ حياة مريض
          </p>
          <button
            onClick={() => setShowRegisterDonorModal(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md"
          >
            سجل الآن كمتبرع بالدم
          </button>
        </div>
      )}

      {/* Register Donor Modal */}
      {showRegisterDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 p-6 text-right" dir="rtl">
            <button
              onClick={() => setShowRegisterDonorModal(false)}
              aria-label="إغلاق"
              className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-rose-600 mb-2 font-bold text-sm">
              <Droplet className="w-5 h-5 fill-rose-600" />
              <span>التطوع كمتبرع بالدم في شها</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              تسجيل بيانات المتبرع
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              بياناتك أمانة ولن تُستخدم إلا في حالات الطوارئ الطبية لأهالي شها
            </p>

            <form onSubmit={handleRegisterDonor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم بالكامل *
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="الاسم الثلاثي..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="فصيلة الدم"
                    required
                    options={bloodGroups.map(bg => ({ value: bg, label: `فصيلة ${bg}` }))}
                    value={donorGroup}
                    onChange={(val) => setDonorGroup(val as any)}
                    placeholder="اختر الفصيلة..."
                    searchable={false}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المنطقة بشها
                  </label>
                  <input
                    type="text"
                    value={donorArea}
                    onChange={(e) => setDonorArea(e.target.value)}
                    placeholder="مثال: وسط البلد، طريق المنصورة..."
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف المتاح للتواصل *
                </label>
                <input
                  type="tel"
                  required
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="010..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات أو مواعيد الاتصال المفضلة
                </label>
                <input
                  type="text"
                  value={donorNotes}
                  onChange={(e) => setDonorNotes(e.target.value)}
                  placeholder="مثال: يفضل الاتصال مساءً، أو أي وقت للطوارئ..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                <label className="flex items-start gap-2 cursor-pointer text-xs font-semibold text-blue-900 dark:text-blue-200">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span>
                    أوافق صراحة على إتاحة رقمي لأهالي شها في حالات الطوارئ الطبية والتبرع بالدم.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isRegistering || !consentGiven}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 disabled:opacity-50 transition-all"
              >
                {isRegistering ? 'جاري التسجيل...' : 'تأكيد التسجيل في بنك الدم'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Request Modal */}
      {showRequestBloodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 p-6 text-right" dir="rtl">
            <button
              onClick={() => setShowRequestBloodModal(false)}
              aria-label="إغلاق"
              className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-rose-600 mb-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>نداء طارئ للتبرع بالدم</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              طلب متبرعين لحالة حرجة
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              سيتم نشر الطلب فوراً في أعلى منصة شها ون ليراه كل المتبرعين
            </p>

            <form onSubmit={handleRequestBlood} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المستشفى ومكان الحالة *
                </label>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="مثال: مستشفى الطوارئ الجامعي بالمنصورة..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="الفصيلة المطلوبة"
                    required
                    options={bloodGroups.map(bg => ({ value: bg, label: `فصيلة ${bg}` }))}
                    value={reqBloodGroup}
                    onChange={(val) => setReqBloodGroup(val)}
                    placeholder="اختر الفصيلة..."
                    searchable={false}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عدد الأكياس المطلوبة
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم هاتف مرافق المريض للاتصال به *
                </label>
                <input
                  type="tel"
                  required
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  placeholder="010..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تفاصيل الحالة أو اسم الحالة
                </label>
                <textarea
                  rows={2}
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="مثال: عملية جراحية عاجلة غداً صباحاً..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={isRequesting}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{isRequesting ? 'جاري النشر...' : 'إطلاق نداء التبرع فوراً'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
