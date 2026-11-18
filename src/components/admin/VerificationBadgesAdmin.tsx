import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  UserCheck,
  Sparkles,
  Info,
  Clock,
  History,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { VerificationBadge, Listing, ListingEntityType, VerificationBadgeShape } from '../../types';
import { CustomModal } from '../common/CustomModal';
import { CustomSelect, SelectOption } from '../common/CustomSelect';
import { IconicVerifiedBadge } from '../common/IconicVerifiedBadge';

const BADGE_COLOR_OPTIONS: { value: VerificationBadge['color']; label: string }[] = [
  { value: 'blue', label: 'أزرق ملكي موثق (Blue Official)' },
  { value: 'emerald', label: 'أخضر زمردي معتمد (Emerald Trust)' },
  { value: 'gold', label: 'ذهبي نخبوي فاخر (Gold VIP)' },
  { value: 'amber', label: 'عنبري دافئ (Amber Star)' },
  { value: 'purple', label: 'بنفسجي نقابي واحترافي (Purple Syndicate)' },
  { value: 'cyan', label: 'سماوي تقني متطور (Cyan Tech)' },
  { value: 'rose', label: 'وردي إنساني وتطوعي (Rose Aid)' },
  { value: 'indigo', label: 'نيلي وقور (Indigo Official)' }
];

const BADGE_SHAPE_OPTIONS: { value: VerificationBadgeShape; label: string }[] = [
  { value: 'scalloped_circle', label: 'شارة مسننة دائرية (Meta/X Scalloped - 12 نقطة)' },
  { value: 'shield', label: 'درع الحماية والموثوقية (Shield)' },
  { value: 'star', label: 'نجمة هندسية ناصعة (8-Point Star)' },
  { value: 'diamond', label: 'شعار ماسي نخبوي (Diamond Emblem)' },
  { value: 'hex', label: 'سداسي تقني عصري (Tech Hexagon)' },
  { value: 'circle', label: 'ختم دائري كلاسيكي (Circular Ring)' }
];

const BADGE_ICON_OPTIONS = [
  'ShieldCheck',
  'CheckCircle2',
  'Award',
  'Sparkles',
  'HeartHandshake',
  'Crown',
  'Star',
  'Building2',
  'Stethoscope'
];

const ENTITY_TYPE_OPTIONS: { value: ListingEntityType; label: string }[] = [
  { value: 'person', label: 'أشخاص (أطباء، معلمون، حرفيون)' },
  { value: 'shop', label: 'محلات ومتاجر ومعارض' },
  { value: 'service', label: 'خدمات وورش ومؤسسات' },
  { value: 'place', label: 'أماكن عامة ومعالم' }
];

interface VerificationBadgesAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const VerificationBadgesAdmin: React.FC<VerificationBadgesAdminProps> = ({ onSuccessToast }) => {
  const {
    verificationBadges,
    listings,
    saveVerificationBadge,
    deleteVerificationBadge,
    assignBadgeToListing,
    removeBadgeFromListing,
    setPrimaryBadgeForListing,
    currentUser,
    adminSession
  } = useDirectory();

  // Create / Edit Badge Modal
  const [editingBadge, setEditingBadge] = useState<Partial<VerificationBadge> | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // Assign Badge Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [selectedBadgeId, setSelectedBadgeId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [isPrimaryAssign, setIsPrimaryAssign] = useState(true);

  // Revoke Badge Modal
  const [revokeModalData, setRevokeModalData] = useState<{ listing: Listing; badgeId: string } | null>(null);

  // Filter listings holding badges
  const [filterBadgeId, setFilterBadgeId] = useState<string>('all');

