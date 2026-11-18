// DevMeDoAnDrOiD
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { DirectoryProvider, useDirectory } from './context/DirectoryContext';
import { enableGlobalHorizontalWheelScroll } from './utils/horizontalScroll';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';

// Pages are code-split so the first paint only loads what the visitor needs.
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage').then(m => ({ default: m.ListingDetailPage })));
const EmergencyPage = lazy(() => import('./pages/EmergencyPage').then(m => ({ default: m.EmergencyPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const BloodBankPage = lazy(() => import('./pages/BloodBankPage').then(m => ({ default: m.BloodBankPage })));
const CharityPage = lazy(() => import('./pages/CharityPage').then(m => ({ default: m.CharityPage })));
const OffersAdsPage = lazy(() => import('./pages/OffersAdsPage').then(m => ({ default: m.OffersAdsPage })));
const NewsPage = lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsPage })));

// Admin & modals are loaded on demand.
const AdminLoginModal = lazy(() => import('./components/admin/AdminLoginModal').then(m => ({ default: m.AdminLoginModal })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AddServiceModal = lazy(() => import('./components/modals/AddServiceModal').then(m => ({ default: m.AddServiceModal })));
const ReportModal = lazy(() => import('./components/modals/ReportModal').then(m => ({ default: m.ReportModal })));
const AdPopupModal = lazy(() => import('./components/ads/AdPopupModal').then(m => ({ default: m.AdPopupModal })));
const FloatingAdWidget = lazy(() => import('./components/ads/FloatingAdWidget').then(m => ({ default: m.FloatingAdWidget })));
const ContactAdminModal = lazy(() => import('./components/contact/ContactAdminModal').then(m => ({ default: m.ContactAdminModal })));
const SpotlightSearchModal = lazy(() => import('./components/common/SpotlightSearchModal').then(m => ({ default: m.SpotlightSearchModal })));

import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TopAnnouncementBar } from './components/ads/TopAnnouncementBar';
import { NetworkStatusBanner } from './components/common/NetworkStatusBanner';
import { ScrollToTopButton } from './components/common/ScrollToTopButton';
import { ListingGridSkeleton, ListingDetailSkeleton } from './components/common/SkeletonLoaders';
import { recordRecentlyViewed } from './components/common/RecentlyViewedBar';

// Utilities
import { AppRoute, parseCurrentRoute, navigateTo, updateSeoMeta } from './utils/navigation';
import { Listing, AdminMessageTopic } from './types';
import { ShieldCheck, X, AlertTriangle, Smartphone } from 'lucide-react';

function DirectoryMain() {
  const { isAdmin, isOnline, isInitializing, listings } = useDirectory();
  const [splashTimedOut, setSplashTimedOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashTimedOut(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  // Route State synchronized with Browser URL (History API)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseCurrentRoute());

  // Modals state
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [defaultAddCatId, setDefaultAddCatId] = useState<string | undefined>(undefined);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [targetListingForReport, setTargetListingForReport] = useState<Listing | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isContactAdminOpen, setIsContactAdminOpen] = useState(false);
  const [contactAdminTopic, setContactAdminTopic] = useState<AdminMessageTopic>('inquiry');
  const [contactAdminSubject, setContactAdminSubject] = useState('');

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [ambientReady, setAmbientReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAmbientReady(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Allow any module (auth, network helpers) to surface a toast without prop drilling.
  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; type?: 'success' | 'error' | 'info' }>).detail;
      if (detail?.message) addToast(detail.message, detail.type ?? 'info');
    };
    window.addEventListener('shaha_toast', handleToastEvent);
    return () => window.removeEventListener('shaha_toast', handleToastEvent);
  }, []);

  useEffect(() => {
    return enableGlobalHorizontalWheelScroll();
  }, []);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    addToast(`تم نسخ الرقم (${phone}) إلى الحافظة بنجاح!`, 'success');
  };

  // Listen to popstate (Back/Forward buttons) & custom navigation event
  useEffect(() => {
    const handleUrlChange = () => {
      const parsed = parseCurrentRoute();
      setCurrentRoute(parsed);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('shaha_navigate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('shaha_navigate', handleUrlChange);
    };
  }, []);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K for Spotlight Universal Search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Update SEO Meta on route change
  useEffect(() => {
    switch (currentRoute.page) {
      case 'home':
        updateSeoMeta('الرئيسية | SHAHA ONE - شها ون', 'منصتك الرقمية المتكاملة لخدمات أهالي شها - شها كلها.. أقرب وأسهل في مكان واحد');
        break;
      case 'categories':
        updateSeoMeta('أقسام وتصنيفات شها ون', 'تصفح كافة التخصصات والخدمات المنظمة في منصة شها ون');
        break;
      case 'emergency':
        updateSeoMeta('أرقام الطوارئ السريعة', 'أرقام الإسعاف، النجدة، المطافي، وطوارئ الكهرباء والمياه بشها والدقهلية');
        break;
      case 'blood':
        updateSeoMeta('بنك الدم التطوعي', 'متبرعو ونداءات بنك الدم لإنقاذ الحالات الحرجة في شها');
        break;
      case 'charity':
        updateSeoMeta('المبادرات الخيرية', 'مبادرات التكافل والتضامن الاجتماعي بأيدي أهالي شها');
        break;
      case 'about':
        updateSeoMeta('عن منصة شها ون', 'نبذة عن المنصة والخدمات المجتمعية بقرية شها');
        break;
      case 'admin':
        updateSeoMeta('لوحة تحكم المشرف');
        break;
    }
  }, [currentRoute.page]);

  // PWA Install prompt listener (hidden automatically if app is already installed or dismissed)
  useEffect(() => {
    const isStandalone =
      (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) ||
      Boolean((window.navigator as { standalone?: boolean }).standalone);
    const alreadyMarked =
      localStorage.getItem('shaha_pwa_installed') === '1' ||
      localStorage.getItem('shaha_pwa_dismissed') === '1';

    if (isStandalone) {
      try {
        localStorage.setItem('shaha_pwa_installed', '1');
      } catch {}
      setShowInstallBanner(false);
      return;
    }

    if (alreadyMarked) {
      setShowInstallBanner(false);
    }

    const checkRelatedApps = async () => {
      const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> };
      if (typeof nav.getInstalledRelatedApps === 'function') {
        try {
          const apps = await nav.getInstalledRelatedApps();
          if (Array.isArray(apps) && apps.length > 0) {
            localStorage.setItem('shaha_pwa_installed', '1');
            setShowInstallBanner(false);
          }
        } catch {}
      }
    };
    void checkRelatedApps();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      if (
        localStorage.getItem('shaha_pwa_installed') === '1' ||
        localStorage.getItem('shaha_pwa_dismissed') === '1' ||
        window.matchMedia?.('(display-mode: standalone)').matches
      ) {
        setShowInstallBanner(false);
        return;
      }
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      try {
        localStorage.setItem('shaha_pwa_installed', '1');
      } catch {}
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      try {
        localStorage.setItem('shaha_pwa_installed', '1');
      } catch {}
      setShowInstallBanner(false);
      addToast('شكراً لتثبيت تطبيق منصة شها ون على هاتفك!', 'success');
    }
    setDeferredPrompt(null);
  };

  // Compute active navigation tab for Header & MobileBottomNav
  const activeTabKey = currentRoute.page;

  // Handle Admin Dashboard Route
  if (currentRoute.page === 'admin' && isAdmin) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-slate-500">جارٍ تحميل لوحة التحكم…</p>
            </div>
          </div>
        }
      >
        <AdminDashboard
          onClose={() => navigateTo({ page: 'home' })}
          onSuccessToast={(msg) => addToast(msg, 'success')}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Suspense>
    );
  }

  if (currentRoute.page === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="card-luxe max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">لوحة التحكم محمية</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            هذه المنطقة مخصصة لفريق إدارة منصة شها ون. يرجى تسجيل الدخول بحساب مصرح له للمتابعة.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              تسجيل دخول الإدارة
            </button>
            <button
              onClick={() => navigateTo({ page: 'home' })}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors cursor-pointer"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
        <Suspense fallback={null}>
          {isAdminLoginOpen && (
            <AdminLoginModal
              isOpen={isAdminLoginOpen}
              onClose={() => setIsAdminLoginOpen(false)}
              onLoginSuccess={() => {
                addToast('مرحباً بك في لوحة تحكم منصة شها ون!', 'success');
              }}
            />
          )}
        </Suspense>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  const handleGlobalNavigateTab = (tab: string) => {
    if (tab === 'home') navigateTo({ page: 'home' });
    else if (tab === 'categories') navigateTo({ page: 'categories' });
    else if (tab === 'news') navigateTo({ page: 'news' });
    else if (tab === 'emergency') navigateTo({ page: 'emergency' });
    else if (tab === 'blood') navigateTo({ page: 'blood' });
    else if (tab === 'charity') navigateTo({ page: 'charity' });
    else if (tab === 'ads' || tab === 'offers') navigateTo({ page: 'ads' });
    else if (tab === 'about') navigateTo({ page: 'about' });
    else if (tab === 'admin') navigateTo({ page: 'admin' });
  };

  const showSplash = isInitializing && listings.length === 0 && !splashTimedOut;

  if (showSplash) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6"
      >
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
          <img src="./brand-icon.svg" alt="شها ون" className="w-16 h-16 rounded-2xl shadow-lg" />
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
              شها ون | SHAHA ONE
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              جارٍ تجهيز الدليل والخدمات…
            </p>
          </div>
          <div className="w-40 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-blue-700 focus:text-white focus:font-bold focus:shadow-lg"
      >
        تخطَّ إلى المحتوى الرئيسي
      </a>

      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-black flex items-center justify-center gap-2 z-50">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>أنت حالياً في وضع عدم الاتصال بالإنترنت - يتم عرض البيانات المحفوظة في الذاكرة المحلية</span>
        </div>
      )}

      {showInstallBanner && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 backdrop-blur-md text-white px-4 py-2.5 shadow-md border-b border-white/10 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold z-50">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-white/15 shrink-0">
              <Smartphone className="w-4 h-4" />
            </span>
            <span>تثبيت تطبيق «شها ون | SHAHA ONE» على شاشة هاتفك للوصول السريع بنقرة واحدة</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallApp}
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              تثبيت الآن
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.setItem('shaha_pwa_dismissed', '1');
                } catch {}
                setShowInstallBanner(false);
              }}
              className="p-1.5 hover:bg-white/15 rounded-xl text-white/85 transition-colors cursor-pointer"
              title="إغلاق التنبيه"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Promotional & Urgent Announcements Bar */}
      <TopAnnouncementBar />

      {/* Global Header */}
      <Header
        onOpenAddService={() => {
          setDefaultAddCatId(undefined);
          setIsAddServiceOpen(true);
        }}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenSpotlightSearch={() => setIsSpotlightOpen(true)}
        onNavigateTab={handleGlobalNavigateTab}
        activeTab={activeTabKey}
      />

      {/* Main Pages Container */}
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12 min-h-[75vh]">
        <Suspense
          fallback={
            currentRoute.page === 'listing' ? (
              <ListingDetailSkeleton />
            ) : (
              <div className="space-y-4 py-4">
                <div className="h-8 w-56 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <ListingGridSkeleton count={6} />
              </div>
            )
          }
        >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${currentRoute.page}-${'categoryId' in currentRoute ? currentRoute.categoryId : ''}-${'listingId' in currentRoute ? currentRoute.listingId : ''}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
        {/* Page 1: HOME */}
        {currentRoute.page === 'home' && (
          <ErrorBoundary moduleName="الصفحة الرئيسية">
            <HomePage
              onSelectListing={(listing) => {
                recordRecentlyViewed(listing);
                navigateTo({ page: 'listing', listingId: listing.id });
              }}
              onOpenAddService={() => {
                setDefaultAddCatId(undefined);
                setIsAddServiceOpen(true);
              }}
              onOpenReport={() => setIsReportOpen(true)}
              onCopyPhone={handleCopyPhone}
              onShowToast={addToast}
            />
          </ErrorBoundary>
        )}

        {/* Page 2: CATEGORIES LIST */}
        {currentRoute.page === 'categories' && (
          <ErrorBoundary moduleName="أقسام الدليل">
            <CategoriesPage />
          </ErrorBoundary>
        )}

        {/* Page 3: INDEPENDENT CATEGORY PAGE */}
        {currentRoute.page === 'category' && (
          <ErrorBoundary moduleName={`قسم الخدمة: ${currentRoute.categoryId}`}>
            <CategoryPage
              categoryId={currentRoute.categoryId}
              initialSubcategory={currentRoute.subcategory}
              onSelectListing={(listing) => {
                recordRecentlyViewed(listing);
                navigateTo({ page: 'listing', listingId: listing.id });
              }}
              onOpenAddService={(catId) => {
                setDefaultAddCatId(catId);
                setIsAddServiceOpen(true);
              }}
              onCopyPhone={handleCopyPhone}
              onShowToast={addToast}
            />
          </ErrorBoundary>
        )}

        {/* Page 4: INDEPENDENT LISTING DETAIL PAGE */}
        {currentRoute.page === 'listing' && (
          <ErrorBoundary moduleName="تفاصيل الخدمة">
            <ListingDetailPage
              listingId={currentRoute.listingId}
              onCopyPhone={handleCopyPhone}
              onOpenReport={(item) => {
                setTargetListingForReport(item);
                setIsReportOpen(true);
              }}
              onShowToast={addToast}
            />
          </ErrorBoundary>
        )}

        {/* Page 5: EMERGENCY DIRECTORY */}
        {currentRoute.page === 'emergency' && (
          <ErrorBoundary moduleName="دليل أرقام الطوارئ">
            <EmergencyPage
              onCopyPhone={handleCopyPhone}
              onShowToast={addToast}
            />
          </ErrorBoundary>
        )}

        {/* Page 6: BLOOD BANK */}
        {currentRoute.page === 'blood' && (
          <ErrorBoundary moduleName="بنك الدم التطوعي">
            <BloodBankPage onShowToast={addToast} />
          </ErrorBoundary>
        )}

        {/* Page 7: CHARITY INITIATIVES */}
        {currentRoute.page === 'charity' && (
          <ErrorBoundary moduleName="المبادرات الخيرية">
            <CharityPage onShowToast={addToast} />
          </ErrorBoundary>
        )}

        {/* Page 8: ABOUT SHAHA ONE */}
        {currentRoute.page === 'about' && (
          <ErrorBoundary moduleName="عن منصة شها ون">
            <AboutPage
              onOpenAddService={() => {
                setDefaultAddCatId(undefined);
                setIsAddServiceOpen(true);
              }}
            />
          </ErrorBoundary>
        )}

        {/* Page 9: VILLAGE OFFERS & PINNED ADS SHOWCASE */}
        {currentRoute.page === 'ads' && (
          <ErrorBoundary moduleName="عروض وإعلانات شها">
            <OffersAdsPage />
          </ErrorBoundary>
        )}

        {/* Page 10: STANDALONE VILLAGE NEWS & ANNOUNCEMENTS PAGE */}
        {currentRoute.page === 'news' && (
          <ErrorBoundary moduleName="أخبار وتنويهات شها">
            <NewsPage
              initialCategory={currentRoute.category}
              initialArticleId={currentRoute.articleId}
            />
          </ErrorBoundary>
        )}
          </motion.div>
        </AnimatePresence>
        </Suspense>
      </main>

      {/* Global Modals (mounted only when needed, loaded on demand) */}
      <Suspense fallback={null}>
        {isAddServiceOpen && (
          <AddServiceModal
            isOpen={isAddServiceOpen}
            onClose={() => setIsAddServiceOpen(false)}
            onSuccessToast={(msg) => addToast(msg, 'success')}
            defaultCategoryId={defaultAddCatId}
          />
        )}

        {isReportOpen && (
          <ReportModal
            listing={targetListingForReport}
            isOpen={isReportOpen}
            onClose={() => {
              setIsReportOpen(false);
              setTargetListingForReport(null);
            }}
            onSuccessToast={(msg) => addToast(msg, 'success')}
          />
        )}

        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onLoginSuccess={() => {
              navigateTo({ page: 'admin' });
              addToast('مرحباً بك في لوحة تحكم منصة شها ون!', 'success');
            }}
          />
        )}

        {ambientReady && (
          <>
            <AdPopupModal />
            <FloatingAdWidget />
          </>
        )}
      </Suspense>

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Global Footer */}
      <Footer
        onNavigateTab={handleGlobalNavigateTab}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAddService={() => {
          setDefaultAddCatId(undefined);
          setIsAddServiceOpen(true);
        }}
        onOpenContactAdmin={() => {
          setContactAdminTopic('inquiry');
          setContactAdminSubject('');
          setIsContactAdminOpen(true);
        }}
      />

      <Suspense fallback={null}>
        {/* Internal Admin & Owner Messaging Modal */}
        {isContactAdminOpen && (
          <ContactAdminModal
            isOpen={isContactAdminOpen}
            onClose={() => setIsContactAdminOpen(false)}
            defaultTopic={contactAdminTopic}
            defaultSubject={contactAdminSubject}
            onSuccessToast={(msg) => addToast(msg, 'success')}
          />
        )}

        {/* Spotlight Universal Search Modal */}
        {isSpotlightOpen && (
          <SpotlightSearchModal
            isOpen={isSpotlightOpen}
            onClose={() => setIsSpotlightOpen(false)}
            onSelectListing={(listing) => {
              recordRecentlyViewed(listing);
              navigateTo({ page: 'listing', listingId: listing.id });
            }}
            onCallListing={(listing) => {
              handleCopyPhone(listing.phone);
            }}
            onShowToast={addToast}
          />
        )}
      </Suspense>

      {/* Real-time Network Offline / Online Banner */}
      <NetworkStatusBanner />

      {/* Smooth Scroll-to-Top Floating Action */}
      <ScrollToTopButton />

      {/* Mobile Floating Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTabKey}
        onNavigateTab={handleGlobalNavigateTab}
        onOpenAddService={() => {
          setDefaultAddCatId(undefined);
          setIsAddServiceOpen(true);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <DirectoryProvider>
        <DirectoryMain />
      </DirectoryProvider>
    </MotionConfig>
  );
}

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
