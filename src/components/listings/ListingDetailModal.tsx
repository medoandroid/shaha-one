import React, { useState, useMemo } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Copy,
  Share2,
  AlertTriangle,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Building,
  Truck,
  Send,
  Eye,
  Sparkles,
  QrCode,
  Maximize2,
  ExternalLink,
  Camera,
  UserCheck,
  Store,
  Building2,
  Images
} from 'lucide-react';
import { Listing, Review, ListingEntityType } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { QrCodeModal } from '../common/QrCodeModal';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { VerificationBadgesList } from '../common/VerificationBadgesList';
import { IconicVerifiedBadge } from '../common/IconicVerifiedBadge';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onCopyPhone: (phone: string) => void;
  onOpenReport: (listing: Listing) => void;
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

function getMonogramInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ش';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + ' ' + parts[1][0]).toUpperCase();
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onCopyPhone,
  onOpenReport
}) => {
  const {
    reviews,
    verificationBadges,
    submitReview,
    recordListingCall,
    recordListingShare,
    currentUser
  } = useDirectory();

  const [ratingVal, setRatingVal] = useState(5);
  const [userName, setUserName] = useState(currentUser?.displayName || '');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  if (!listing) return null;

  const entityType = resolveEntityType(listing);

  // Collect all photos
  const allPhotos: string[] = [];
  if (listing.imageUrl) allPhotos.push(listing.imageUrl);
  if (listing.photos && listing.photos.length > 0) {
    listing.photos.forEach(p => {
      if (!allPhotos.includes(p)) allPhotos.push(p);
    });
  }

  // Filter approved reviews
  const visibleReviews = reviews.filter(r => {
    if (r.listingId !== listing.id) return false;
    const status = r.status || 'approved';
    if (status === 'approved') return true;
    if (currentUser && r.userId === currentUser.uid) return true;
    return false;
  });

  const handleCall = () => {
    recordListingCall(listing.id);
  };

  const handleWhatsApp = () => {
    const phone = listing.whatsapp || listing.phone;
    let cleanNumber = phone.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '20' + cleanNumber.substring(1);
    } else if (!cleanNumber.startsWith('20')) {
      cleanNumber = '20' + cleanNumber;
    }
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleShare = () => {
    recordListingShare(listing.id);
    const deepLink = `${window.location.origin}${window.location.pathname}?listing=${listing.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${listing.name} - SHAHA ONE - شها ون`,
        text: `${listing.name} (${listing.titleOrSpecialty || ''}) - هاتف: ${listing.phone} - شها، مركز المنصورة`,
        url: deepLink
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(deepLink);
      onCopyPhone(`تم نسخ رابط المشاركة لخدمة ${listing.name}`);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    const success = await submitReview({
      listingId: listing.id,
      userName: userName.trim(),
      userId: currentUser?.uid,
      rating: ratingVal,
      comment: reviewComment.trim()
    });

    setIsSubmittingReview(false);
    if (success) {
      setReviewSuccess(true);
      setReviewComment('');
      setTimeout(() => setReviewSuccess(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="relative p-6 bg-gradient-to-l from-blue-700 via-sky-600 to-blue-900 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            {listing.imageUrl ? (
              <button
                type="button"
                onClick={() => {
                  setLightboxInitialIndex(0);
                  setIsLightboxOpen(true);
                }}
                className={`relative overflow-hidden shrink-0 border-2 border-white/40 shadow-xl bg-white/10 group cursor-pointer active:scale-95 transition-all ${
                  entityType === 'person' ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-full' : 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl'
                }`}
                title="اضغط لتكبير الصورة"
              >
                <img
                  src={listing.imageUrl}
                  alt={listing.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white opacity-80 group-hover:opacity-100" />
                </div>
              </button>
            ) : (
              <div className={`flex items-center justify-center text-white text-2xl font-black shrink-0 border border-white/20 shadow-inner select-none ${
                entityType === 'person' ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-md' : 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md'
              }`}>
                {getMonogramInitials(listing.name)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {listing.isFeatured && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>خدمة مميزة</span>
                  </span>
                )}
                {listing.deliveryAvailable && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>توصيل منازل</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-100 border border-emerald-400/30 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>متاح للاتصال والاستقبال الآن</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug flex items-center gap-2 flex-wrap">
                <span>{listing.name}</span>
                <IconicVerifiedBadge listing={listing} size="sm" />
              </h2>

              {listing.titleOrSpecialty && (
                <p className="text-sky-200 font-semibold text-sm mt-0.5">
                  {listing.titleOrSpecialty}
                </p>
              )}

              {/* Dynamic Verification Badges */}
              <div className="mt-2">
                <VerificationBadgesList
                  badgeIds={listing.verificationBadges}
                  isLegacyVerified={listing.isVerified}
                  history={listing.verificationHistory}
                  size="sm"
                  showLabel={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {/* Quick Actions */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <a
                href={`tel:${listing.phone}`}
                onClick={handleCall}
                className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                <span>اتصال مباشر</span>
              </a>

              <button
                onClick={handleWhatsApp}
                className="py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>محادثة واتساب</span>
              </button>

              <button
                onClick={() => onCopyPhone(listing.phone)}
                className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>نسخ الرقم</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-sky-600" />
                <span>مشاركة</span>
              </button>
            </div>

            {/* Smart QR Trigger */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 active:scale-98 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-purple-200 dark:border-purple-800"
            >
              <QrCode className="w-4 h-4 text-purple-600" />
              <span>عرض وتخصيص كارت QR الذكي للطباعة أو المشاركة الفورية</span>
            </button>
          </div>

          {/* Contact Numbers Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              أرقام التواصل والاتصال
            </h4>
            <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">الرقم الرئيسي:</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{listing.phone}</span>
            </div>
            {listing.whatsapp && (
              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">رقم الواتساب:</span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{listing.whatsapp}</span>
              </div>
            )}
            {listing.secondaryPhone && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">رقم إضافي / عيادة:</span>
                <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">{listing.secondaryPhone}</span>
              </div>
            )}
          </div>

          {/* Location & Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <MapPin className="w-4 h-4" />
                <span>العنوان في شها</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {listing.address}
              </p>
              {listing.googleMapsUrl && (
                <a
                  href={listing.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-1"
                >
                  <span>عرض الموقع على خرائط جوجل</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>مواعيد العمل والاستقبال</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {listing.workingHours || 'يومياً خلال ساعات العمل المعتادة'}
              </p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                نبذة وتفاصيل الخدمة
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {listing.description}
              </p>
            </div>
          )}

          {/* Photo Gallery if photos > 1 */}
          {allPhotos.length > 1 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Images className="w-4 h-4 text-blue-600" />
                <span>معرض الصور ({allPhotos.length})</span>
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLightboxInitialIndex(idx);
                      setIsLightboxOpen(true);
                    }}
                    className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer relative shadow-2xs"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews & Ratings Section */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>التقييمات وتجارب أهالي شها ({visibleReviews.length})</span>
              </h4>
              <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <span>متوسط التقييم:</span>
                <span>{listing.rating || 5.0} / 5</span>
              </div>
            </div>

            {/* Existing Reviews */}
            {visibleReviews.length > 0 ? (
              <div className="space-y-3">
                {visibleReviews.map(rev => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{rev.userName}</span>
                        {rev.status === 'pending' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            قيد المراجعة الإدارية
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">كن أول من يضيف تقييماً وتجربة لهذه الخدمة في شها.</p>
            )}

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                أضف تقييمك ورأيك (تخضع للمراجعة لمكافحة التقييمات الوهمية):
              </span>

              {/* Star Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">اختر التقييم:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= ratingVal
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="اسمك الكريم..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <textarea
                required
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="اكتب تجربتك أو مراجعتك بكل أمانة لمساعدة أهالي شها..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center justify-between">
                {reviewSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم إرسال تقييمك بنجاح وهو قيد المراجعة</span>
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Report Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">هل لاحظت خطأ في الرقم أو تغير النشاط؟</span>
            <button
              onClick={() => {
                onClose();
                onOpenReport(listing);
              }}
              className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>الإبلاغ عن بيانات غير صحيحة</span>
            </button>
          </div>

        </div>

      </div>

      {/* QR Code Branded Modal */}
      {isQrModalOpen && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          listing={listing}
          onShowToast={(msg) => onCopyPhone(msg)}
        />
      )}

      {/* Photo Gallery Lightbox */}
      {isLightboxOpen && allPhotos.length > 0 && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={allPhotos}
          initialIndex={lightboxInitialIndex}
          title={listing.name}
        />
      )}
    </div>
  );
};
