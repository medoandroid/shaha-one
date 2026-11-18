import React, { useState, useMemo } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { safeCopyText } from '../../utils/clipboard';
import { escapeHtml } from '../../lib/security';
import {
  Calendar,
  PhoneCall,
  Clock,
  Building2,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Copy,
  Check
} from 'lucide-react';

interface MansouraEmergencyScheduleProps {
  compactTeaser?: boolean;
  onOpenFullView?: () => void;
}

export const MansouraEmergencySchedule: React.FC<MansouraEmergencyScheduleProps> = ({
  compactTeaser = false,
  onOpenFullView
}) => {
  const { mansouraSchedule } = useDirectory();
  const [isExpanded, setIsExpanded] = useState(!compactTeaser);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // 1. Calculate Egypt / Cairo current day
  const { cairoDayKey, cairoDayName, cairoDateFormatted } = useMemo(() => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Cairo',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const formatter = new Intl.DateTimeFormat('ar-EG', options);
      const parts = formatter.formatToParts(now);
      
      const weekdayPart = parts.find(p => p.type === 'weekday')?.value || '';
      
      // Determine day key from english or standard day index
      const cairoDate = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
      const dayIndex = cairoDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dayKeys: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[] = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ];

      return {
        cairoDayKey: dayKeys[dayIndex],
        cairoDayName: weekdayPart || 'اليوم',
        cairoDateFormatted: formatter.format(now)
      };
    } catch {
      return {
        cairoDayKey: 'saturday',
        cairoDayName: 'اليوم',
        cairoDateFormatted: ''
      };
    }
  }, []);

  // 2. Schedule list from context or default
  const scheduleData = (mansouraSchedule && mansouraSchedule.length > 0)
    ? mansouraSchedule
    : [
        {
          id: 'mansoura_weekly',
          title: 'جدول استقبال الطوارئ في مستشفيات المنصورة',
          days: [
            { dayKey: 'saturday', dayName: 'السبت', hospitalName: 'مستشفى المنصورة الدولي', phone: '0502222854', notes: 'قسم الاستقبال والدخلة الرئيسية' },
            { dayKey: 'sunday', dayName: 'الأحد', hospitalName: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472', notes: 'شارع جيهان - العيادات المجمعة' },
            { dayKey: 'monday', dayName: 'الاثنين', hospitalName: 'مستشفى المنصورة التخصصي', phone: '0502222854', notes: 'العام المباشر - قناة السويس' },
            { dayKey: 'tuesday', dayName: 'الثلاثاء', hospitalName: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472', notes: 'استقبال الحالات الحرجة' },
            { dayKey: 'wednesday', dayName: 'الأربعاء', hospitalName: 'مستشفى المنصورة الدولي', phone: '0502222854', notes: 'استقبال الجراحة والباطنة' },
            { dayKey: 'thursday', dayName: 'الخميس', hospitalName: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472', notes: 'استقبال طوارئ الجامعة' },
            { dayKey: 'friday', dayName: 'الجمعة', hospitalName: 'مستشفى المنصورة التخصصي', phone: '0502222854', notes: 'طوارئ عاجلة طوال 24 ساعة' }
          ],
          importantPhones: [
            { label: 'مستشفى المنصورة الدولي', phone: '0502222854' },
            { label: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472' },
            { label: 'الإسعاف الوطني', phone: '123' }
          ],
          isActive: true
        }
      ];

  const currentSchedule = scheduleData[0];
  const todayEntry = currentSchedule.days.find(d => d.dayKey === cairoDayKey) || currentSchedule.days[0];

  const copyToClipboard = async (text: string) => {
    await safeCopyText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const handleShare = async () => {
    const text = `🚨 جدول استقبال الطوارئ بمستشفيات المنصورة اليوم (${todayEntry.dayName}):\n🏥 ${todayEntry.hospitalName}\n📞 للاتصال المباشر: ${todayEntry.phone}\n🚑 الإسعاف: 123\nعبر دليل شها ون SHAHA ONE`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'جدول طوارئ مستشفيات المنصورة - شها ون',
          text,
          url: window.location.href
        });
        return;
      } catch {}
    }
    await safeCopyText(text);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  const handlePrint = () => {
    const today = currentSchedule.days.find((d: any) => d.dayKey === cairoDayKey) || currentSchedule.days[0];

    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>جدول طوارئ مستشفيات المنصورة - شها ون</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    body {
      font-family: 'Cairo', system-ui, sans-serif;
      direction: rtl;
      text-align: right;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 900;
      color: #0284c7;
      margin: 0 0 4px 0;
    }
    .header h2 {
      font-size: 16px;
      font-weight: 800;
      color: #e11d48;
      margin: 4px 0;
    }
    .header p {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .today-box {
      background-color: #f0fdf4;
      border: 2px solid #22c55e;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .today-box h3 {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #15803d;
    }
    .today-box p {
      margin: 0;
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 14px;
      font-size: 13px;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 800;
      color: #1e293b;
    }
    tr.today-row {
      background-color: #ecfdf5;
      font-weight: bold;
    }
    .phones-header {
      font-weight: 800;
      font-size: 13px;
      margin-bottom: 10px;
      color: #e11d48;
    }
    .phones-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .phone-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      background-color: #f8fafc;
    }
    .phone-card strong {
      display: block;
      font-size: 12px;
      color: #334155;
    }
    .phone-card span {
      font-size: 14px;
      font-weight: 800;
      color: #e11d48;
      direction: ltr;
      display: inline-block;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 24px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SHAHA ONE | شها ون</h1>
    <h2>جدول استقبال الطوارئ في مستشفيات المنصورة</h2>
    <p>تاريخ المستند: ${escapeHtml(cairoDateFormatted)} (توقيت مصر)</p>
  </div>

  <div class="today-box">
    <h3>المستشفى المُستقبِل اليوم (${escapeHtml(today.dayName)}):</h3>
    <p>${escapeHtml(today.hospitalName)} &mdash; هاتف الطوارئ: <span style="direction: ltr; display: inline-block;">${escapeHtml(today.phone)}</span> (${escapeHtml(today.notes || 'استقبال عاجل')})</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>اليوم</th>
        <th>المستشفى المستقبل للحالات</th>
        <th>رقم هاتف الطوارئ</th>
        <th>ملاحظات والتفاصيل</th>
      </tr>
    </thead>
    <tbody>
      ${currentSchedule.days.map((d: any) => `
        <tr class="${d.dayKey === cairoDayKey ? 'today-row' : ''}">
          <td><strong>${escapeHtml(d.dayName)}</strong> ${d.dayKey === cairoDayKey ? '(اليوم)' : ''}</td>
          <td><strong>${escapeHtml(d.hospitalName)}</strong></td>
          <td style="direction: ltr; text-align: right;"><strong>${escapeHtml(d.phone)}</strong></td>
          <td>${escapeHtml(d.notes || 'استقبال عاجل طوال اليوم')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="phones-header">
    أرقام الطوارئ السريعة بالمنصورة وشها:
  </div>
  <div class="phones-grid">
    ${currentSchedule.importantPhones.map((p: any) => `
      <div class="phone-card">
        <strong>${escapeHtml(p.label)}</strong>
        <span>${escapeHtml(p.phone)}</span>
      </div>
    `).join('')}
  </div>

  <div class="footer">
    تم طباعة هذا المستند المعتمد من دليل شها ون SHAHA ONE &mdash; قرية شها، مركز المنصورة، محافظة الدقهلية
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

    try {
      const printWindow = window.open('', '_blank', 'width=850,height=900');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        return;
      }
    } catch {
      // Ignore popup error and fallback
    }

    // Direct window.print() fallback
    window.print();
  };

  // Compact Teaser View for Homepage
  if (compactTeaser) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-4 md:p-5 shadow-lg border border-rose-500/30 dir-rtl my-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Today Badge & Info */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                استقبال الطوارئ اليوم ({cairoDayName})
              </span>
              <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                مصر {cairoDateFormatted.split(' ').slice(0, 3).join(' ')}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-black text-amber-300 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{todayEntry.hospitalName}</span>
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>أرقام الطوارئ اليوم:</span>
              <a
                href={`tel:${todayEntry.phone}`}
                className="font-mono font-bold text-emerald-400 hover:text-emerald-300 text-sm bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>{todayEntry.phone}</span>
              </a>
              <a
                href="tel:123"
                className="font-mono font-bold text-rose-400 hover:text-rose-300 text-sm bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>الإسعاف: 123</span>
              </a>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenFullView || (() => setIsExpanded(prev => !prev))}
              className="flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>جدول الأسبوع بالكامل</span>
            </button>
          </div>
        </div>

        {/* Expandable Schedule Overlay */}
        {isExpanded && !onOpenFullView && (
          <div className="mt-4 pt-4 border-t border-rose-900/60">
            <FullScheduleGrid
              currentSchedule={currentSchedule}
              cairoDayKey={cairoDayKey}
              copyToClipboard={copyToClipboard}
              copiedPhone={copiedPhone}
              handleShare={handleShare}
              shareSuccess={shareSuccess}
              handlePrint={handlePrint}
            />
          </div>
        )}
      </div>
    );
  }

  // Full Expanded View Component
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-xl border border-slate-200 dark:border-slate-800 dir-rtl my-6 print:border-none print:shadow-none print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span>خدمات الصحة والطوارئ - المنصورة وشها</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>جدول استقبال الطوارئ في مستشفيات المنصورة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            الجدول الأسبوعي المعتمد لتبادل أيام الاستقبال بالمستشفيات الرئيسية – يتم التحديث تلقائياً بحسب التوقيت المحلي للمملكة ومصر.
          </p>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2 shrink-0 print:hidden">
          <button
            onClick={handleShare}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {shareSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-blue-500" />}
            <span>{shareSuccess ? 'تم النسخ!' : 'مشاركة الجدول'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-500" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      <FullScheduleGrid
        currentSchedule={currentSchedule}
        cairoDayKey={cairoDayKey}
        copyToClipboard={copyToClipboard}
        copiedPhone={copiedPhone}
        handleShare={handleShare}
        shareSuccess={shareSuccess}
        handlePrint={handlePrint}
      />
    </div>
  );
};

// Internal Sub-component for Grid
interface FullScheduleGridProps {
  currentSchedule: any;
  cairoDayKey: string;
  copyToClipboard: (p: string) => void;
  copiedPhone: string | null;
  handleShare: () => void;
  shareSuccess: boolean;
  handlePrint: () => void;
}

const FullScheduleGrid: React.FC<FullScheduleGridProps> = ({
  currentSchedule,
  cairoDayKey,
  copyToClipboard,
  copiedPhone,
  handlePrint
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Today Active Card */}
      {(() => {
        const today = currentSchedule.days.find((d: any) => d.dayKey === cairoDayKey) || currentSchedule.days[0];
        return (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 md:p-5 shadow-md border-2 border-emerald-500/60 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>المستشفى المُستقبِل اليوم ({today.dayName})</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-amber-300 mt-1">
                  {today.hospitalName}
                </h3>
                {today.notes && (
                  <p className="text-xs text-slate-300 font-medium">{today.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${today.phone}`}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>اتصال بالفور: {today.phone}</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. Days Weekly Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">اليوم</th>
              <th className="py-3 px-4">المستشفى المستقبل للحالات</th>
              <th className="py-3 px-4">رقم هاتف الطوارئ</th>
              <th className="py-3 px-4">ملاحظات والتفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {currentSchedule.days.map((day: any) => {
              const isToday = day.dayKey === cairoDayKey;
              return (
                <tr
                  key={day.dayKey}
                  className={`transition-colors ${
                    isToday
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 font-bold text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {/* Day Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{day.dayName}</span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold animate-pulse">
                          اليوم
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Hospital Name */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                    {day.hospitalName}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${day.phone}`}
                        className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-sm dir-ltr flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{day.phone}</span>
                      </a>
                      <button
                        onClick={() => copyToClipboard(day.phone)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors print:hidden"
                        title="نسخ الرقم"
                      >
                        {copiedPhone === day.phone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {day.notes || 'استقبال عاجل طوال اليوم'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Fast Dial Emergency Numbers Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-500" />
          <span>أرقام الطوارئ المباشرة الهامة بالمنصورة:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {currentSchedule.importantPhones.map((item: any, idx: number) => (
            <a
              key={idx}
              href={`tel:${item.phone}`}
              className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 transition-all shadow-sm group"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {item.label}
                </p>
                <p className="text-sm font-mono font-black text-rose-600 dark:text-rose-400 dir-ltr text-right group-hover:underline">
                  {item.phone}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Print & Export Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 print:hidden">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          يمكنك طباعة النسخة المعالجة معتمدة للاستخدام الورقي بأمان.
        </span>
        <button
          onClick={handlePrint}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>طباعة الجدول المعتمد</span>
        </button>
      </div>
    </div>
  );
};
