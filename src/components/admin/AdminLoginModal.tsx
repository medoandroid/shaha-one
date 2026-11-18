// DevMeDoAnDrOiD
import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, LogIn, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (mustChangePassword?: boolean) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { adminLogin, signInWithGoogle, currentUser } = useDirectory();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password) {
      setErrorMessage('يرجى كتابة كلمة المرور الإدارية');
      return;
    }

    setIsLoading(true);
    const result = await adminLogin(password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess(result.mustChangePassword);
      onClose();
      setPassword('');
    } else {
      setErrorMessage(result.error || 'كلمة المرور غير صحيحة');
    }
  };

  const handleGoogleAdmin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.redirected) {
        // The browser is navigating to Google; the page will finish the flow on return.
        return;
      }

      if (!result.user) {
        setIsLoading(false);
        setErrorMessage('لم يكتمل تسجيل الدخول. حاول مرة أخرى.');
        return;
      }

      if (!result.isAdmin) {
        setIsLoading(false);
        setErrorMessage('تم تسجيل الدخول بحساب Google، لكن هذا الحساب لا يملك صلاحية إدارية. استخدم حساب المشرف المعتمد أو كلمة المرور.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : 'فشل تسجيل الدخول بحساب Google'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 p-6 sm:p-8 text-right" dir="rtl">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          تسجيل دخول المشرف
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          لوحة الإدارة والتحكم الشاملة في خدمات ومحتوى منصة شها ون
        </p>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              كلمة مرور المشرف:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="أدخل كلمة المرور الإدارية..."
                className="w-full px-4 py-3 pl-16 rounded-2xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute left-9 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-blue-700/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? 'جاري التحقق...' : 'دخول لوحة التحكم'}</span>
          </button>
        </form>

        {/* Google Admin Login Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold">
              أو الدخول بحساب المشرف
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleAdmin}
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <LogIn className="w-4 h-4 text-blue-600" />
          <span>
            {currentUser?.email
              ? `الدخول بالحساب الحالي (${currentUser.email})`
              : 'الدخول بواسطة Google للمشرف المعتمد'}
          </span>
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-4">
          يتم التحقق من الصلاحيات الإدارية من جهة الخادم وفق أعلى معايير الأمان وتشفير كلمات المرور
        </p>

      </div>
    </div>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
