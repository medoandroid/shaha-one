// DevMeDoAnDrOiD
import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  PlusCircle,
  Droplet,
  Heart,
  Moon,
  Sun,
  ShieldCheck,
  LogIn,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronLeft,
  Home,
  LayoutGrid,
  Megaphone,
  Smartphone,
  Search,
  Newspaper,
  Loader2,
  type LucideIcon
} from 'lucide-react';
import { useDirectory } from '../../context/DirectoryContext';
import { BrandMark } from '../common/BrandMark';
import { HorizontalScrollStrip } from '../common/HorizontalScrollStrip';
import { notify } from '../../lib/notify';

interface HeaderProps {
  onOpenAddService: () => void;
  onOpenAdminLogin: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenSpotlightSearch?: () => void;
  activeTab: string;
}

interface NavItem {
  tab: string;
  label: string;
  icon: LucideIcon;
  accent: string;
}

const PRIMARY_NAV: NavItem[] = [
  { tab: 'home', label: 'الرئيسية', icon: Home, accent: 'text-slate-700 dark:text-slate-200' },
  { tab: 'categories', label: 'أقسام الخدمات', icon: LayoutGrid, accent: 'text-slate-700 dark:text-slate-200' },
  { tab: 'news', label: 'أخبار شها', icon: Newspaper, accent: 'text-emerald-700 dark:text-emerald-300' },
  { tab: 'emergency', label: 'طوارئ شها', icon: PhoneCall, accent: 'text-red-700 dark:text-red-300' },
  { tab: 'blood', label: 'بنك الدم', icon: Droplet, accent: 'text-rose-700 dark:text-rose-300' },
  { tab: 'charity', label: 'تواصل الخيرية', icon: Heart, accent: 'text-emerald-700 dark:text-emerald-300' },
  { tab: 'ads', label: 'عروض شها', icon: Megaphone, accent: 'text-amber-700 dark:text-amber-300' }
];

