import React, { useState } from 'react';
import {
  Heart,
  Plus,
  ShieldCheck,
  Phone,
  MessageCircle,
  Lock,
  Sparkles,
  Coins,
  Shirt,
  Utensils,
  Pill,
  Stethoscope,
  MapPin,
  CheckCircle2,
  Clock,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { DonorEntry, DonorCategory } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { DonorRegisterModal } from './DonorRegisterModal';

interface DonorsDirectoryProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenContactAdmin?: (subject?: string) => void;
}

const CATEGORY_MAP: Record<DonorCategory, { label: string; icon: React.ElementType; color: string }> = {
  equipment: { label: 'أجهزة ومعدات طبية', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  medicine: { label: 'أدوية علاجية', icon: Pill, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  food: { label: 'إطعام وسلات غذائية', icon: Utensils, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  clothes: { label: 'كسوة وملابس', icon: Shirt, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' },
  money: { label: 'دعم مالي وتكافل', icon: Coins, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  other: { label: 'مساعدات أخرى', icon: Sparkles, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' }
};

export const DonorsDirectory: React.FC<DonorsDirectoryProps> = ({ onShowToast, onOpenContactAdmin }) => {
  const { donors, isOwner, hasPermission } = useDirectory();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<'all' | DonorCategory>('all');
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<DonorEntry | null>(null);

  const canManageAid = isOwner || hasPermission('manage_aid') || hasPermission('manage_charity');

  // Filter public donors for regular citizens (admins see all)
  const visibleDonors = donors.filter(d => {
    if (!canManageAid && !d.isPublic) return false;
    if (selectedCat !== 'all' && d.donationCategory !== selectedCat) return false;
    return true;
  });

  const handleSafeContact = (donor: DonorEntry) => {
    if (donor.safeContactMethod === 'direct_whatsapp' && donor.whatsapp) {
      const clean = donor.whatsapp.replace(/[^0-9]/g, '');
      const num = clean.startsWith('0') ? '20' + clean.substring(1) : (clean.startsWith('20') ? clean : '20' + clean);
      window.open(`https://wa.me/${num}?text=${encodeURIComponent('السلام عليكم ورحمة الله، تواصلت معك بخصوص مبادرتك الكريمة في دليل متبرعي شها:')}`, '_blank');
    } else if (donor.safeContactMethod === 'direct_phone' && donor.phone) {
      window.location.href = `tel:${donor.phone}`;
    } else {
      // Via Admin
      setSelectedDonorForContact(donor);
      if (onOpenContactAdmin) {
        onOpenContactAdmin(`طلب وسيلة تواصل لمبادرة تبرع: ${donor.donationDetails.slice(0, 40)}... (المتبرع: ${donor.donorName})`);
      } else {
        alert(`للحفاظ على خصوصية المتبرع (${donor.donorName})، يتم التنسيق وتوصيل المساعدة عبر المشرفين المعتمدين لضمان وصولها للمستحقين.`);
      }
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-l from-emerald-600 via-teal-700 to-cyan-800 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold text-emerald-100">
            <UserCheck className="w-3.5 h-3.5" />
            <span>سجل الخير والعطاء لأهالي شها</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black">
            دليل المتبرعين ومبادرات التكافل الأهلي
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            دليل مخصص لأهل الخير الراغبين في تقديم المساعدات العينية والطبية والمالية، مع حماية تامة لبيانات المتبرعين وتنسيق آمن عبر لجنة التكافل.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>سجل كمتبرع بالدليل</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCat('all')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            selectedCat === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          الكل ({visibleDonors.length})
        </button>

        {Object.entries(CATEGORY_MAP).map(([catKey, info]) => {
          const count = visibleDonors.filter(d => d.donationCategory === catKey).length;
          if (count === 0 && selectedCat !== catKey) return null;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCat(catKey as any)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedCat === catKey
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span>{info.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {visibleDonors.map(donor => {
          const catInfo = CATEGORY_MAP[donor.donationCategory] || CATEGORY_MAP.other;
          const CatIcon = catInfo.icon;

          return (
            <div
              key={donor.id}
              className="card-luxe h-full p-5 sm:p-6 flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-500 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${catInfo.color}`}>
                    <CatIcon className="w-3.5 h-3.5" />
                    <span>{catInfo.label}</span>
                  </span>

                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{donor.area}</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white">
                      {donor.donorName}
                    </h4>
                    {donor.isAnonymous && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-slate-400" />
                        <span>فاعل خير</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {donor.donationDetails}
                  </p>
                </div>

                <div className="card-meta-panel text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>التنسيق:</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 text-left">
                    {donor.safeContactMethod === 'via_admin'
                      ? 'عبر المشرفين (حماية البيانات)'
                      : donor.safeContactMethod === 'direct_whatsapp'
                      ? 'واتساب مباشر بإذن المتبرع'
                      : 'اتصال مباشر بإذن المتبرع'}
                  </span>
                </div>
              </div>

              <div className="card-footer-strip flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSafeContact(donor)}
                  className="flex-1 min-h-[44px] px-3 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {donor.safeContactMethod === 'direct_whatsapp' ? (
                    <>
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب المتبرع</span>
                    </>
                  ) : donor.safeContactMethod === 'direct_phone' ? (
                    <>
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال هاتفي</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>طلب التواصل الآمن</span>
                    </>
                  )}
                </button>

                <span className={`px-2 py-1 rounded-xl text-[10px] font-bold ${
                  donor.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : donor.status === 'paused'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {donor.status === 'available' ? 'متاح الآن' : donor.status === 'paused' ? 'متوقف مؤقتاً' : 'تم الاكتمال'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {visibleDonors.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-xs font-bold text-slate-500">
            لا يوجد متبرعون مسجلون حالياً في هذا القسم. بادر بالتسجيل لتكون سبباً في تفريج كربة أهلك بشها.
          </p>
        </div>
      )}

      {/* Register Modal */}
      <DonorRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccessToast={onShowToast}
      />
    </div>
  );
};
