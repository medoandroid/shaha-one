import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowDown, Database, FileText } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { Listing } from '../../types';

interface CSVDataImportAdminProps {
  onSuccessToast: (msg: string) => void;
}

export const CSVDataImportAdmin: React.FC<CSVDataImportAdminProps> = ({ onSuccessToast }) => {
  const { categories, saveListing, listings } = useDirectory();

  const [rawCSVText, setRawCSVText] = useState('');
  const [parsedRows, setParsedRows] = useState<Partial<Listing>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'doctors');

  const handleParseCSV = () => {
    if (!rawCSVText.trim()) {
      alert('يرجى لصق بيانات CSV أو اختيار ملف');
      return;
    }

    const lines = rawCSVText.trim().split('\n');
    const items: Partial<Listing>[] = [];

    lines.forEach((line, idx) => {
      // Skip header if contains 'name' or 'اسم'
      if (idx === 0 && (line.toLowerCase().includes('name') || line.includes('اسم'))) return;

      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        const name = parts[0];
        const phone = parts[1];
        const titleOrSpecialty = parts[2] || '';
        const address = parts[3] || 'شها - مركز المنصورة';
        const workingHours = parts[4] || '';

        if (name && phone) {
          items.push({
            name,
            phone,
            titleOrSpecialty,
            address,
            workingHours,
            categoryId: selectedCategoryId,
            status: 'active',
            isVerified: true
          });
        }
      }
    });

    setParsedRows(items);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;

    setIsImporting(true);
    let successCount = 0;

    try {
      for (const row of parsedRows) {
        const ok = await saveListing(row);
        if (ok) successCount++;
      }

      onSuccessToast(`تم استيراد وحفظ ${successCount} خدمة بنجاح في قاعدة البيانات!`);
      setParsedRows([]);
      setRawCSVText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              مركز استيراد وقبول البيانات الجماعي (CSV Data Import)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            استيراد قوائم وأرقام الأطباء، الصيدليات، الحرفيين، والمحلات دفعة واحدة من ملفات Excel وCSV
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اختر القسم الافتراضي للاستيراد
            </label>
            <select
              value={selectedCategoryId}
              onChange={e => setSelectedCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              صيغة الأسطر المتوقعة (CSV)
            </label>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 dir-ltr text-right">
              الاسم, رقم الهاتف, التخصص, العنوان, ساعات العمل
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            إلصاق أسطر بيانات CSV هنا
          </label>
          <textarea
            rows={6}
            value={rawCSVText}
            onChange={e => setRawCSVText(e.target.value)}
            placeholder={`مثال:\nد. محمود صبري, 01012345678, استشاري باطنة, شارع البحر, 5:00 مساءً حتى 10:00 مساءً\nصيدلية الرحمة, 01198765432, دواء وطوارئ, الميدان الكبير, 24 ساعة`}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:border-blue-500 outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleParseCSV}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>معاينة وفحص الصفوف</span>
          </button>
        </div>
      </div>

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>معاينة البيانات المجهزة للحفظ ({parsedRows.length} سجل)</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                جاهز
              </span>
            </h4>

            <button
              onClick={handleCommitImport}
              disabled={isImporting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-4 h-4" />
              <span>{isImporting ? 'جاري الاستيراد والحفظ...' : 'حفظ واستيراد إلى قاعدة البيانات'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <th className="p-2">#</th>
                  <th className="p-2">الاسم</th>
                  <th className="p-2">رقم الهاتف</th>
                  <th className="p-2">التخصص</th>
                  <th className="p-2">العنوان</th>
                  <th className="p-2">ساعات العمل</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                    <td className="p-2 font-black text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-2 font-mono text-blue-600">{row.phone}</td>
                    <td className="p-2 text-slate-600 dark:text-slate-300">{row.titleOrSpecialty || '-'}</td>
                    <td className="p-2 text-slate-600 dark:text-slate-300">{row.address || '-'}</td>
                    <td className="p-2 text-slate-500">{row.workingHours || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