export const Header: React.FC<HeaderProps> = ({
  onOpenAddService,
  onOpenAdminLogin,
  onNavigateTab,
  onOpenSpotlightSearch,
  activeTab
}) => {
  const {
    currentUser,
    adminSession,
    isAdmin,
    theme,
    toggleTheme,
    signInWithGoogle,
    signOut,
    adminLogout,
    serviceRequests,
    isInstallable,
    installApp,
    categories
  } = useDirectory();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleNav = (tab: string) => {
    onNavigateTab(tab);
    setSidebarOpen(false);
  };

  const handleOpenFavorites = () => {
    setSidebarOpen(false);
    onNavigateTab('home');
    window.setTimeout(() => {
      document.getElementById('favorites-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  };

  const pendingRequestsCount = serviceRequests.filter(r => r.status === 'pending').length;

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setSidebarOpen(false);
    setGoogleLoading(true);
    let redirected = false;
    try {
      const result = await signInWithGoogle();
      if (result.redirected) {
        redirected = true;
        notify('جارٍ تحويلك إلى صفحة تسجيل الدخول من Google…', 'info');
        return;
      }
      if (result.user) {
        notify(`أهلاً ${result.user.displayName || 'بك'}! تم تسجيل الدخول بنجاح.`, 'success');
      }
    } catch (err) {
      notify(
        err instanceof Error && err.message
          ? err.message
          : 'تعذر إكمال تسجيل الدخول. تحقق من اتصالك وحاول مرة أخرى.',
        'error'
      );
    } finally {
      if (!redirected) setGoogleLoading(false);
    }
  };

  // Lock background scrolling and support Escape while the drawer is open.
  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  const navButtonClass = (active: boolean, accent: string) =>
    `group inline-flex min-h-[40px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-[13px] font-bold transition-all duration-200 xl:gap-2 xl:px-3.5 xl:text-sm cursor-pointer ${
      active
        ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-950/20 dark:bg-emerald-600'
        : `${accent} hover:bg-emerald-50/80 hover:text-emerald-800 dark:hover:bg-slate-800 dark:hover:text-emerald-300`
    }`;

  const drawerItemClass = (active: boolean, activeClass: string, idleClass: string) =>
    `flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-right text-[15px] font-bold transition-colors ${
      active ? activeClass : idleClass
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-[#FAF8F3]/95 shadow-xs backdrop-blur-xl transition-colors dark:border-slate-800/85 dark:bg-[#0B0F17]/95">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#0F766E] via-emerald-500 to-amber-400" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 py-2 sm:gap-4 sm:py-2.5">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="group flex min-h-[52px] min-w-0 shrink items-center gap-2.5 rounded-2xl text-right transition-opacity hover:opacity-95 sm:gap-3"
              aria-label="العودة إلى الصفحة الرئيسية"
            >
              <BrandMark size="md" withRing className="transition-transform duration-300 group-hover:scale-105" />

              <span className="block min-w-0 text-right leading-tight">
                <span className="block font-display text-[15px] font-black tracking-tight text-slate-900 dark:text-white sm:truncate sm:whitespace-nowrap sm:text-[20px] lg:text-[21px]">
                  <span className="block leading-[1.15] sm:inline">SHAHA ONE</span>
                  <span className="hidden text-blue-600 dark:text-blue-400 sm:inline"> | </span>
                  <span className="mt-0.5 block leading-[1.15] sm:mt-0 sm:inline">شها ون</span>
                </span>
                <span className="mt-0.5 hidden max-w-[250px] truncate text-[13px] font-semibold text-slate-600 dark:text-slate-300 sm:block lg:max-w-none">
                  شها كلها.. أقرب وأسهل في مكان واحد
                </span>
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Universal search */}
              {onOpenSpotlightSearch && (
                <button
                  type="button"
                  onClick={onOpenSpotlightSearch}
                  className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2.5 text-[13px] font-bold text-slate-700 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-50/70 active:scale-95 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-slate-800 sm:px-3 cursor-pointer"
                  title="بحث فوري شامل في كل خدمات وأرقام شها (Ctrl+K)"
                  aria-label="بحث شامل"
                >
                  <Search className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  <span className="hidden xl:inline">بحث شامل</span>
                  <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 2xl:inline-block">
                    Ctrl K
                  </kbd>
                </button>
              )}

              {/* Favorites */}
              <button
                type="button"
                onClick={handleOpenFavorites}
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-rose-600 shadow-2xs transition-all hover:border-rose-300 hover:bg-rose-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800/90 dark:text-rose-400 dark:hover:border-rose-800 dark:hover:bg-slate-800 sm:inline-flex cursor-pointer"
                title="المفضلة والمحفوظات"
                aria-label="المفضلة والمحفوظات"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Theme */}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-2xs transition-all hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                title={theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
                aria-label="تبديل المظهر النهاري والليلي"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200" aria-hidden="true" />
                )}
              </button>

              {/* Primary add CTA (bottom nav covers phones) */}
              <button
                type="button"
                onClick={onOpenAddService}
                className="hidden h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3.5 text-[13px] font-black text-white shadow-sm shadow-emerald-950/20 transition-all hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500 md:inline-flex xl:px-4 xl:text-sm cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden xl:inline">أضف رقم أو خدمة</span>
                <span className="xl:hidden">إضافة</span>
              </button>

              {/* Signed-in avatar or quick Google Sign-In */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="hidden h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 sm:inline-flex cursor-pointer"
                  title="حسابي والقائمة الشخصية"
                  aria-label="فتح القائمة الشخصية"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'صورة المستخدم'}
                      className="h-7 w-7 rounded-lg border border-blue-400 object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {currentUser.displayName ? currentUser.displayName[0] : 'م'}
                    </span>
                  )}
                  <span className="hidden max-w-[96px] truncate text-xs font-bold text-slate-700 dark:text-slate-200 2xl:inline">
                    {currentUser.displayName?.split(' ')[0] || 'حسابي'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleGoogleSignIn()}
                  disabled={googleLoading}
                  className="hidden h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 shadow-xs transition-all hover:border-blue-400 hover:bg-blue-50/60 active:scale-95 disabled:cursor-wait disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-600 sm:inline-flex cursor-pointer"
                  title="تسجيل الدخول بحساب Google"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
                  ) : (
                    <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  )}
                  <span className="hidden lg:inline">{googleLoading ? 'جارٍ الدخول...' : 'دخول'}</span>
                </button>
              )}

              {/* Drawer menu */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="فتح القائمة الجانبية"
                aria-expanded={sidebarOpen}
                aria-controls="main-navigation-drawer"
                title="القائمة الجانبية"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
                {isAdmin && pendingRequestsCount > 0 && (
                  <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop / tablet navigation rail */}
          <div className="hidden md:block border-t border-slate-200/70 pb-1 dark:border-slate-800/80">
            <HorizontalScrollStrip
              contentClassName="no-scrollbar py-1"
              ariaLabel="التنقل الرئيسي"
            >
              <nav className="flex items-center gap-0.5 xl:gap-1 xl:justify-center w-max min-w-full">
                {PRIMARY_NAV.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => handleNav(item.tab)}
                      aria-current={active ? 'page' : undefined}
                      className={navButtonClass(active, item.accent)}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </HorizontalScrollStrip>
          </div>
        </div>
      </header>

      {/* Slide-over navigation drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          <aside
            id="main-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            className="relative z-10 flex h-full w-full max-w-[22rem] flex-col justify-between overflow-y-auto bg-white text-right shadow-2xl animate-in slide-in-from-right duration-300 dark:bg-slate-900"
          >
            <div>
              {/* Drawer header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <BrandMark size="sm" />
                  <div className="min-w-0">
                    <h2 id="mobile-menu-title" className="font-display text-lg font-black text-slate-900 dark:text-white">
                      SHAHA ONE | شها ون
                    </h2>
                    <p className="truncate text-[13px] font-medium text-slate-600 dark:text-slate-300">
                      شها كلها.. أقرب وأسهل في مكان واحد
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* User card */}
              {currentUser && (
                <div className="mx-4 mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/80 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || ''}
                        className="h-12 w-12 shrink-0 rounded-xl border-2 border-blue-500 object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white">
                        {currentUser.displayName ? currentUser.displayName[0] : 'م'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-black text-slate-900 dark:text-white">
                          {currentUser.displayName || 'أحد أهالي شها'}
                        </span>
                        {adminSession?.role === 'owner' && (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-black text-slate-950">
                            <Crown className="h-3.5 w-3.5" aria-hidden="true" /> مالك
                          </span>
                        )}
                        {isAdmin && adminSession?.role !== 'owner' && (
                          <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-black text-white">
                            مشرف
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drawer navigation */}
              <div className="space-y-1.5 p-4 text-[15px] font-bold">
                {isInstallable && (
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      installApp();
                    }}
                    className="mb-2 flex min-h-[56px] w-full items-center justify-between rounded-2xl bg-gradient-to-r from-blue-700 to-emerald-600 px-4 py-3 text-right font-black text-white shadow-md transition-all hover:from-blue-800 hover:to-emerald-700"
                  >
                    <span className="flex items-center gap-2.5">
                      <Smartphone className="h-[22px] w-[22px] text-sky-100" aria-hidden="true" />
                      <span>تثبيت تطبيق شها على هاتفك</span>
                    </span>
                    <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[11px]">PWA</span>
                  </button>
                )}

                <div className="px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  تصفح الدليل
                </div>

                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className={drawerItemClass(
                    activeTab === 'home',
                    'bg-blue-50 font-black text-blue-800 dark:bg-blue-950/70 dark:text-blue-200',
                    'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Home className="h-[22px] w-[22px] text-blue-700 dark:text-blue-300" aria-hidden="true" />
                    <span>الصفحة الرئيسية والبحث</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('categories')}
                  className={drawerItemClass(
                    activeTab === 'categories',
                    'bg-blue-50 font-black text-blue-800 dark:bg-blue-950/70 dark:text-blue-200',
                    'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <LayoutGrid className="h-[22px] w-[22px] text-blue-700 dark:text-blue-300" aria-hidden="true" />
                    <span>أقسام الخدمات ({categories.length})</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenFavorites}
                  className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-right text-[15px] font-bold text-rose-700 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="h-[22px] w-[22px] fill-rose-600 text-rose-600" aria-hidden="true" />
                    <span>المفضلة والمحفوظات</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-rose-400" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('news')}
                  className={drawerItemClass(
                    activeTab === 'news',
                    'bg-emerald-50 font-black text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200',
                    'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Newspaper className="h-[22px] w-[22px] text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                    <span>أخبار وتنويهات شها</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('emergency')}
                  className={drawerItemClass(
                    activeTab === 'emergency',
                    'bg-red-50 font-black text-red-700 dark:bg-red-950/70 dark:text-red-200',
                    'text-red-700 hover:bg-red-50/70 dark:text-red-300 dark:hover:bg-red-950/30'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <PhoneCall className="h-[22px] w-[22px]" aria-hidden="true" />
                    <span>طوارئ شها والنجدة</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-red-400" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('blood')}
                  className={drawerItemClass(
                    activeTab === 'blood',
                    'bg-rose-50 font-black text-rose-700 dark:bg-rose-950/70 dark:text-rose-200',
                    'text-rose-700 hover:bg-rose-50/70 dark:text-rose-300 dark:hover:bg-rose-950/30'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Droplet className="h-[22px] w-[22px]" aria-hidden="true" />
                    <span>بنك متبرعي الدم بشها</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-rose-400" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('charity')}
                  className={drawerItemClass(
                    activeTab === 'charity',
                    'bg-emerald-50 font-black text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200',
                    'text-emerald-700 hover:bg-emerald-50/70 dark:text-emerald-300 dark:hover:bg-emerald-950/30'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Heart className="h-[22px] w-[22px]" aria-hidden="true" />
                    <span>مبادرات تواصل الخيرية</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('ads')}
                  className={drawerItemClass(
                    activeTab === 'ads',
                    'bg-amber-50 font-black text-amber-800 dark:bg-amber-950/70 dark:text-amber-200',
                    'text-amber-800 hover:bg-amber-50/70 dark:text-amber-300 dark:hover:bg-amber-950/30'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Megaphone className="h-[22px] w-[22px]" aria-hidden="true" />
                    <span>عروض وتخفيضات شها</span>
                  </span>
                  <ChevronLeft className="h-5 w-5 text-amber-500" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/60 px-4 py-3 text-right text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Sun className="h-[22px] w-[22px] text-amber-400" aria-hidden="true" />
                    ) : (
                      <Moon className="h-[22px] w-[22px] text-slate-700 dark:text-slate-200" aria-hidden="true" />
                    )}
                    <span>{theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}</span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {theme === 'dark' ? 'ليلي' : 'نهاري'}
                  </span>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      onOpenAddService();
                    }}
                    className="flex min-h-[56px] w-full items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-right text-[15px] font-black text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700"
                  >
                    <span className="flex items-center gap-2.5">
                      <PlusCircle className="h-[22px] w-[22px]" aria-hidden="true" />
                      <span>إضافة رقم أو خدمة جديدة</span>
                    </span>
                    <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs">مجاناً</span>
                  </button>
                </div>

                {/* Admin-only section */}
                {isAdmin && (
                  <div className="mt-3 border-t border-amber-200/60 pt-4 dark:border-amber-900/60">
                    <div className="flex items-center justify-between px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <span>إدارة النظام</span>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        مصرح
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNav('admin')}
                      className={`mt-1 flex min-h-[56px] w-full items-center justify-between rounded-2xl px-4 py-3 text-right transition-all ${
                        activeTab === 'admin'
                          ? 'bg-amber-500 font-black text-slate-950 shadow-md'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/60'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <ShieldCheck className="h-[22px] w-[22px] text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        <span>
                          <span className="block text-[15px] font-black">لوحة تحكم المشرف</span>
                          <span className="block text-xs font-normal opacity-80">
                            {adminSession?.role === 'owner' ? 'صلاحيات المالك الكاملة' : 'صلاحيات المشرف'}
                          </span>
                        </span>
                      </span>
                      {pendingRequestsCount > 0 && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white animate-pulse">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false);
                        adminLogout();
                        notify('تم تسجيل خروج المشرف بنجاح', 'info');
                        if (activeTab === 'admin') onNavigateTab('home');
                      }}
                      className="mt-1 flex min-h-[48px] w-full items-center gap-2.5 rounded-2xl px-4 py-2.5 text-right text-sm font-bold text-red-700 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" aria-hidden="true" />
                      <span>تسجيل خروج المشرف</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="border-t border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="max-w-[190px] truncate text-sm text-slate-600 dark:text-slate-300">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setSidebarOpen(false);
                      await signOut();
                      notify('تم تسجيل الخروج بنجاح', 'info');
                      if (activeTab === 'admin') onNavigateTab('home');
                    }}
                    className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>خروج</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void handleGoogleSignIn();
                  }}
                  disabled={googleLoading}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-800 shadow-xs transition-colors hover:border-blue-400 disabled:cursor-wait disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-700 dark:text-blue-300" aria-hidden="true" />
                  ) : (
                    <LogIn className="h-5 w-5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                  )}
                  <span>{googleLoading ? 'جارٍ الاتصال بـ Google…' : 'تسجيل الدخول بـ Google'}</span>
                </button>
              )}

              <p className="mt-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                منصة شها ون الرسمية © {new Date().getFullYear()}
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
