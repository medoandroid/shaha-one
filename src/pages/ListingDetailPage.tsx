import React, { useState, useEffect, useMemo } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NativeTopBar } from '../components/common/NativeTopBar';
import { ListingCard } from '../components/listings/ListingCard';
import { QrCodeModal } from '../components/common/QrCodeModal';
import { ImageLightboxModal } from '../components/common/ImageLightboxModal';
import { Listing, Review, ListingEntityType } from '../types';
import { navigateTo, updateSeoMeta } from '../utils/navigation';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { ProfileHeader } from '../components/listings/ProfileHeader';
import { ProfileContactSection } from '../components/listings/ProfileContactSection';
import { ProfileOverviewSection } from '../components/listings/ProfileOverviewSection';
import { ProfileMapSection } from '../components/listings/ProfileMapSection';
import { ProfileHoursSection } from '../components/listings/ProfileHoursSection';
import { ProfileGallerySection } from '../components/listings/ProfileGallerySection';
import { ProfileReviewsSection } from '../components/listings/ProfileReviewsSection';
import { ProfileMobileBar } from '../components/listings/ProfileMobileBar';
import { recordRecentlyViewed } from '../components/common/RecentlyViewedBar';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import {
  FileText,
  PhoneCall,
  MapPin,
  Clock,
  Images,
  Star,
  AlertTriangle,
  ChevronRight,
  Share2,
  Sparkles
} from 'lucide-react';

interface ListingDetailPageProps {
  listingId: string;
  onCopyPhone: (phone: string) => void;
  onOpenReport: (listing: Listing) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// Infer entity type if not explicitly set
function resolveEntityType(listing: Listing): ListingEntityType {
  if (listing.entityType) return listing.entityType;
  const personCats = ['doctors', 'teachers', 'craftsmen', 'lawyers'];
  const shopCats = ['stores', 'pharmacies', 'restaurants'];
  const placeCats = ['schools', 'emergency', 'charity', 'banks'];
  if (personCats.includes(listing.categoryId)) return 'person';
  if (shopCats.includes(listing.categoryId)) return 'shop';
  if (placeCats.includes(listing.categoryId)) return 'place';
  return 'service';
}

type ProfileTab = 'overview' | 'contact' | 'location' | 'hours' | 'gallery' | 'reviews';

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({
  listingId,
  onCopyPhone,
  onOpenReport,
  onShowToast
}) => {
  const {
    listings,
    categories,
    reviews,
    submitReview,
    recordListingCall,
    recordListingView,
    recordListingShare,
    currentUser,
    isAdmin,
    updateListingProfile
  } = useDirectory();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Edit Profile Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Favorites state
  const [favorited, setFavorited] = useState(() => isFavorite(listingId));

  // Sync favorites on external update
  useEffect(() => {
    setFavorited(isFavorite(listingId));
    const handleFavUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ listingId: string; isFavorite: boolean }>;
      if (custom.detail?.listingId === listingId) {
        setFavorited(custom.detail.isFavorite);
      }
    };
    window.addEventListener('shaha_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('shaha_favorites_updated', handleFavUpdate);
  }, [listingId]);

  const handleToggleFavorite = () => {
    const nextState = toggleFavorite(listingId);
    setFavorited(nextState);
    if (nextState) {
      onShowToast('تمت إضافة الخدمة إلى قائمة مفضلتك', 'success');
    } else {
      onShowToast('تمت إزالة الخدمة من المفضلة', 'info');
    }
  };

  // Review Form state
  const [userName, setUserName] = useState(currentUser?.displayName || '');
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  // Find Listing
  const listing = useMemo(() => {
    return listings.find(l => l.id === listingId);
  }, [listings, listingId]);

  // Find Category
  const category = useMemo(() => {
    if (!listing) return undefined;
    return categories.find(c => c.id === listing.categoryId);
  }, [categories, listing]);

  // Record view on mount
  useEffect(() => {
    if (listing?.id) {
      recordListingView(listing.id);
      recordRecentlyViewed(listing);
    }
  }, [listing?.id]);

  // Update dynamic SEO meta
  useEffect(() => {
    if (listing) {
      const typeLabel = category?.nameAr || 'خدمة بشها ون';
      const pageTitle = `${listing.name} - ${listing.titleOrSpecialty || typeLabel} | SHAHA ONE - شها ون`;
      const desc = listing.description
        ? listing.description.slice(0, 160)
        : `رقم هاتف وعنوان ${listing.name} (${listing.titleOrSpecialty || typeLabel}) في منصة شها ون، مركز المنصورة.`;
      updateSeoMeta(pageTitle, desc);
    }
  }, [listing, category]);

