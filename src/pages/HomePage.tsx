import React, { lazy, Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { HeroSearch } from '../components/home/HeroSearch';
import { EmergencyBanner } from '../components/home/EmergencyBanner';
import { ListingCard } from '../components/listings/ListingCard';
import { CategoryIconBadge } from '../components/common/CategoryIcon';
import { navigateTo } from '../utils/navigation';
import { Listing } from '../types';
import {
  Sparkles,
  ArrowLeft,
  Building2,
  PlusCircle,
  PhoneCall,
  Droplet,
  Layers,
  X
} from 'lucide-react';

import { FeedAdCard } from '../components/ads/FeedAdCard';
import { TopQuickActions } from '../components/home/TopQuickActions';
import { RecentlyViewedBar, recordRecentlyViewed } from '../components/common/RecentlyViewedBar';
import { FavoritesBar } from '../components/common/FavoritesBar';
import { useGsapReveal } from '../hooks/useGsapReveal';
import { scheduleIdleTask } from '../lib/net';

const MansouraEmergencySchedule = lazy(() =>
  import('../components/emergency/MansouraEmergencySchedule').then(m => ({ default: m.MansouraEmergencySchedule }))
);
const HeroAdSlider = lazy(() =>
  import('../components/ads/HeroAdSlider').then(m => ({ default: m.HeroAdSlider }))
);
const DealsStoryBar = lazy(() =>
  import('../components/ads/DealsStoryBar').then(m => ({ default: m.DealsStoryBar }))
);
const AdsShowcaseFeed = lazy(() =>
  import('../components/ads/AdsShowcaseFeed').then(m => ({ default: m.AdsShowcaseFeed }))
);
const ShahaFacebookPages = lazy(() =>
  import('../components/community/ShahaFacebookPages').then(m => ({ default: m.ShahaFacebookPages }))
);
const VillageNewsSection = lazy(() =>
  import('../components/news/VillageNewsSection').then(m => ({ default: m.VillageNewsSection }))
);

interface HomePageProps {
  onSelectListing: (listing: Listing) => void;
  onOpenAddService: () => void;
  onOpenReport?: () => void;
  onCopyPhone: (phone: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectListing,
  onOpenAddService,
  onOpenReport,
  onCopyPhone,
  onShowToast
}) => {
  const { categories, listings, bloodDonors, advertisements, isAdActiveNow } = useDirectory();
  const [searchQuery, setSearchQuery] = useState('');
  const [secondaryReady, setSecondaryReady] = useState(false);
  const categoriesGridRef = useGsapReveal<HTMLDivElement>({ stagger: 0.03, y: 14, duration: 0.45, deps: [categories.length] });

  useEffect(() => {
    return scheduleIdleTask(() => {
      setSecondaryReady(true);
    }, 150);
  }, []);
  // Keep typing responsive even with a large directory: filtering follows the
  // deferred value while the input updates immediately.
  const deferredQuery = useDeferredValue(searchQuery);

  const handleSelectWithHistory = (listing: Listing) => {
    recordRecentlyViewed(listing);
    onSelectListing(listing);
  };

  // Filter listings live if user types in search bar
  const searchResults = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];
    return listings.filter(l => {
      if (l.status === 'hidden') return false;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.titleOrSpecialty && l.titleOrSpecialty.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q)) ||
        (l.subcategoryId && l.subcategoryId.toLowerCase().includes(q))
      );
    });
  }, [listings, deferredQuery]);

  // Top featured listings
  const featuredListings = useMemo(
    () => listings
      .filter(l => l.status === 'active' && (l.isFeatured || l.isVerified))
      .slice(0, 6),
    [listings]
  );

  // Active in-feed promotional ads
  const feedAds = useMemo(
    () => advertisements.filter(ad => ad.placement === 'feed_interstitial' && isAdActiveNow(ad)),
    [advertisements, isAdActiveNow]
  );

  // Count items per category in a single pass instead of re-filtering per card.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const listing of listings) {
      if (listing.status === 'active') {
        counts[listing.categoryId] = (counts[listing.categoryId] || 0) + 1;
      }
    }
    return counts;
  }, [listings]);

  const getCount = (catId: string) => categoryCounts[catId] || 0;

  return (
    <div className="space-y-6 sm:space-y-9">
      <EmergencyBanner />

      {/* 2. Hero Search Section — First Fold Priority */}
      <HeroSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectListing={handleSelectWithHistory}
        onSelectCategory={(catId) => {
          navigateTo({ page: 'category', categoryId: catId });
        }}
        onOpenAddService={onOpenAddService}
      />

      {/* Live Homepage Search Results Overlay/Section when user types */}
      {searchQuery.trim() && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-emerald-200 dark:border-emerald-900/60 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>نتائج البحث لـ «{searchQuery}»</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                {searchResults.length} نتيجة
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <span>مسح البحث</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onOpenDetails={handleSelectWithHistory}
                  onCopyPhone={onCopyPhone}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs font-semibold">
              لا توجد أرقام أو خدمات مطابقة لـ «{searchQuery}». يمكنك اختيار قسم آخر من التصفح السريع أدناه.
            </div>
          )}
        </section>
      )}

      {/* Bookmarked Favorites Bar */}
      <div id="favorites-section" className="scroll-mt-28">
        <FavoritesBar
          onSelectListing={handleSelectWithHistory}
          onCopyPhone={onCopyPhone}
        />
      </div>

      {/* Recently Viewed Services Bar */}
      <RecentlyViewedBar onSelectListing={handleSelectWithHistory} />

      <Suspense fallback={null}>
        {secondaryReady && (
          <>
            <MansouraEmergencySchedule
              compactTeaser={true}
              onOpenFullView={() => navigateTo({ page: 'emergency' })}
            />
            <HeroAdSlider />
            <DealsStoryBar />
          </>
        )}
      </Suspense>

      {/* 4. Village Directory Categories Grid & Quick Filter */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-900/50 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>أقسام خدمات شها</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  {categories.length}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                تصفح كافة الأطباء، الصيدليات، المعلمين، الحرفيين، والأرقام الهامة
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo({ page: 'categories' })}
            className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 shrink-0 group cursor-pointer bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3.5 py-2 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 transition-all"
          >
            <span>جميع الأقسام</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <div ref={categoriesGridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((category) => {
            const count = getCount(category.id);
            return (
              <button
                key={category.id}
                data-reveal
                onClick={() => navigateTo({ page: 'category', categoryId: category.id })}
                className="card-luxe h-full flex flex-col items-center justify-between p-4 sm:p-5 text-center relative group hover:border-emerald-500 dark:hover:border-emerald-500 hover:-translate-y-1 active:scale-[0.97] cursor-pointer touch-manipulation select-none"
              >
                <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                  <CategoryIconBadge category={category} size="lg" />
                </div>
                <div className="w-full">
                  <h3 className="card-title text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {category.nameAr}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block tabular-nums">
                    {count > 0 ? `${count} جهة مسجلة` : 'متاح للتسجيل'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {featuredListings.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                أبرز الأرقام والخدمات الموثقة بشها
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              أعلى تقييماً وطلباً من أهالي القرية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {feedAds.length > 0 && <FeedAdCard ad={feedAds[0]} />}
            {featuredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onOpenDetails={handleSelectWithHistory}
                onCopyPhone={onCopyPhone}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Top Quick Action Cards (Add Service & Report Issue) */}
      <TopQuickActions
        onOpenAddService={onOpenAddService}
        onOpenReport={() => onOpenReport ? onOpenReport() : undefined}
      />

      <Suspense fallback={null}>
        {secondaryReady && (
          <>
            <section>
              <VillageNewsSection
                limit={3}
                onNavigateToFullNews={() => navigateTo({ page: 'news' })}
              />
            </section>

            <AdsShowcaseFeed limit={3} initialMode="stack" />
          </>
        )}
      </Suspense>

      {/* 9. Village Stats Banner */}
      <section className="page-hero p-6 sm:p-10">
        <div className="relative z-10">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-3 border border-white/15">
              <Building2 className="w-3.5 h-3.5" />
              <span>قرية شها – مركز المنصورة – محافظة الدقهلية</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black mb-2">
              منصة رقمية موحدة لخدمة كل بيت في شها
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              نهدف إلى تيسير المعاملات اليومية وربط الأهالي بالأطباء والصيادلة والحرفيين والمؤسسات الخدمية والخيرية بضغطة زر واحدة.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="font-display tabular-nums text-2xl sm:text-3xl font-black text-white">{listings.length}+</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">خدمة ورقم مسجل</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="font-display tabular-nums text-2xl sm:text-3xl font-black text-rose-300">{bloodDonors.length}</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">متبرع ببنك الدم بشها</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="font-display tabular-nums text-2xl sm:text-3xl font-black text-amber-300">{categories.length}</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">قسماً وتخصصاً شاملاً</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="font-display tabular-nums text-2xl sm:text-3xl font-black text-emerald-300">24/7</div>
              <div className="text-xs font-bold text-emerald-200 mt-1">متاح دائماً مجاناً</div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        {secondaryReady && (
          <section>
            <ShahaFacebookPages onShowToast={onShowToast} />
          </section>
        )}
      </Suspense>

      {/* 11. Quick Action Cards: Blood Bank & Emergency & Add Service */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blood Bank Teaser */}
        <div
          onClick={() => navigateTo({ page: 'blood' })}
          className="card-luxe p-6 hover:border-rose-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-black text-slate-900 dark:text-white mb-1">
              بنك الدم التطوعي بشها
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              قاعدة بيانات موثقة لفصائل الدم لإنقاذ الحالات الطارئة والعمليات الجراحية لأهالي القرية فوراً.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>تصفح المتبرعين أو سجل الآن</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Emergency Numbers Teaser */}
        <div
          onClick={() => navigateTo({ page: 'emergency' })}
          className="card-luxe p-6 hover:border-red-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-black text-slate-900 dark:text-white mb-1">
              طوارئ شها والدقهلية
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              الإسعاف، النجدة، الإطفاء، وطوارئ الكهرباء والمياه والغاز للاتصال المباشر بنقرة واحدة.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-red-600">
            <span>دليل أرقام الطوارئ</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Add Service CTA */}
        <div
          onClick={onOpenAddService}
          className="card-luxe p-6 hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-black text-slate-900 dark:text-white mb-1">
              أضف رقمك أو خدمتك مجاناً
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              هل تقدم خدمة أو تمتلك محلاً أو عيادة في شها؟ أضف بياناتك لتصل لآلاف المواطنين في القرية.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>تقديم طلب إضافة رقم</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </section>
    </div>
  );
};
