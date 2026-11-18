import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  FileEdit,
  Crown,
  Trash2,
  Send,
  Eye,
  Filter,
  User,
  ShieldCheck
} from 'lucide-react';
import { AdminMessage, AdminMessageTopic, AdminMessageStatus } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';

interface AdminMessagesTabProps {
  onSuccessToast: (msg: string) => void;
}

const TOPIC_LABELS: Record<AdminMessageTopic, { label: string; icon: React.ElementType; color: string }> = {
  inquiry: { label: 'استفسار عام', icon: HelpCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
  suggestion: { label: 'اقتراح تطوير', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
  complaint: { label: 'شكوى أو بلاغ', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
  help_request: { label: 'طلب مساعدة', icon: Mail, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
  edit_delete_data: { label: 'تعديل/حذف بيانات', icon: FileEdit, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
  owner_contact: { label: 'رسالة خاصة للمالك', icon: Crown, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' }
};

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({ onSuccessToast }) => {
  const {
    adminMessages,
    replyAdminMessage,
    updateAdminMessageStatus,
    deleteAdminMessage,
    markAdminMessageAsRead,
    isOwner
  } = useDirectory();

  const [selectedTopic, setSelectedTopic] = useState<'all' | AdminMessageTopic>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | AdminMessageStatus>('all');
  const [activeMessage, setActiveMessage] = useState<AdminMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return adminMessages.filter(msg => {
      if (selectedTopic !== 'all' && msg.topic !== selectedTopic) return false;
      if (selectedStatus !== 'all' && msg.status !== selectedStatus) return false;
      return true;
    });
  }, [adminMessages, selectedTopic, selectedStatus]);

  const newCount = adminMessages.filter(m => m.status === 'new').length;

  const handleOpenDetail = (msg: AdminMessage) => {
    setActiveMessage(msg);
    setReplyText(msg.adminReply || '');
    if (!msg.isRead) {
      markAdminMessageAsRead(msg.id);
    }
  };

  const handleSendReply = async () => {
    if (!activeMessage || !replyText.trim()) return;
    setIsSubmittingReply(true);
    await replyAdminMessage(activeMessage.id, replyText.trim(), 'replied');
    setIsSubmittingReply(false);
    onSuccessToast('تم إرسال الرد وتحديث حالة الرسالة إلى: تم الرد');
    setActiveMessage(prev => prev ? { ...prev, adminReply: replyText.trim(), status: 'replied' } : null);
  };

  const handleStatusChange = async (status: AdminMessageStatus) => {
    if (!activeMessage) return;
    await updateAdminMessageStatus(activeMessage.id, status);
    onSuccessToast(`تم تغيير الحالة إلى: ${status}`);
    setActiveMessage(prev => prev ? { ...prev, status } : null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة نهائياً؟')) {
      await deleteAdminMessage(id);
      onSuccessToast('تم حذف الرسالة بنجاح');
      if (activeMessage?.id === id) {
        setActiveMessage(null);
      }
    }
  };

  const getStatusPill = (status: AdminMessageStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">جديدة</span>;
      case 'under_review':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">قيد المراجعة</span>;
      case 'replied':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">تم الرد</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold">مغلقة</span>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Inbox className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              صندوق الوارد ورسائل المواطنين ({adminMessages.length})
            </h3>
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold animate-pulse">
                {newCount} جديدة
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            متابعة الاستفسارات، الشكاوى، طلبات التعديل، والمراسلات الخاصة بالمالك والمشرفين
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            جميع الحالات ({adminMessages.length})
          </button>
          <button
            onClick={() => setSelectedStatus('new')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            جديدة ({adminMessages.filter(m => m.status === 'new').length})
          </button>
          <button
            onClick={() => setSelectedStatus('under_review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'under_review'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            قيد المراجعة ({adminMessages.filter(m => m.status === 'under_review').length})
          </button>
          <button
            onClick={() => setSelectedStatus('replied')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'replied'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            تم الرد ({adminMessages.filter(m => m.status === 'replied').length})
          </button>
          <button
            onClick={() => setSelectedStatus('closed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'closed'
                ? 'bg-slate-700 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            مغلقة ({adminMessages.filter(m => m.status === 'closed').length})
          </button>
        </div>
      </div>

      {/* Main Grid: Messages List on Right, Details on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Messages List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredMessages.map(msg => {
            const topicInfo = TOPIC_LABELS[msg.topic] || TOPIC_LABELS.inquiry;
            const TopicIcon = topicInfo.icon;
            const isSelected = activeMessage?.id === msg.id;

            return (
              <div
                key={msg.id}
                onClick={() => handleOpenDetail(msg)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-md'
                    : msg.status === 'new'
                    ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${topicInfo.color}`}>
                      <TopicIcon className="w-3.5 h-3.5" />
                      <span>{topicInfo.label}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                      {getStatusPill(msg.status)}
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                    {msg.subject}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{msg.senderName}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 dir-ltr">
                    {msg.senderPhone}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-xs font-bold text-slate-500">
                لا توجد رسائل مطابقة لهذا الفلتر حالياً.
              </p>
            </div>
          )}
        </div>

        {/* Message Details & Reply Panel */}
        <div className="lg:col-span-6">
          {activeMessage ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 sticky top-20">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">كود: {activeMessage.id}</span>
                    {getStatusPill(activeMessage.status)}
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {activeMessage.subject}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(activeMessage.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="حذف الرسالة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sender Info Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">المرسل:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{activeMessage.senderName}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">الهاتف:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 dir-ltr inline-block">
                    {activeMessage.senderPhone}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeMessage.senderPhone}`}
                    className="p-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold flex items-center gap-1"
                    title="اتصال هاتفي"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال</span>
                  </a>
                  <a
                    href={`https://wa.me/2${activeMessage.senderPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold flex items-center gap-1"
                    title="محادثة واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400">نص الرسالة:</span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {activeMessage.message}
                </div>
              </div>

              {/* Status Switcher Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400">تحديث حالة الرسالة:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('under_review')}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                  >
                    قيد المراجعة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('replied')}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    تم الرد
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('closed')}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    إغلاق الرسالة
                  </button>
                </div>
              </div>

              {/* Reply Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  رد الإدارة (سيظهر للمستخدم في تبويب رسائله):
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="اكتب رد إدارة الدليل بوضوح ومهنية..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:border-indigo-500 outline-none resize-none"
                />

                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingReply ? 'جاري الحفظ...' : 'إرسال الرد وتحديث الحالة'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
                حدد رسالة من القائمة لمعاينة تفاصيلها والرد عليها
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                يمكنك الاتصال هاتفياً بالمرسل، مراسلته عبر واتساب، أو كتابة رد إداري رسمي يظهر له في حسابه.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
