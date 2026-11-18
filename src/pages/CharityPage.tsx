import React, { useState } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NativeTopBar } from '../components/common/NativeTopBar';
import { CharitySection } from '../components/charity/CharitySection';
import { HumanitarianAidFeed } from '../components/charity/HumanitarianAidFeed';
import { DonorsDirectory } from '../components/charity/DonorsDirectory';
import { ShahaFacebookPages } from '../components/community/ShahaFacebookPages';
import { ContactAdminModal } from '../components/contact/ContactAdminModal';
import { HorizontalScrollStrip } from '../components/common/HorizontalScrollStrip';
import { Heart, Building, ShieldCheck, HeartHandshake, UserCheck, Globe, MessageSquare } from 'lucide-react';

interface CharityPageProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CharityPage: React.FC<CharityPageProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'humanitarian' | 'donors' | 'shaha_pages' | 'organizations'>('humanitarian');
  const [isContactAdminOpen, setIsContactAdminOpen] = useState(false);
  const [contactAdminSubject, setContactAdminSubject] = useState('');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'مبادرات تواصل الخيرية ودليل المتبرعين - شها',
        text: 'بوابة التكافل الاجتماعي والحالات الإنسانية ودليل المتبرعين وصفحات شها:',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('تم نسخ رابط صفحة المبادرات الخيرية لمشاركته!', 'success');
    }
  };

  const handleOpenContactAdminWithSubject = (subject?: string) => {
    setContactAdminSubject(subject || '');
    setIsContactAdminOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. Native Top Bar */}
      <NativeTopBar
        title="تواصل الخيرية والتكافل الإنساني"
        subtitle="بوابة التكافل، حالات المساعدة، دليل المتبرعين، وصفحات شها الرسمية"
        backLabel="الرئيسية"
        backRoute={{ page: 'home' }}
        category={{ id: 'charity', icon: 'HeartHandshake', nameAr: 'تواصل الخيرية' }}
        badgeText="تكافل مجتمعي موثق"
        badgeVariant="emerald"
        onShare={handleShare}
      />

      {/* 2. Breadcrumbs & Top Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'مبادرات تواصل الخيرية والمساعدات' }]} />

        <button
          type="button"
          onClick={() => handleOpenContactAdminWithSubject('استفسار أو طلب مساعدة من صفحة تواصل الخيرية')}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>مراسلة إدارة الدليل سراً</span>
        </button>
      </div>

      <HorizontalScrollStrip className="max-w-2xl mx-auto" contentClassName="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80" ariaLabel="أقسام تواصل الخيرية">
        <button
          onClick={() => setActiveTab('humanitarian')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'humanitarian'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
          <span>حالات المساعدة</span>
        </button>

        <button
          onClick={() => setActiveTab('donors')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'donors'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>دليل المتبرعين</span>
        </button>

        <button
          onClick={() => setActiveTab('shaha_pages')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'shaha_pages'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-500 shrink-0" />
          <span>صفحات شها فيسبوك</span>
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'organizations'
              ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 shrink-0" />
          <span>صناديق التكافل</span>
        </button>
      </HorizontalScrollStrip>

      {/* 4. Tab Content */}
      {activeTab === 'humanitarian' && (
        <HumanitarianAidFeed onShowToast={onShowToast} />
      )}

      {activeTab === 'donors' && (
        <DonorsDirectory
          onShowToast={onShowToast}
          onOpenContactAdmin={handleOpenContactAdminWithSubject}
        />
      )}

      {activeTab === 'shaha_pages' && (
        <ShahaFacebookPages onShowToast={onShowToast} />
      )}

      {activeTab === 'organizations' && (
        <CharitySection />
      )}

      {/* Contact Admin Modal */}
      <ContactAdminModal
        isOpen={isContactAdminOpen}
        onClose={() => setIsContactAdminOpen(false)}
        defaultTopic="help_request"
        defaultSubject={contactAdminSubject}
        onSuccessToast={onShowToast}
      />
    </div>
  );
};
