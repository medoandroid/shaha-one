import React, { useState } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Pill,
  Store,
  HeartHandshake,
  Award,
  CheckCircle2,
  Info,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { VerificationBadge, VerificationAuditEntry } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface VerificationBadgesListProps {
  badgeIds?: string[];
  isLegacyVerified?: boolean;
  history?: VerificationAuditEntry[];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  ShieldCheck,
  Stethoscope,
  Pill,
  Store,
  HeartHandshake,
  Award,
  CheckCircle2,
  Sparkles
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'shadow-blue-500/10'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    glow: 'shadow-emerald-500/10'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    glow: 'shadow-purple-500/10'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    glow: 'shadow-amber-500/10'
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    glow: 'shadow-rose-500/10'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    glow: 'shadow-indigo-500/10'
  }
};

export const VerificationBadgesList: React.FC<VerificationBadgesListProps> = ({
  badgeIds = [],
  isLegacyVerified,
  history,
  size = 'md',
  showLabel = true
}) => {
  const { verificationBadges } = useDirectory();
  const [selectedBadge, setSelectedBadge] = useState<VerificationBadge | null>(null);

  // Match IDs to active badges in context
  const activeBadges: VerificationBadge[] = [];

  badgeIds.forEach(id => {
    const found = verificationBadges.find(b => b.id === id && b.isActive);
    if (found) activeBadges.push(found);
  });

  // If legacy isVerified is true and no badges yet, show default official badge
  if (activeBadges.length === 0 && isLegacyVerified) {
    const defaultOfficial = verificationBadges.find(b => b.id === 'vb_official') || {
      id: 'vb_official',
      nameAr: 'موثق رسمياً من الإدارة',
      descriptionAr: 'تم التحقق من مطابقة بيانات جهة الاتصال والنشاط من قبل إدارة منصة شها ون.',
      color: 'blue' as const,
      icon: 'ShieldCheck',
      isActive: true,
      isOfficial: true
    };
    activeBadges.push(defaultOfficial);
  }

  if (activeBadges.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5" dir="rtl">
        {activeBadges.map(badge => {
          const Icon = BADGE_ICONS[badge.icon] || ShieldCheck;
          const styling = COLOR_MAP[badge.color] || COLOR_MAP.blue;
          const audit = history?.find(h => h.badgeId === badge.id);

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              title={badge.descriptionAr}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-bold transition-all cursor-pointer hover:scale-102 ${styling.bg} ${styling.text} ${styling.border} ${styling.glow}`}
            >
              <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
              {showLabel && (
                <span className={size === 'sm' ? 'text-[11px]' : 'text-xs'}>
                  {badge.nameAr}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Badge Info Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedBadge(null)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 text-right animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${COLOR_MAP[selectedBadge.color]?.bg || 'bg-blue-50'} ${COLOR_MAP[selectedBadge.color]?.text || 'text-blue-600'}`}>
                  {React.createElement(BADGE_ICONS[selectedBadge.icon] || ShieldCheck, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedBadge.nameAr}
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    شارة توثيق معتمدة وموثوقة
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {selectedBadge.descriptionAr}
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>سياسة التوثيق في شها ون:</span>
              </div>
              <p>
                لا تُمنح هذه الشارة إلا بعد المراجعة الميدانية والتحقق من صحة المستندات ومزاولة النشاط بقرية شها.
              </p>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              فهمت، حسناً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
