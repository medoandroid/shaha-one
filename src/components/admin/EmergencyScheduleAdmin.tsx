import React, { useState } from 'react';
import { useDirectory } from '../../context/DirectoryContext';
import { EmergencyHospitalSchedule, DayScheduleEntry } from '../../types';
import {
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  PhoneCall,
  Plus,
  Trash2,
  Building2,
  History,
  AlertCircle
} from 'lucide-react';

export const EmergencyScheduleAdmin: React.FC = () => {
  const { mansouraSchedule, saveMansouraSchedule } = useDirectory();

  const currentData: EmergencyHospitalSchedule = (mansouraSchedule && mansouraSchedule.length > 0)
    ? mansouraSchedule[0]
    : {
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
      };

  const [formData, setFormData] = useState<EmergencyHospitalSchedule>(currentData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleDayChange = (index: number, field: keyof DayScheduleEntry, value: string) => {
    setFormData(prev => {
      const updatedDays = [...prev.days];
      updatedDays[index] = { ...updatedDays[index], [field]: value };
      return { ...prev, days: updatedDays };
    });
  };

  const handleImportantPhoneChange = (index: number, field: 'label' | 'phone', value: string) => {
    setFormData(prev => {
      const updated = [...prev.importantPhones];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, importantPhones: updated };
    });
  };

  const handleAddPhone = () => {
    setFormData(prev => ({
      ...prev,
      importantPhones: [...prev.importantPhones, { label: 'جهة جديدة', phone: '' }]
    }));
  };

  const handleRemovePhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      importantPhones: prev.importantPhones.filter((_, i) => i !== index)
    }));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await saveMansouraSchedule(formData);
    setSaving(false);

    if (success) {
      setMsg('تم حفظ جدول طوارئ مستشفيات المنصورة وتحديثه فوراً!');
      setTimeout(() => setMsg(null), 3500);
    } else {
      alert('حدث خطأ أثناء حفظ الجدول.');
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 dir-rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>إدارة جدول طوارئ المنصورة</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>جدول استقبال الطوارئ الأسبوعي</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تعديل المستشفى المُستقبِل لكل يوم وأرقام هاتف الاستقبال المباشرة للمواطنين.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري التحديث...' : 'حفظ ونشر الجدول'}</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{msg}</span>
        </div>
      )}

      {/* Audit & Timestamp Info */}
      {formData.lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <History className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            آخر تحديث إداري: <strong>{new Date(formData.lastUpdated).toLocaleString('ar-EG')}</strong>
            {formData.updatedBy && ` بواسطة (${formData.updatedBy})`}
          </span>
        </div>
      )}

      {/* Days Table Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>تحديد مستشفى اليوم والأرقام (السبت - الجمعة)</span>
        </h3>

        <div className="space-y-3">
          {formData.days.map((day, idx) => (
            <div
              key={day.dayKey}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              {/* Day Label */}
              <div className="md:col-span-2 font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{day.dayName}</span>
              </div>

              {/* Hospital Name Input */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  اسم المستشفى
                </label>
                <input
                  type="text"
                  required
                  value={day.hospitalName || ''}
                  onChange={e => handleDayChange(idx, 'hospitalName', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              {/* Phone Input */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  رقم الهاتف المباشر
                </label>
                <input
                  type="text"
                  required
                  value={day.phone || ''}
                  onChange={e => handleDayChange(idx, 'phone', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 dir-ltr text-right"
                />
              </div>

              {/* Notes Input */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  ملاحظات أو موقع الاستقبال
                </label>
                <input
                  type="text"
                  value={day.notes || ''}
                  onChange={e => handleDayChange(idx, 'notes', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Emergency Phone Numbers Admin */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            <span>أرقام الطوارئ المباشرة الهامة بالجدول</span>
          </h3>
          <button
            type="button"
            onClick={handleAddPhone}
            className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة جهة طوارئ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formData.importantPhones.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.label || ''}
                  onChange={e => handleImportantPhoneChange(idx, 'label', e.target.value)}
                  placeholder="اسم الجهة"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhone(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg shrink-0"
                  title="حذف الرقم"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                value={item.phone || ''}
                onChange={e => handleImportantPhoneChange(idx, 'phone', e.target.value)}
                placeholder="رقم الهاتف (مثل: 0502222854)"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold text-rose-600 dark:text-rose-400 dir-ltr text-right"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
