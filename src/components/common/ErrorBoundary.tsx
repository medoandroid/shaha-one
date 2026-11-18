import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  moduleName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error in module:', this.props.moduleName || 'Unknown', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = window.location.pathname;
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="my-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 shadow-lg text-center max-w-xl mx-auto space-y-4 select-none animate-fade-in"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-7 h-7 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {this.props.fallbackTitle || 'حدث خطأ مؤقت في تحميل هذا القسم'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              {this.props.fallbackMessage ||
                'نعتذر عن هذا الخطأ التقني المؤقت. تم عزل المشكلة تلقائياً لمنع تعطل باقي خدمات الدليل.'}
            </p>
          </div>

          {/* Safe Non-technical details in dev or troubleshooting */}
          {this.props.moduleName && (
            <div className="text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 inline-block">
              الوحدة المعزولة: {this.props.moduleName}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة الآن</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
