import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, FileText, ExternalLink, UserCheck } from 'lucide-react';
import { ClaimListingRequest } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface ClaimsAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const ClaimsAdmin: React.FC<ClaimsAdminProps> = ({ onSuccessToast }) => {
  const { claims, reviewListingClaim, isOwner } = useDirectory();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [activeClaim, setActiveClaim] = useState<ClaimListingRequest | null>(null);

  const filteredClaims = claims.filter(c => filterStatus === 'all' || c.status === filterStatus);

  const handleReview = async (claimId: string, status: 'approved' | 'rejected') => {
    const success = await reviewListingClaim(claimId, status, adminNotes);
    if (success) {
      onSuccessToast(status === 'approved' ? 'تم الموافقة على نقل ملكية وتوثيق البروفايل بنجاح!' : 'تم رفض طلب الملكية.');
      setActiveClaim(null);
      setAdminNotes('');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              طلبات ملكية واستلام الأنشطة ({claims.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            فحص إثباتات ملكية أصحاب المحلات والأطباء وإعطائهم الصلاحية المباشرة
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {[
            { id: 'pending', label: 'قيد الانتظار' },
            { id: 'approved', label: 'المقبولة' },
            { id: 'rejected', label: 'المرفوضة' },
            { id: 'all', label: 'الكل' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد طلبات ملكية في هذه الفئة حالياً.
            </p>
          </div>
        ) : (
          filteredClaims.map(claim => (
            <div
              key={claim.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      #{claim.listingId}
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      النشاط: {claim.listingName}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    طالب الملكية: <strong className="text-slate-800 dark:text-slate-200">{claim.ownerName}</strong> (هاتف: <span className="font-mono dir-ltr">{claim.contactPhone}</span>)
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                  claim.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : claim.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {claim.status === 'approved' ? 'موافق عليه ومربوط' : claim.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">تفاصيل ومستندات إثبات الملكية:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl leading-relaxed">
                  {claim.proofNotes}
                </p>
              </div>

              {/* Review Form or Admin Actions */}
              {claim.status === 'pending' && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={activeClaim?.id === claim.id ? adminNotes : ''}
                    onChange={e => {
                      setActiveClaim(claim);
                      setAdminNotes(e.target.value);
                    }}
                    placeholder="ملاحظات الإدارة للطلب..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(claim.id, 'approved')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>اعتماد ونقل الملكية</span>
                    </button>
                    <button
                      onClick={() => handleReview(claim.id, 'rejected')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>رفض الطلب</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
