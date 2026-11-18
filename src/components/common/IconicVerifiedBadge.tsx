import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  X,
  Calendar,
  UserCheck,
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { Listing, VerificationBadge } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface IconicVerifiedBadgeProps {
  listing?: Listing;
  badgeId?: string;
  badge?: VerificationBadge;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
}

const SIZE_MAP = {
  xs: { box: 'w-3.5 h-3.5', svg: 14, iconSize: 'w-2 h-2' },
  sm: { box: 'w-4.5 h-4.5', svg: 18, iconSize: 'w-2.5 h-2.5' },
  md: { box: 'w-5.5 h-5.5', svg: 22, iconSize: 'w-3 h-3' },
  lg: { box: 'w-7 h-7', svg: 28, iconSize: 'w-4 h-4' }
};

// Shape & Color presets with high-definition SVG paths
export const IconicVerifiedBadge: React.FC<IconicVerifiedBadgeProps> = ({
  listing,
  badgeId,
  badge: passedBadge,
  size = 'sm',
  className = '',
  interactive = true
}) => {
  const { verificationBadges } = useDirectory();
  const [showDetails, setShowDetails] = useState(false);

  // If badge is not directly passed, find primary badge or matched badge
  const resolvedBadgeId = badgeId || listing?.primaryBadgeId || listing?.verificationBadges?.[0];
  const badge: VerificationBadge | undefined =
    passedBadge ||
    (resolvedBadgeId ? verificationBadges.find(b => b.id === resolvedBadgeId && b.isActive) : undefined) ||
    (listing?.isVerified
      ? verificationBadges.find(b => b.id === 'vb_official' && b.isActive) || {
          id: 'vb_official',
          nameAr: 'موثق رسمياً من إدارة شها ون',
          descriptionAr: 'تم التحقق من هوية ومطابقة بيانات جهة الاتصال والنشاط ميدانياً من قبل إدارة منصة شها ون.',
          color: 'blue',
          icon: 'ShieldCheck',
          shape: 'scalloped_circle',
          isActive: true,
          isOfficial: true
        }
      : undefined);

  if (!badge && !listing?.isVerified) {
    return null;
  }

  const { box, svg } = SIZE_MAP[size] || SIZE_MAP.sm;
  const color = badge?.color || 'blue';
  const shape = badge?.shape || (color === 'emerald' ? 'scalloped_circle' : color === 'amber' || color === 'gold' ? 'star' : 'scalloped_circle');

  // Gradient styles per color
  const gradients: Record<string, { start: string; end: string; shadow: string }> = {
    blue: { start: '#0284c7', end: '#1d4ed8', shadow: 'rgba(2, 132, 199, 0.35)' },
    emerald: { start: '#10b981', end: '#047857', shadow: 'rgba(16, 185, 129, 0.35)' },
    amber: { start: '#f59e0b', end: '#d97706', shadow: 'rgba(245, 158, 11, 0.35)' },
    gold: { start: '#fbbf24', end: '#b45309', shadow: 'rgba(251, 191, 36, 0.4)' },
    purple: { start: '#a855f7', end: '#6d28d9', shadow: 'rgba(168, 85, 247, 0.35)' },
    rose: { start: '#f43f5e', end: '#be123c', shadow: 'rgba(244, 63, 94, 0.35)' },
    indigo: { start: '#6366f1', end: '#3730a3', shadow: 'rgba(99, 102, 241, 0.35)' },
    cyan: { start: '#06b6d4', end: '#0e7490', shadow: 'rgba(6, 182, 212, 0.35)' }
  };

  const grad = gradients[color] || gradients.blue;
  const gradientId = `shaha_badge_grad_${badge?.id || 'def'}_${color}`;

  // Find audit details from listing if available
  const audit = listing?.verificationHistory?.find(h => h.badgeId === badge?.id) || listing?.verificationHistory?.[0];

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    e.preventDefault();
    setShowDetails(true);
  };

  return (
    <>
      <span
        onClick={handleClick}
        title={badge?.nameAr || 'موثق رسمياً في شها ون'}
        className={`inline-flex items-center justify-center shrink-0 align-middle ${box} ${
          interactive ? 'cursor-pointer hover:scale-115 active:scale-95 transition-transform duration-200' : ''
        } ${className}`}
        role={interactive ? 'button' : undefined}
      >
        {badge?.customImageUrl ? (
          <img
            src={badge.customImageUrl}
            alt={badge.nameAr}
            className="w-full h-full object-contain filter drop-shadow-xs"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            width={svg}
            height={svg}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-xs transition-transform"
          >
            <defs>
              <linearGradient id={gradientId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={grad.start} />
                <stop offset="100%" stopColor={grad.end} />
              </linearGradient>
            </defs>

            {/* Shape 1: Scalloped 12-point rounded burst seal (Meta / X Modern Verified Style) */}
            {shape === 'scalloped_circle' && (
              <path
                d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.54 2.465 13.17 1.5 11.5 1.5S8.46 2.465 7.81 3.738c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.385 9.55.5 10.92.5 12.5s.885 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.238 3.69 2.238s3.04-.965 3.69-2.238c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
                fill={`url(#${gradientId})`}
              />
            )}

            {/* Shape 2: Heraldic Medieval Shield */}
            {shape === 'shield' && (
              <path
                d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
                fill={`url(#${gradientId})`}
              />
            )}

            {/* Shape 3: Geometric 8-point Islamic/Arab Star */}
            {shape === 'star' && (
              <path
                d="M12 1.5l2.8 4.2 4.9.4-2.1 4.5 2.1 4.5-4.9.4-2.8 4.2-2.8-4.2-4.9-.4 2.1-4.5-2.1-4.5 4.9-.4L12 1.5z"
                fill={`url(#${gradientId})`}
              />
            )}

            {/* Shape 4: Hexagonal Tech Badge */}
            {shape === 'hex' && (
              <path
                d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"
                fill={`url(#${gradientId})`}
              />
            )}

            {/* Shape 5: Diamond Luxury Emblem */}
            {shape === 'diamond' && (
              <path
                d="M12 2l9 10-9 10L3 12 12 2z"
                fill={`url(#${gradientId})`}
              />
            )}

            {/* Shape 6: Circular Concentric Ring Seal */}
            {(shape === 'circle' || shape === 'rosette') && (
              <circle cx="12" cy="12" r="10" fill={`url(#${gradientId})`} />
            )}

            {/* Centered White Crisp Checkmark */}
            <path
              d="M10.2 16.2l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"
              fill="#ffffff"
            />
          </svg>
        )}
      </span>

      {/* Interactive Verification Audit Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowDetails(false)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-right animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${grad.start}, ${grad.end})`,
                    boxShadow: `0 4px 12px ${grad.shadow}`
                  }}
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {badge?.nameAr || 'توثيق رسمي معتمد'}
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    علامة توثيق معتمدة في شها ون ✓
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {badge?.descriptionAr || 'تم التحقق من صحة ومطابقة بيانات جهة الاتصال والنشاط ميدانياً من قِبل إدارة منصة شها ون.'}
            </p>

            {/* Audit Details (Who, When, Why) */}
            {audit && (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-[11px] space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-300">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>جهة الاعتماد:</span>
                  </span>
                  <span>{audit.grantedBy || 'إدارة الدليل'}</span>
                </div>

                {audit.grantedAt && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>تاريخ المنح:</span>
                    </span>
                    <span className="font-mono">{new Date(audit.grantedAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}

                {audit.reason && (
                  <div className="pt-1 border-t border-blue-200/50 dark:border-blue-800/50">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">سبب الاعتماد:</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{audit.reason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Trust Policy */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>سياسة التوثيق الذكي في شها ون:</span>
              </div>
              <p>
                لا تُمنح هذه العلامة إلا بعد المراجعة الميدانية والتحقق من صحة المستندات ومزاولة النشاط بقرية شها وموافقة الإدارة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
