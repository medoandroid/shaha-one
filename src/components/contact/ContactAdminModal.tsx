import React, { useState, useMemo } from 'react';
import {
  X,
  Mail,
  Send,
  MessageSquare,
  ShieldCheck,
  Crown,
  HelpCircle,
  AlertTriangle,
  FileEdit,
  Trash2,
  Clock,
  CheckCircle2,
  Phone,
  User,
  Inbox,
  Sparkles,
  Lock
} from 'lucide-react';
import { AdminMessageTopic, AdminMessage } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: AdminMessageTopic;
  defaultSubject?: string;
  onSuccessToast?: (msg: string) => void;
}

const TOPICS: { id: AdminMessageTopic; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: 'inquiry', label: 'استفسار عام', desc: 'سؤال حول إضافة رقم أو خدمات الدليل', icon: HelpCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
  { id: 'suggestion', label: 'اقتراح تطوير', desc: 'فكرة أو ميزة لتحسين الدليل وخدمة شها', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
  { id: 'complaint', label: 'شكوى أو بلاغ', desc: 'إبلاغ عن محتوى غير لائق أو مخالف', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
  { id: 'help_request', label: 'طلب مساعدة خاصة', desc: 'تواصل سري بخصوص حالة إنسانية أو تكافلية', icon: Mail, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
  { id: 'edit_delete_data', label: 'تعديل أو حذف بيانات', desc: 'طلب تعديل أو حذف رقمك أو خدمتك من الدليل', icon: FileEdit, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
  { id: 'owner_contact', label: 'التواصل مع مالك المنصة', desc: 'رسالة خاصة مباشرة لمالك ومطور المنصة السيادي', icon: Crown, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' }
];

export const ContactAdminModal: React.FC<ContactAdminModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'inquiry',
  defaultSubject = '',
  onSuccessToast
}) => {
  const { sendAdminMessage, adminMessages, currentUser } = useDirectory();

  const [activeTab, setActiveTab] = useState<'compose' | 'my_messages'>('compose');
  const [topic, setTopic] = useState<AdminMessageTopic>(defaultTopic);
  const [subject, setSubject] = useState(defaultSubject);
  const [senderName, setSenderName] = useState(currentUser?.displayName || '');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phoneNumber || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter messages sent by the user (by userId or phone or email stored in local storage)
  const mySentMessages = useMemo(() => {
    return adminMessages.filter(m => {
      if (currentUser?.uid && m.userId === currentUser.uid) return true;
      if (currentUser?.email && m.senderEmail === currentUser.email) return true;
      if (senderPhone && m.senderPhone === senderPhone) return true;
      return false;
    });
  }, [adminMessages, currentUser, senderPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderPhone.trim() || !subject.trim() || !message.trim()) {
      alert('يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    setIsSubmitting(true);
    const success = await sendAdminMessage({
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim(),
      senderEmail: senderEmail.trim() || undefined,
      userId: currentUser?.uid,
      topic,
      subject: subject.trim(),
      message: message.trim()
    });

    setIsSubmitting(false);
    if (success) {
      if (onSuccessToast) {
        onSuccessToast('تم إرسال رسالتك بنجاح إلى الإدارة! ستصلك مراجعة وتحديث بالرد قريباً.');
      }
      setMessage('');
      setSubject('');
      setActiveTab('my_messages');
    }
  };

  const getStatusBadge = (status: AdminMessage['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">جديدة</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">قيد المراجعة</span>;
      case 'replied':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">تم الرد</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">مغلقة</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                مراسلة إدارة ومالك المنصة
              </h3>
              <p className="text-xs text-slate-500">
                صندوق تواصل داخلي خاص ومشفر مع مسؤولي منصة شها ون
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Compose vs My Messages */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            إرسال رسالة جديدة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my_messages')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'my_messages'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>رسائلي السابقة وردود الإدارة</span>
            {mySentMessages.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {mySentMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Compose Form Tab */}
        {activeTab === 'compose' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Topic Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                موضوع التواصل:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOPICS.map(t => {
                  const Icon = t.icon;
                  const isSelected = topic === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTopic(t.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-bold truncate">{t.label}</span>
                      </div>
                      <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان الرسالة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="عنوان واضح وموجز لرسالتك"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Sender Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكريم <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="اسمك أو لقبك"
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف (للتواصل أو الرد) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={e => setSenderPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    dir="ltr"
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium text-right focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={e => setSenderEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium text-right focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نص الرسالة أو التفاصيل <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="اكتب رسالتك أو اقتراحك أو تفاصيل الشكوى بكل دقة..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Privacy note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>رسالتك سرية وتظهر للإدارة والمشرفين المصرح لهم فقط ولن تنشر للعامة أبداً.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-black text-xs shadow-md transition-all active:scale-98 min-h-[44px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الرسالة للإدارة</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* My Messages Tab */
          <div className="space-y-3">
            {mySentMessages.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 space-y-2">
                <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  لا توجد رسائل سابقة مرسلة من هذا الجهاز أو الحساب
                </p>
                <p className="text-[11px] text-slate-400">
                  يمكنك إرسال رسالة جديدة للاستفسار أو الاقتراح من التبويب أعلاه.
                </p>
              </div>
            ) : (
              mySentMessages.map(msg => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {msg.subject}
                    </span>
                    {getStatusBadge(msg.status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                    <span className="font-mono">{new Date(msg.createdAt).toLocaleDateString('ar-EG')}</span>
                    <span>الموضوع: {TOPICS.find(t => t.id === msg.topic)?.label || msg.topic}</span>
                  </div>

                  {/* Admin Reply Card */}
                  {msg.adminReply && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>رد إدارة الدليل:</span>
                        </span>
                        {msg.repliedAt && (
                          <span className="text-[10px] text-emerald-600 font-mono">
                            {new Date(msg.repliedAt).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                        {msg.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