  // Photos compilation
  const allPhotos = useMemo(() => {
    if (!listing) return [];
    const photos: string[] = [];
    if (listing.imageUrl) photos.push(listing.imageUrl);
    if (listing.coverImageUrl && !photos.includes(listing.coverImageUrl)) photos.push(listing.coverImageUrl);
    if (listing.photos && listing.photos.length > 0) {
      listing.photos.forEach(p => {
        if (!photos.includes(p)) photos.push(p);
      });
    }
    return photos;
  }, [listing]);

  // Filter approved reviews + current user pending
  const visibleReviews = useMemo(() => {
    return reviews.filter(r => {
      if (r.listingId !== listingId) return false;
      const status = r.status || 'approved';
      if (status === 'approved') return true;
      if (currentUser && r.userId === currentUser.uid) return true;
      return false;
    });
  }, [reviews, listingId, currentUser]);

  // Related listings in the same category
  const relatedListings = useMemo(() => {
    if (!listing) return [];
    return listings
      .filter(l => l.categoryId === listing.categoryId && l.id !== listing.id && l.status === 'active')
      .slice(0, 3);
  }, [listings, listing]);

  const handleShare = () => {
    if (!listing) return;
    recordListingShare(listing.id);
    const url = `${window.location.origin}${window.location.pathname}?listing=${listing.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${listing.name} - شها ون`,
        text: `رقم وتفاصيل ${listing.name} في شها ون:`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      onShowToast('تم نسخ رابط البروفايل بنجاح!', 'success');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    if (!userName.trim() || !userComment.trim()) {
      onShowToast('يُرجى كتابة الاسم والتعليق', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const success = await submitReview({
        listingId: listing.id,
        userName: userName.trim(),
        userId: currentUser?.uid,
        rating: userRating,
        comment: userComment.trim()
      });
      if (success) {
        setUserComment('');
        onShowToast('شكراً لك! تم إرسال تقييمك بنجاح وهو قيد المراجعة', 'success');
        setActiveTab('reviews');
      }
    } catch {
      onShowToast('تعذر إرسال التقييم حالياً', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!listing) {
    return (
      <div className="space-y-6" dir="rtl">
        <Breadcrumbs items={[{ label: 'الخدمات والأرقام' }]} />
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            عذراً، لم يتم العثور على هذا الملف أو الخدمة
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            قد يكون الرقم قد تم تعديله أو حذفه من منصة شها ون.
          </p>
          <button
            onClick={() => navigateTo({ page: 'home' })}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const entityType = resolveEntityType(listing);

  // Tabs definitions
  const tabs: { id: ProfileTab; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'overview', label: 'نبذة وخدمات', icon: FileText },
    { id: 'contact', label: 'التواصل المباشر', icon: PhoneCall },
    { id: 'location', label: 'الموقع والخريطة', icon: MapPin },
    { id: 'hours', label: 'مواعيد العمل', icon: Clock },
    { id: 'gallery', label: 'الصور والأعمال', icon: Images, badge: allPhotos.length > 0 ? allPhotos.length : undefined },
    { id: 'reviews', label: 'التقييمات', icon: Star, badge: visibleReviews.length > 0 ? visibleReviews.length : undefined }
  ];

  const canEdit = Boolean(
    isAdmin || (currentUser && listing.ownerUserId && listing.ownerUserId === currentUser.uid)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 sm:pb-8" dir="rtl">
      
      {/* 1. Native Top Bar */}
      <NativeTopBar
        title={listing.name}
        subtitle={listing.titleOrSpecialty || listing.address}
        backLabel={category?.nameAr || 'رجوع'}
        backRoute={category ? { page: 'category', categoryId: category.id } : { page: 'categories' }}
        category={category || undefined}
        badgeText={listing.isVerified ? 'موثق رسمياً' : undefined}
        badgeVariant="emerald"
        onShare={handleShare}
      />

      {/* Owner / Admin Management Notice Banner */}
      {canEdit && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {isAdmin ? 'صلاحية الإشراف الكامل على هذا البروفايل' : 'أنت المالك المعتمد لهذا الملف التعريفي'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                يمكنك تحديث صورة الغلاف، اللوجو، روابط التواصل، وساعات العمل دون الحاجة للرجوع للإدارة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer shrink-0 text-center"
          >
            تعديل الغلاف والبيانات
          </button>
        </div>
      )}

      {/* 2. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'أقسام الدليل', route: { page: 'categories' as const } },
          ...(category ? [{ label: category.nameAr, route: { page: 'category' as const, categoryId: category.id } }] : []),
          ...(listing.subcategoryId && category ? [{ label: listing.subcategoryId, route: { page: 'category' as const, categoryId: category.id, subcategory: listing.subcategoryId } }] : []),
          { label: listing.name }
        ]}
      />

      {/* 3. Hero Profile Header */}
      <ProfileHeader
        listing={listing}
        category={category}
        entityType={entityType}
        isFavorited={favorited}
        onToggleFavorite={handleToggleFavorite}
        canEdit={canEdit}
        onOpenEditModal={() => setIsEditProfileOpen(true)}
        onOpenLightbox={(idx) => {
          setLightboxInitialIndex(idx);
          setIsLightboxOpen(true);
        }}
        onOpenReport={() => onOpenReport(listing)}
      />

      {/* 4. Navigation Tabs Segments */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Dynamic Tab Content Panels */}
      <div className="transition-all">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ProfileOverviewSection listing={listing} category={category} />
            <ProfileContactSection
              listing={listing}
              isFavorited={favorited}
              onToggleFavorite={handleToggleFavorite}
              onOpenQr={() => setIsQrModalOpen(true)}
              onOpenReport={() => onOpenReport(listing)}
              onShare={handleShare}
              onShowToast={onShowToast}
              recordListingCall={recordListingCall}
            />
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <ProfileContactSection
              listing={listing}
              isFavorited={favorited}
              onToggleFavorite={handleToggleFavorite}
              onOpenQr={() => setIsQrModalOpen(true)}
              onOpenReport={() => onOpenReport(listing)}
              onShare={handleShare}
              onShowToast={onShowToast}
              recordListingCall={recordListingCall}
            />
            <ProfileMapSection listing={listing} onShowToast={onShowToast} />
          </div>
        )}

        {activeTab === 'location' && (
          <ProfileMapSection listing={listing} onShowToast={onShowToast} />
        )}

        {activeTab === 'hours' && (
          <ProfileHoursSection listing={listing} />
        )}

        {activeTab === 'gallery' && (
          <ProfileGallerySection
            listing={listing}
            photos={allPhotos}
            onOpenLightbox={(idx) => {
              setLightboxInitialIndex(idx);
              setIsLightboxOpen(true);
            }}
          />
        )}

        {activeTab === 'reviews' && (
          <ProfileReviewsSection
            listing={listing}
            reviews={visibleReviews}
            onSubmitReview={handleSubmitReview}
            userName={userName}
            setUserName={setUserName}
            userRating={userRating}
            setUserRating={setUserRating}
            userComment={userComment}
            setUserComment={setUserComment}
            isSubmittingReview={isSubmittingReview}
          />
        )}
      </div>

      {/* 6. Related Listings in same Category */}
      {relatedListings.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              خدمات وأرقام أخرى في قسم {category?.nameAr || 'الدليل'}
            </h3>
            {category && (
              <button
                type="button"
                onClick={() => navigateTo({ page: 'category', categoryId: category.id })}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedListings.map(relListing => (
              <ListingCard
                key={relListing.id}
                listing={relListing}
                onOpenDetails={(l: Listing) => navigateTo({ page: 'listing', listingId: l.id })}
                onCopyPhone={onCopyPhone}
              />
            ))}
          </div>
        </div>
      )}

      {/* 7. Sticky Mobile Action Bar */}
      <ProfileMobileBar
        listing={listing}
        isFavorited={favorited}
        onToggleFavorite={handleToggleFavorite}
        onOpenQr={() => setIsQrModalOpen(true)}
        onShare={handleShare}
        recordListingCall={recordListingCall}
      />

      {/* 8. QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        listing={listing}
        onShowToast={onShowToast}
      />

      {/* 9. Lightbox Photo Gallery Modal */}
      {allPhotos.length > 0 && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          images={allPhotos}
          initialIndex={lightboxInitialIndex}
          onClose={() => setIsLightboxOpen(false)}
          title={listing.name}
        />
      )}

      {/* 10. Edit Profile Modal (Owner & Admin) */}
      {canEdit && isEditProfileOpen && listing && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          listing={listing}
          onSave={async (updates) => {
            return updateListingProfile(listing.id, updates);
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
