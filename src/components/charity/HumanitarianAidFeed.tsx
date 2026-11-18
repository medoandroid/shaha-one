import React, { useState } from 'react';
import {
  HeartHandshake,
  AlertCircle,
  Plus,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  Sparkles,
  MapPin,
  Stethoscope,
  Pill,
  ShoppingBag,
  Info
} from 'lucide-react';
import { HumanitarianRequest, HumanitarianCategory } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { HumanitarianRequestModal } from './HumanitarianRequestModal';
import { HorizontalScrollStrip } from '../common/HorizontalScrollStrip';

interface HumanitarianAidFeedProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORY_LABELS: Record<HumanitarianCategory, { label: string; icon: any; color: string }> = {
  medical_equipment: { label: 'أجهزة طبية', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
  medical_aid: { label: 'علاج وعمليات', icon: Pill, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
  food_aid: { label: 'إطعام وسلات', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
  financial_aid: { label: 'دعم مالي طارئ', icon: Coins, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
  debt_relief: { label: 'فك كرب وغارمات', icon: HeartHandshake, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
  clothing: { label: 'كسوة وملابس', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
  other: { label: 'مساعدات أخرى', icon: Info, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800' }
};

export const HumanitarianAidFeed: React.FC<HumanitarianAidFeedProps> = ({ onShowToast }) => {
  const { humanitarianRequests, isOwner, hasPermission } = useDirectory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<'all' | HumanitarianCategory>('all');

  // Filter approved or publicly visible requests for citizens (admins can see all)
  const canManageAid = isOwner || hasPermission('manage_aid') || hasPermission('manage_charity');

  const visibleRequests = humanitarianRequests.filter(req => {
    if (!canManageAid && req.status !== 'approved' && req.status !== 'in_progress') return false;
    if (selectedCat !== 'all' && req.category !== selectedCat) return false;
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Banner & Trigger Button */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-l from-rose-600 via-rose-700 to-amber-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold text-rose-100">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>صندوق التكافل الإنساني لقرية شها</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black">
            مبادرات المساعدات الإنسانية والطبية العاجلة
          </h3>
          <p className="text-xs text-rose-100 leading-relaxed font-medium">
            توفير أجهزة التنفس والأكسجين ومساعدات العمليات الجراحية وكفالة الأسر المتعففة بشها، تحت إشراف وتدقيق أهالي القرية.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-black text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل طلب مساعدة</span>
        </button>
      </div>

      <HorizontalScrollStrip contentClassName="flex items-center gap-2 pb-2" ariaLabel="تصنيفات المساعدات">
        <button
          onClick={() => setSelectedCat('all')}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            selectedCat === 'all'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          الكل ({humanitarianRequests.length})
        </button>

        {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => {
          const count = humanitarianRequests.filter(r => r.category === catKey).length;
          if (count === 0) return null;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCat(catKey as any)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedCat === catKey
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span>{info.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </HorizontalScrollStrip>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {visibleRequests.map(req => {
          const catInfo = CATEGORY_LABELS[req.category] || CATEGORY_LABELS.other;
          const CatIcon = catInfo.icon;
          const percentRaised = req.amountNeeded && req.amountRaised
            ? Math.min(100, Math.round((req.amountRaised / req.amountNeeded) * 100))
            : 0;

          return (
            <div
              key={req.id}
              className="card-luxe h-full p-5 sm:p-6 flex flex-col justify-between hover:border-rose-400 dark:hover:border-rose-500 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${catInfo.color}`}>
                    <CatIcon className="w-3.5 h-3.5" />
                    <span>{catInfo.label}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {req.urgency === 'critical' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                        <span>حالة حرجة جداً</span>
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {req.areaOrVillage}
                    </span>
                  </div>
                </div>

                <h4 className="card-title text-base sm:text-[17px] text-slate-900 dark:text-white">
                  {req.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {req.description}
                </p>

                <div className="card-meta-panel text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    المستفيد: {req.beneficiaryName}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>موثقة من المشرفين</span>
                  </span>
                </div>

                {Boolean(req.amountNeeded) && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                      <span className="text-slate-600 dark:text-slate-400">
                        تم تغطية: <strong className="text-emerald-600 dark:text-emerald-400">{req.amountRaised || 0} ج.م</strong>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        المستهدف: {req.amountNeeded} ج.م ({percentRaised}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 transition-all duration-500"
                        style={{ width: `${percentRaised}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer-strip flex items-center justify-between gap-2">
                <a
                  href={`tel:${req.contactPhone}`}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4 shrink-0" />
                  <span>المساهمة أو التبرع للحالة</span>
                </a>

                {canManageAid && (
                  <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold ${
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status === 'approved' ? 'معتمد' : req.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleRequests.length === 0 && (
        <div className="card-luxe text-center py-12 p-6">
          <p className="text-xs font-bold text-slate-500">
            لا توجد حالات مسجلة حالياً في هذا القسم. تقبل الله جهود أهالي شها المخلصين.
          </p>
        </div>
      )}

      {/* Modal */}
      <HumanitarianRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccessToast={onShowToast}
      />
    </div>
  );
};