  // Handle Save Badge (Create / Update)
  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge?.nameAr || !editingBadge?.descriptionAr) return;

    const badgeToSave: VerificationBadge = {
      id: editingBadge.id || `badge_${Date.now()}`,
      nameAr: editingBadge.nameAr.trim(),
      descriptionAr: editingBadge.descriptionAr.trim(),
      color: editingBadge.color || 'blue',
      icon: editingBadge.icon || 'ShieldCheck',
      shape: editingBadge.shape || 'scalloped_circle',
      customImageUrl: editingBadge.customImageUrl || '',
      isOfficial: editingBadge.isOfficial ?? true,
      targetEntityTypes: editingBadge.targetEntityTypes || ['person', 'shop', 'service', 'place'],
      priority: editingBadge.priority ?? 1,
      isActive: editingBadge.isActive ?? true,
      createdAt: editingBadge.createdAt || new Date().toISOString()
    };

    await saveVerificationBadge(badgeToSave);
    onSuccessToast(editingBadge.id ? 'تم تحديث علامة التوثيق بنجاح!' : 'تم إنشاء علامة التوثيق الجديدة بنجاح!');
    setIsBadgeModalOpen(false);
    setEditingBadge(null);
  };

  // Handle Assign Badge to Listing
  const handleAssignBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingId || !selectedBadgeId || !assignReason.trim()) {
      alert('يرجى اختيار الرقم وعلامة التوثيق وكتابة سبب التوثيق المعتمد');
      return;
    }

    await assignBadgeToListing(selectedListingId, selectedBadgeId, assignReason.trim());
    if (isPrimaryAssign) {
      await setPrimaryBadgeForListing(selectedListingId, selectedBadgeId);
    }
    onSuccessToast('تم منح وتوثيق العلامة للرقم وإدراجها في السجل الرسمي بنجاح!');
    setIsAssignModalOpen(false);
    setSelectedListingId('');
    setSelectedBadgeId('');
    setAssignReason('');
    setListingSearch('');
    setIsPrimaryAssign(true);
  };

  // Handle Revoke Badge from Listing
  const handleRevokeBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeModalData) return;

    await removeBadgeFromListing(revokeModalData.listing.id, revokeModalData.badgeId);
    onSuccessToast('تم سحب علامة التوثيق وتدوين السبب في سجل المراجعة.');
    setRevokeModalData(null);
  };

  // Listings with badges
  const verifiedListings = listings.filter(l => {
    if (!l.verificationBadges || l.verificationBadges.length === 0) return false;
    if (filterBadgeId === 'all') return true;
    return l.verificationBadges.includes(filterBadgeId);
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-emerald-300 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black">نظام علامات التوثيق المتقدمة (Dynamic Verification Badges)</h2>
          </div>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            التحكم الشامل في علامات التوثيق الرسمية والمهنية والتجارية لأهالي ومحلات قرية شها. يتم تسجيل كل اعتماد بسبب وتاريخ المشرف لحماية المصداقية ومكافحة التزييف.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingBadge({
                nameAr: '',
                descriptionAr: '',
                color: 'emerald',
                icon: 'ShieldCheck',
                isOfficial: true,
                targetEntityTypes: ['person', 'shop', 'service', 'place'],
                priority: 1,
                isActive: true
              });
              setIsBadgeModalOpen(true);
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء علامة توثيق جديدة</span>
          </button>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer transition-all active:scale-95"
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>منح علامة لرقم / خدمة</span>
          </button>
        </div>
      </div>

      {/* 1. Existing Badges Registry Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>العلامات المعتمدة في النظام ({verificationBadges.length})</span>
          </h3>
          <span className="text-xs text-slate-500">العلامات المتاحة للاستخدام ومنحها للقوائم</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verificationBadges.map(badge => {
            const usageCount = listings.filter(l => l.verificationBadges?.includes(badge.id)).length;
            return (
              <div
                key={badge.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{badge.nameAr}</span>
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.isOfficial ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                      {badge.isOfficial ? 'توثيق رسمي' : 'تمييز خاص'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {badge.descriptionAr}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <span className="font-semibold">تمنح لـ:</span>
                    {badge.targetEntityTypes?.map((t: ListingEntityType) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t === 'person' ? 'أشخاص' : t === 'shop' ? 'محلات' : t === 'service' ? 'خدمات' : 'أماكن'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">
                    ممنوحة لـ: <span className="font-black text-slate-900 dark:text-white">{usageCount}</span> خدمة
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBadge(badge);
                        setIsBadgeModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                      title="تعديل العلامة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`هل أنت متأكد من حذف علامة «${badge.nameAr}» نهائياً؟`)) {
                          await deleteVerificationBadge(badge.id);
                          onSuccessToast('تم حذف علامة التوثيق');
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="حذف العلامة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Listings with Badges & Audit History */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>جهات الاتصال الحاصلة على علامات التوثيق ({verifiedListings.length})</span>
            </h3>
            <p className="text-xs text-slate-500">قائمة الأرقام والمحلات التي تم تدقيقها ومنحها شارات التوثيق بالدليل</p>
          </div>

          <div className="w-full sm:w-52">
            <CustomSelect
              value={filterBadgeId}
              onChange={setFilterBadgeId}
              searchable={false}
              size="sm"
              options={[
                { value: 'all', label: 'كل العلامات' },
                ...verificationBadges.map(b => ({
                  value: b.id,
                  label: b.nameAr,
                  colorDot: b.color === 'emerald' ? 'bg-emerald-500' : b.color === 'blue' ? 'bg-blue-500' : b.color === 'amber' ? 'bg-amber-500' : b.color === 'purple' ? 'bg-purple-500' : b.color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
                }))
              ]}
            />
          </div>
        </div>

        {verifiedListings.length > 0 ? (
          <div className="space-y-3">
            {verifiedListings.map(listing => (
              <div
                key={listing.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{listing.name}</span>
                      <IconicVerifiedBadge listing={listing} size="sm" />
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-600">{listing.phone}</span>
                    <span className="text-xs text-slate-400">({listing.address})</span>
                  </div>

                  {/* Active Badges on this listing */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {listing.verificationBadges?.map(badgeId => {
                      const badgeInfo = verificationBadges.find(b => b.id === badgeId);
                      if (!badgeInfo) return null;
                      const isPrimary = listing.primaryBadgeId === badgeId;
                      return (
                        <span
                          key={badgeId}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl border shadow-2xs ${
                            isPrimary
                              ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <IconicVerifiedBadge badge={badgeInfo} size="xs" interactive={false} />
                          <span>{badgeInfo.nameAr}</span>
                          {isPrimary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-black">
                              أساسية بجانب الاسم
                            </span>
                          )}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={async () => {
                                await setPrimaryBadgeForListing(listing.id, badgeId);
                                onSuccessToast(`تم تعيين «${badgeInfo.nameAr}» كشارة أساسية تظهر بجانب الاسم`);
                              }}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mr-1"
                              title="جعلها الشارة الأساسية التي تظهر بجانب الاسم"
                            >
                              [تعيين كأساسية]
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setRevokeModalData({ listing, badgeId })}
                            className="mr-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="سحب هذه العلامة"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {/* Latest Audit Note if exists */}
                  {listing.verificationHistory && listing.verificationHistory.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        آخر توثيق: {listing.verificationHistory[listing.verificationHistory.length - 1].reason} (بواسطة {listing.verificationHistory[listing.verificationHistory.length - 1].grantedBy})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setSelectedListingId(listing.id);
                      setIsAssignModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100"
                  >
                    منح علامة إضافية
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            لا توجد أرقام حاصلة على علامة التوثيق المحددة حالياً.
          </div>
        )}
      </div>

      {/* Modal 1: Create / Edit Badge */}
      {isBadgeModalOpen && (
        <CustomModal
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
          title={editingBadge?.id ? 'تعديل علامة التوثيق' : 'إنشاء علامة توثيق جديدة'}
          subtitle="تحديد خصائص العلامة وصلاحيات منحها للأشخاص والمحلات"
        >
          <form onSubmit={handleSaveBadge} className="space-y-4" dir="rtl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم العلامة *</label>
              <input
                type="text"
                required
                value={editingBadge?.nameAr || ''}
                onChange={(e) => setEditingBadge(prev => prev ? { ...prev, nameAr: e.target.value } : null)}
                placeholder="مثال: طبيب نقابي معتمد، متجر عريق موثق..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">وصف العلامة ومعاييرها *</label>
              <textarea
                required
                rows={2}
                value={editingBadge?.descriptionAr || ''}
                onChange={(e) => setEditingBadge(prev => prev ? { ...prev, descriptionAr: e.target.value } : null)}
                placeholder="شرح يوضح للمستخدمين سبب منح هذا التوثيق ومعايير اعتماده..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <CustomSelect
                  label="لون العلامة"
                  value={editingBadge?.color || 'blue'}
                  onChange={(val) => setEditingBadge(prev => prev ? { ...prev, color: val as any } : null)}
                  searchable={false}
                  size="sm"
                  options={BADGE_COLOR_OPTIONS.map(c => ({
                    value: c.value,
                    label: c.label,
                    colorDot: c.value === 'emerald' ? 'bg-emerald-500' : c.value === 'blue' ? 'bg-blue-500' : c.value === 'gold' ? 'bg-amber-400' : c.value === 'amber' ? 'bg-amber-500' : c.value === 'purple' ? 'bg-purple-500' : c.value === 'cyan' ? 'bg-cyan-500' : c.value === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
                  }))}
                />
              </div>

              <div>
                <CustomSelect
                  label="تصميم وهندسة الشارة"
                  value={editingBadge?.shape || 'scalloped_circle'}
                  onChange={(val) => setEditingBadge(prev => prev ? { ...prev, shape: val as any } : null)}
                  searchable={false}
                  size="sm"
                  options={BADGE_SHAPE_OPTIONS.map(s => ({
                    value: s.value,
                    label: s.label
                  }))}
                />
              </div>
            </div>

            {/* Live Visual Preview Box */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  معاينة الشارة بجانب الاسم (Icon Only):
                </span>
                <span className="text-[10px] text-slate-400">
                  تظهر مباشرة بجانب الاسم كأيقونة احترافية بدون أي نصوص مشتتة
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-black text-slate-900 dark:text-white">طبيب شها</span>
                <IconicVerifiedBadge badge={editingBadge as any} size="sm" interactive={false} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رابط صورة مخصصة أو SVG شفاف (اختياري)
              </label>
              <input
                type="url"
                value={editingBadge?.customImageUrl || ''}
                onChange={(e) => setEditingBadge(prev => prev ? { ...prev, customImageUrl: e.target.value } : null)}
                placeholder="https://... (رابط صورة شفافة PNG أو SVG)"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">الكيانات المصرح لها بهذه العلامة:</label>
              <div className="grid grid-cols-2 gap-2">
                {ENTITY_TYPE_OPTIONS.map(opt => {
                  const currentTypes = editingBadge?.targetEntityTypes || [];
                  const isChecked = currentTypes.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-bold select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const nextTypes = e.target.checked
                            ? [...currentTypes, opt.value]
                            : currentTypes.filter(t => t !== opt.value);
                          setEditingBadge(prev => prev ? { ...prev, targetEntityTypes: nextTypes } : null);
                        }}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={editingBadge?.isOfficial ?? true}
                  onChange={(e) => setEditingBadge(prev => prev ? { ...prev, isOfficial: e.target.checked } : null)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>توثيق رسمي صادر من إدارة الدليل (مكافحة التزييف)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBadgeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                حفظ العلامة
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* Modal 2: Assign Badge to Listing */}
      {isAssignModalOpen && (
        <CustomModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="منح علامة توثيق لرقم أو خدمة في شها"
          subtitle="اختر الخدمة وحدد العلامة مع تدوين السبب المعتمد في السجل"
        >
          <form onSubmit={handleAssignBadge} className="space-y-4" dir="rtl">
            {/* Listing Picker */}
            <div>
              <CustomSelect
                label="ابحث واختر الخدمة أو الرقم *"
                value={selectedListingId}
                onChange={setSelectedListingId}
                placeholder="-- اضغط لاختيار الخدمة / الرقم --"
                searchPlaceholder="ابحث بالاسم أو التخصص أو الهاتف..."
                searchable={true}
                options={listings.map(l => ({
                  value: l.id,
                  label: l.name,
                  description: `${l.phone} • ${l.titleOrSpecialty || l.address}`,
                  badge: l.isVerified ? 'موثق' : undefined,
                  badgeColor: 'bg-emerald-100 text-emerald-800'
                }))}
              />
            </div>

            {/* Badge Picker */}
            <div>
              <CustomSelect
                label="اختر علامة التوثيق *"
                value={selectedBadgeId}
                onChange={setSelectedBadgeId}
                placeholder="-- اختر العلامة المراد منحها --"
                searchable={false}
                options={verificationBadges.map(b => ({
                  value: b.id,
                  label: b.nameAr,
                  description: b.descriptionAr,
                  colorDot: b.color === 'emerald' ? 'bg-emerald-500' : b.color === 'blue' ? 'bg-blue-500' : b.color === 'amber' ? 'bg-amber-500' : b.color === 'purple' ? 'bg-purple-500' : b.color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
                }))}
              />
            </div>

            {/* Primary Designation Checkbox */}
            <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 cursor-pointer text-xs font-bold text-blue-900 dark:text-blue-300">
              <input
                type="checkbox"
                checked={isPrimaryAssign}
                onChange={(e) => setIsPrimaryAssign(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4 cursor-pointer"
              />
              <span>تعيين كعلامة توثيق أساسية تظهر بجانب الاسم كأيقونة مباشرة</span>
            </label>

            {/* Audit Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سبب التوثيق ومستند الاعتماد *</label>
              <textarea
                required
                rows={2}
                value={assignReason}
                onChange={(e) => setAssignReason(e.target.value)}
                placeholder="مثال: تم التحقق من كارنيه نقابة الأطباء ومطابقة العنوان في شها شخصياً..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                اعتماد ومنح العلامة
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* Modal 3: Revoke Badge from Listing */}
      {revokeModalData && (
        <CustomModal
          isOpen={Boolean(revokeModalData)}
          onClose={() => setRevokeModalData(null)}
          title="سحب علامة التوثيق"
          subtitle={`تأكيد سحب العلامة من ${revokeModalData.listing.name}`}
        >
          <form onSubmit={handleRevokeBadge} className="space-y-4" dir="rtl">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
                <p className="font-bold">تنبيه إداري:</p>
                <p>سحب علامة التوثيق سيؤدي إلى إزالتها فوراً من صفحة العرض وكارت الخدمة.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRevokeModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                تأكيد سحب العلامة
              </button>
            </div>
          </form>
        </CustomModal>
      )}
    </div>
  );
};
