import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Globe,
  PhoneCall,
  Layout,
  MessageSquare
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';

interface SiteTextsAdminProps {
  onSuccessToast?: (msg: string) => void;
}

export interface PlatformSiteTexts {
  siteTitle: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  footerDescription: string;
  emergencyAlertText: string;
  addServiceNotice: string;
  contactWhatsApp: string;
  contactPhone: string;
}

const DEFAULT_SITE_TEXTS: PlatformSiteTexts = {
  siteTitle: 'SHAHA ONE | شها ون',
  tagline: 'شها كلها.. أقرب وأسهل في مكان واحد',
  heroHeadline: 'دليلك الرقمي الشامل لجميع أرقام وخدمات شها',
  heroSubheadline: 'منصة موحدة تجعلك تتواصل مع الأطباء والصيادلة والحرفيين والمحلات والمؤسسات الخدمية في قرية شها بضغطة زر.',
  footerDescription: 'منصتك الرقمية المتكاملة لخدمات أهالي شها - مركز المنصورة - محافظة الدقهلية. نهدف لتسهيل الوصول للأرقام والخدمات اليومية والمساعدات المجتمعية.',
  emergencyAlertText: 'طوارئ شها: الإسعاف 123 - المطافئ 180 - نجدة الشرطة 122 - طوارئ الكهرباء 121',
  addServiceNotice: 'يمكنك طلب إضافة رقمك أو محلك التجاري أو عيادتك مجاناً وسيقوم فريق المنصة بمراجعته ونشره خلال ساعات قليلة.',
  contactWhatsApp: '01012345678',
  contactPhone: '01012345678'
};

export function getStoredSiteTexts(): PlatformSiteTexts {
  try {
    const saved = localStorage.getItem('shaha_site_texts');
    if (saved) {
      return { ...DEFAULT_SITE_TEXTS, ...JSON.parse(saved) };
    }
  } catch {}
  return DEFAULT_SITE_TEXTS;
}

export const SiteTextsAdmin: React.FC<SiteTextsAdminProps> = ({ onSuccessToast }) => {
  const { logAdminAction } = useDirectory();
  const [texts, setTexts] = useState<PlatformSiteTexts>(() => getStoredSiteTexts());
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      localStorage.setItem('shaha_site_texts', JSON.stringify(texts));
      window.dispatchEvent(new Event('shaha_site_texts_updated'));
      await logAdminAction('UPDATE_SITE_TEXTS', 'محتوى المنصة', 'تعديل وتحديث النصوص العامة والعناوين');
      setIsSaving(false);
      setIsSaved(true);
      if (onSuccessToast) onSuccessToast('تم حفظ النصوص وتحديث المنصة بنجاح!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متاكد من استعادة النصوص الافتراضية للمنصة؟')) {
      setTexts(DEFAULT_SITE_TEXTS);
      localStorage.setItem('shaha_site_texts', JSON.stringify(DEFAULT_SITE_TEXTS));
      window.dispatchEvent(new Event('shaha_site_texts_updated'));
      if (onSuccessToast) onSuccessToast('تم استعادة النصوص الافتراضية');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">إدارة المحتوى والنصوص العامة</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              التحكم الكامل في عناوين ورسائل وتنويهات موقع SHAHA ONE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>استعادة الافتراضي</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>الهوية والعناوين الرئيسية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المنصة / العنوان العلوي
              </label>
              <input
                type="text"
                value={texts.siteTitle}
                onChange={e => setTexts(prev => ({ ...prev, siteTitle: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الشعار اللفظي (Tagline)
              </label>
              <input
                type="text"
                value={texts.tagline}
                onChange={e => setTexts(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Hero Section Banner Texts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Layout className="w-4 h-4 text-emerald-500" />
            <span>نصوص الواجهة الرئيسية (Hero Section)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              العنوان الرئيسي الصريح بالصفحة الرئيسية
            </label>
            <input
              type="text"
              value={texts.heroHeadline}
              onChange={e => setTexts(prev => ({ ...prev, heroHeadline: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              الوصف والربط التوضيحي بالواجهة
            </label>
            <textarea
              rows={2}
              value={texts.heroSubheadline}
              onChange={e => setTexts(prev => ({ ...prev, heroSubheadline: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Emergency Bar & Notices */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <PhoneCall className="w-4 h-4 text-red-500" />
            <span>شريط الطوارئ ورسائل التنبيه</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              نص شريط الطوارئ المباشر بالواجهة العلوي
            </label>
            <input
              type="text"
              value={texts.emergencyAlertText}
              onChange={e => setTexts(prev => ({ ...prev, emergencyAlertText: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              تنويه نموذج إضافة الخدمة للمواطنين
            </label>
            <textarea
              rows={2}
              value={texts.addServiceNotice}
              onChange={e => setTexts(prev => ({ ...prev, addServiceNotice: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer Text */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <span>حقوق ونصوص التذييل (Footer)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              وصف المنصة في التذييل السفلي
            </label>
            <textarea
              rows={3}
              value={texts.footerDescription}
              onChange={e => setTexts(prev => ({ ...prev, footerDescription: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ التعديلات بنجاح</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كافة التغييرات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
