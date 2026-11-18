import React, { useState, useMemo, useEffect } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NativeTopBar } from '../components/common/NativeTopBar';
import { Pagination } from '../components/common/Pagination';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingGridSkeleton } from '../components/common/SkeletonLoaders';
import { CategoryIconBadge } from '../components/common/CategoryIcon';
import { Listing } from '../types';
import { navigateTo, updateSeoMeta } from '../utils/navigation';
import { matchesQuery, matchesPhone } from '../utils/search';
import { getAvailabilityStatus } from '../utils/availability';
import {
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  Search,
  PlusCircle,
  Share2,
  X,
  Filter
} from 'lucide-react';
import { FeedAdCard } from '../components/ads/FeedAdCard';
import { HorizontalScrollStrip } from '../components/common/HorizontalScrollStrip';

interface CategoryPageProps {
  categoryId: string;
  initialSubcategory?: string;
  onSelectListing: (listing: Listing) => void;
  onOpenAddService: (defaultCategoryId?: string) => void;
  onCopyPhone: (phone: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  initialSubcategory,
  onSelectListing,
  onOpenAddService,
  onCopyPhone,
  onShowToast
}) => {
  const { categories, listings, isAdmin, advertisements, isAdActiveNow } = useDirectory();

  // Find Category object
  const category = useMemo(() => {
    return categories.find(c => c.id === categoryId) || categories[0];
  }, [categories, categoryId]);

  // Find active promo ad targeted for this category or general feed
  const categoryAd = useMemo(() => {
    return advertisements.find(
      ad => (ad.targetCategory === category.id || ad.placement === 'feed_interstitial' || ad.placement === 'category_page') && isAdActiveNow(ad)
    );
  }, [advertisements, category.id, isAdActiveNow]);

  // Filters & State
  const [selectedSub, setSelectedSub] = useState<string | null>(initialSubcategory || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenNowOnly, setIsOpenNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'all' | 'popular' | 'latest' | 'verified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const PAGE_SIZE = 12;

  // Sync initialSubcategory if changed from route
  useEffect(() => {
    if (initialSubcategory !== undefined) {
      setSelectedSub(initialSubcategory || null);
      setCurrentPage(1);
    }
  }, [initialSubcategory]);

  // Update SEO Meta dynamically
  useEffect(() => {
    if (category) {
      updateSeoMeta(category.nameAr, category.descriptionAr);
    }
  }, [category]);

  // Reset page number on filter changes
  const handleSubChange = (sub: string | null) => {
    setSelectedSub(sub);
    setCurrentPage(1);
    navigateTo({ page: 'category', categoryId: category.id, subcategory: sub || undefined }, true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: 'all' | 'popular' | 'latest' | 'verified') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Must belong to this category
      if (item.categoryId !== category.id) return false;

      // Must be active unless admin
      if (item.status === 'hidden' && !isAdmin) return false;

      // Subcategory filter
      if (selectedSub && item.subcategoryId !== selectedSub) return false;

      // Search Query
      if (searchQuery.trim()) {
        const matchesName = matchesQuery(item.name, searchQuery);
        const matchesSpec = matchesQuery(item.titleOrSpecialty, searchQuery);
        const matchesSubcat = matchesQuery(item.subcategoryId, searchQuery);
        const matchesAddr = matchesQuery(item.address, searchQuery);
        const matchesPh = matchesPhone(item.phone, searchQuery);
        if (!matchesName && !matchesSpec && !matchesSubcat && !matchesAddr && !matchesPh) {
          return false;
        }
      }

      // Verified Filter
      if (sortBy === 'verified' && !item.isVerified) return false;

      // Open Now Filter
      if (isOpenNowOnly) {
        const availability = getAvailabilityStatus(item.workingHours);
        if (!availability.isOpen) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.viewsCount || 0) + (b.callsCount || 0) * 2 - ((a.viewsCount || 0) + (a.callsCount || 0) * 2);
      }
      if (sortBy === 'latest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [listings, category.id, selectedSub, searchQuery, sortBy, isAdmin]);

  // Paginated slice
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredListings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredListings, currentPage]);

  const handleShareCategory = () => {
    if (navigator.share) {
      navigator.share({
        title: `${category.nameAr} - SHAHA ONE - شها ون`,
        text: `تصفح أرقام وخدمات ${category.nameAr} في شها ون:`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('تم نسخ رابط هذا القسم لمشاركته بنجاح!', 'success');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Native Top Bar with Back Button */}
      <NativeTopBar
        title={category.nameAr}
        subtitle={category.descriptionAr}
        backLabel="أقسام الدليل"
        backRoute={{ page: 'categories' }}
        category={category}
        badgeText={`${filteredListings.length} مسجل`}
        badgeVariant="blue"
        onShare={handleShareCategory}
      />

      {/* 2. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'أقسام الدليل', route: { page: 'categories' as const } },
          { label: category.nameAr, route: selectedSub ? { page: 'category' as const, categoryId: category.id } : undefined },
          ...(selectedSub ? [{ label: selectedSub }] : [])
        ]}
      />

      {/* 2. Category Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 brand-pattern opacity-[0.04] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CategoryIconBadge category={category} size="xl" variant="gradient" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {category.nameAr}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                  {filteredListings.length} مسجل
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {category.descriptionAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareCategory}
              className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95 touch-manipulation"
              title="مشاركة رابط القسم"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة القسم</span>
            </button>

            <button
              onClick={() => onOpenAddService(category.id)}
              className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة رقم هنا</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search & Subcategories Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Search input in category */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={`ابحث بالاسم أو التخصص في قسم ${category.nameAr}...`}
            className="w-full pl-10 pr-11 py-3.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white min-h-[48px]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {category.subcategories && category.subcategories.length > 0 && (
          <HorizontalScrollStrip contentClassName="flex items-center gap-2 pb-1.5" ariaLabel="التخصصات الفرعية">
            <button
              onClick={() => handleSubChange(null)}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all inline-flex items-center justify-center cursor-pointer active:scale-95 touch-manipulation ${
                selectedSub === null
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              كل التخصصات ({listings.filter(l => l.categoryId === category.id && l.status === 'active').length})
            </button>
            {category.subcategories.map((sub, idx) => {
              const count = listings.filter(l => l.categoryId === category.id && l.subcategoryId === sub && l.status === 'active').length;
              const isSelected = selectedSub === sub;
              return (
                <button
                  key={idx}
                  onClick={() => handleSubChange(isSelected ? null : sub)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all inline-flex items-center justify-center cursor-pointer active:scale-95 touch-manipulation ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-black'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {sub} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </HorizontalScrollStrip>
        )}

        {/* Sorting options */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'الكل', icon: Sparkles },
              { id: 'popular', label: 'الأكثر طلباً', icon: TrendingUp },
              { id: 'latest', label: 'الأحدث', icon: Clock },
              { id: 'verified', label: 'الموثقة فقط', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = sortBy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSortChange(tab.id as any)}
                  className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer active:scale-95 touch-manipulation ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50/50 dark:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Open Now Instant Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsOpenNowOnly(!isOpenNowOnly)}
              className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer active:scale-95 touch-manipulation border ${
                isOpenNowOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOpenNowOnly ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
              <span>مفتوح الآن</span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-400 shrink-0">
            {filteredListings.length} نتيجة
          </div>
        </div>
      </div>

      {/* 4. Listings Cards Grid or Empty State */}
      {isLoading ? (
        <ListingGridSkeleton count={6} />
      ) : paginatedListings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categoryAd && currentPage === 1 && <FeedAdCard ad={categoryAd} />}
            {paginatedListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onOpenDetails={(item) => onSelectListing(item)}
                onCopyPhone={onCopyPhone}
              />
            ))}
          </div>

          {/* 5. Pagination Bar */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredListings.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
            لم نجد أرقاماً مسجلة تطابق هذا الفلتر
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            كن أول من يضيف رقماً أو خدمة في هذا التخصص بشها ليظهر فوراً لجميع أهالي القرية.
          </p>
          <button
            onClick={() => onOpenAddService(category.id)}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة رقم في قسم {category.nameAr}</span>
          </button>
        </div>
      )}
    </div>
  );
};
