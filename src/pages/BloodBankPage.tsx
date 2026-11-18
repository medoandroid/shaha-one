import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NativeTopBar } from '../components/common/NativeTopBar';
import { BloodBankSection } from '../components/blood/BloodBankSection';
import { Droplet } from 'lucide-react';

interface BloodBankPageProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BloodBankPage: React.FC<BloodBankPageProps> = ({ onShowToast }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'بنك الدم التطوعي بقرية شها',
        text: 'سجل متبرعي بنك الدم لإنقاذ الحالات الحرجة والطارئة في شها:',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('تم نسخ رابط صفحة بنك الدم لمشاركته!', 'success');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Native Top Bar with Back Button */}
      <NativeTopBar
        title="بنك متبرعي الدم بشها"
        subtitle="شبكة تطوعية موثقة لإنقاذ الحالات الطارئة والعمليات الحرجة"
        backLabel="الرئيسية"
        backRoute={{ page: 'home' }}
        category={{ id: 'blood_bank', icon: 'Droplet', nameAr: 'بنك الدم' }}
        badgeText="طوارئ إنسانية"
        badgeVariant="rose"
        onShare={handleShare}
      />

      {/* 2. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'بنك الدم التطوعي بشها' }]} />

      {/* 3. Main Blood Bank Platform Component */}
      <BloodBankSection onSuccessToast={(msg) => onShowToast(msg, 'success')} />
    </div>
  );
};
