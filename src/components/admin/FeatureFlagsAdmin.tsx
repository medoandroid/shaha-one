import React, { useState } from 'react';
import { Sliders, CheckCircle2, ShieldCheck, Sparkles, MessageSquare, ThumbsUp, FileSpreadsheet, Lock } from 'lucide-react';
import { FeatureFlagsConfig } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface FeatureFlagsAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const FeatureFlagsAdmin: React.FC<FeatureFlagsAdminProps> = ({ onSuccessToast }) => {
  const { featureFlags, updateFeatureFlags, isOwner } = useDirectory();
  const [flags, setFlags] = useState<FeatureFlagsConfig>(featureFlags);

  const handleToggle = async (key: keyof FeatureFlagsConfig) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);
    const success = await updateFeatureFlags({ [key]: updated[key] });
    if (success) {
      onSuccessToast('تم تحديث إعدادات التحكم بالمميزات (Feature Flags) بنجاح!');
    }
  };

  if (!isOwner) {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-center space-y-4" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-amber-900 dark:text-amber-200">
            صلاحية حصرية للمالك السيادي
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
            تعديل مفاتيح التشغيل والمميزات الحصرية مقتصر فقط على حساب المالك السيادي للمنصة.
          </p>
        </div>
      </div>
    );
  }

  const items: { key: keyof FeatureFlagsConfig; label: string; desc: string }[] = [
    { key: 'enableClaims', label: 'تفعيل نظام طلب استلام وتوثيق الملكية (Claim Listing)', desc: 'السماح لأصحاب المحلات والأطباء بطلب إدارة بروفايلاتهم' },
    { key: 'enableReviews', label: 'تفعيل نظام تقييم وآراء الخدمات', desc: 'تمكين المواطنين من كتابة تقييمات مراجعة إدارياً' },
    { key: 'enableCommunityVoting', label: 'تفعيل نظام اقتراحات وتصويت الأهالي', desc: 'تمكين المواطنين من اقتراح أقسام وتحديد الأولويات' },
    { key: 'enableDataQualityScanner', label: 'تفعيل محرك جودة البيانات واكتشاف التكرار', desc: 'فحص جودة الملفات تلقائياً واكتشاف المكرر' },
    { key: 'enableDirectMessaging', label: 'تفعيل مراسلات وصندوق رسائل المواطنين', desc: 'استقبال الرسائل السرية والاستفسارات الخاصة بالمالك والإدارة' },
    { key: 'enableSmartNotifications', label: 'تفعيل الإشعارات الذكية', desc: 'تنبيهات فورية للمستخدمين والمشرفين بالطلبات والردود' },
    { key: 'enableScheduledPublishing', label: 'تفعيل النشر المجدول والمنتهي', desc: 'جدولة تواريخ بدء وانتهاء عرض الخدمات والإعلانات' },
    { key: 'enableCSVImport', label: 'تفعيل مركز الاستيراد الجماعي (CSV Import)', desc: 'استيراد القوائم دفعة واحدة من ملفات Excel وCSV' }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              إدارة خصائص ومفتاح تشغيل المميزات (Feature Flags)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            التحكم الفوري في تفعيل وتأجيل ميزات منصة شها ون دون الحاجة للتعديل الكودي
          </p>
        </div>
      </div>

      {/* Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => {
          const isEnabled = Boolean(flags[item.key]);
          return (
            <div
              key={item.key}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.label}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(item.key)}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  isEnabled ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    isEnabled ? '-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
