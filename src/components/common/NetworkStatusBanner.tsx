import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { offlineQueue } from '../../lib/offlineQueue';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(() => offlineQueue.getPendingCount());

  useEffect(() => {
    return offlineQueue.subscribe((q) => {
      setPendingCount(q.filter(item => item.status === 'pending' || item.status === 'processing').length);
    });
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      void offlineQueue.processQueue();
      const timer = setTimeout(() => setShowRestoredNotice(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestoredNotice) return null;

  if (showRestoredNotice) {
    return (
      <div
        className="fixed top-18 sm:top-22 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-3 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-slide-down border border-emerald-400"
        dir="rtl"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Wifi className="w-4 h-4 text-white" />
        </div>
        <div className="text-xs font-bold flex-1">
          تم استعادة الاتصال بالإنترنت بنجاح. البيانات الآن محدثة وفورية.
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-3.5 rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-amber-500/30 flex items-center justify-between gap-3 animate-slide-up"
      dir="rtl"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-black text-white">أنت تعمل بدون اتصال</h4>
          <p className="text-[11px] text-slate-300 truncate">
            {pendingCount > 0
              ? `لديك ${pendingCount} عملية محفوظة ستتم مزامنتها تلقائياً عند عودة الشبكة.`
              : 'يتم عرض أرقام وخدمات شها المحفوظة في وضع عدم الاتصال (Offline Mode).'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold shrink-0 transition-colors cursor-pointer"
      >
        إعادة المحاولة
      </button>
    </div>
  );
};
