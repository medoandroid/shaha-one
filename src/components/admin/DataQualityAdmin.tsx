import React, { useState, useMemo } from 'react';
import { ShieldAlert, RefreshCw, Layers, CheckCircle2, AlertCircle, Merge, Trash2, Edit3 } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { calculateListingQualityScore, findDuplicateListings } from '../../utils/dataQuality';
import { DuplicatePair, Listing } from '../../types';

interface DataQualityAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const DataQualityAdmin: React.FC<DataQualityAdminProps> = ({ onSuccessToast }) => {
  const { listings, bulkDeleteListings, saveListing, deleteListing } = useDirectory();

  const [activeTab, setActiveTab] = useState<'overview' | 'duplicates' | 'low_quality'>('overview');

  // Analyze listings
  const analysis = useMemo(() => {
    let totalScore = 0;
    const lowQualityListings: { listing: Listing; score: number; issues: string[] }[] = [];

    listings.forEach(l => {
      const res = calculateListingQualityScore(l);
      totalScore += res.score;
      if (res.score < 70) {
        lowQualityListings.push({ listing: l, score: res.score, issues: res.issues });
      }
    });

    const averageQuality = listings.length > 0 ? Math.round(totalScore / listings.length) : 100;
    const duplicates = findDuplicateListings(listings);

    return { averageQuality, lowQualityListings, duplicates };
  }, [listings]);

  const handleMergeDuplicates = async (pair: DuplicatePair) => {
    if (confirm(`هل تريد دمج الخدمتين وتصفية المكرر (${pair.listingB.name}) وحذفه مع الحفاظ على البيانات الأساسية؟`)) {
      // Merge views and calls
      const updatedViews = (pair.listingA.viewsCount || 0) + (pair.listingB.viewsCount || 0);
      const updatedCalls = (pair.listingA.callsCount || 0) + (pair.listingB.callsCount || 0);

      await saveListing({
        ...pair.listingA,
        viewsCount: updatedViews,
        callsCount: updatedCalls
      });

      await deleteListing(pair.listingB.id);
      onSuccessToast('تم دمج الخدمة المكررة ونقل إحصائيات التفاعل بنجاح!');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              مركز جودة البيانات والحد من التكرار (Data Quality Engine)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            فحص أرقام الهواتف، اكتمال الملفات، واكتشاف ودمج السجلات المكررة
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'duplicates'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            المكرر ({analysis.duplicates.length})
          </button>
          <button
            onClick={() => setActiveTab('low_quality')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'low_quality'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            يحتاج استكمال ({analysis.lowQualityListings.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">معدل جودة واكتمال الدليل</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {analysis.averageQuality}%
          </div>
          <p className="text-[11px] text-slate-400">محسوبة على إجمالي {listings.length} سجل بالمنصة</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">سجلات مكررة محتملة</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            {analysis.duplicates.length}
          </div>
          <p className="text-[11px] text-slate-400">تطابق في أرقام الهاتف أو المسمى بجميع الأقسام</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">ملفات تحتاج استكمال بيانات</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {analysis.lowQualityListings.length}
          </div>
          <p className="text-[11px] text-slate-400">ينقصها عنوان دقيق أو صورة أو مواعيد عمل</p>
        </div>
      </div>

      {/* Tab Body */}
      {activeTab === 'duplicates' && (
        <div className="space-y-3">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            السجلات المكررة واقتراحات الدمج ({analysis.duplicates.length})
          </h4>

          {analysis.duplicates.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                ممتاز! لم يكتشف المحرك أي أرقام أو خدمات مكررة في الدليل حالياً.
              </p>
            </div>
          ) : (
            analysis.duplicates.map((pair, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    سبب التكرار: {pair.reason} (نسبة التشابه {pair.similarityScore}%)
                  </span>

                  <button
                    onClick={() => handleMergeDuplicates(pair)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Merge className="w-4 h-4" />
                    <span>دمج الخدمتين وحذف المكرر</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Listing A */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">السجل الأساسي (#1)</span>
                    <h5 className="text-sm font-black text-slate-900 dark:text-white">{pair.listingA.name}</h5>
                    <p className="text-xs text-slate-500 font-mono">هاتف: {pair.listingA.phone}</p>
                    <p className="text-xs text-slate-500">{pair.listingA.address}</p>
                  </div>

                  {/* Listing B */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 space-y-1">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">السجل المكرر (#2)</span>
                    <h5 className="text-sm font-black text-slate-900 dark:text-white">{pair.listingB.name}</h5>
                    <p className="text-xs text-slate-500 font-mono">هاتف: {pair.listingB.phone}</p>
                    <p className="text-xs text-slate-500">{pair.listingB.address}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'low_quality' && (
        <div className="space-y-3">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            السجلات التي تحتاج استكمال بيانات ({analysis.lowQualityListings.length})
          </h4>

          {analysis.lowQualityListings.map(({ listing, score, issues }) => (
            <div
              key={listing.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-black text-slate-900 dark:text-white">{listing.name}</h5>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    نسبة الاكتمال: {score}%
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {issues.map((iss, i) => (
                    <span key={i} className="text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                      • {iss}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
