import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  Star,
  Eye,
  PhoneCall,
  Share2,
  Maximize2,
  UserCheck,
  Store,
  Building2,
  Building,
  Briefcase,
  MapPin,
  Clock,
  Heart,
  Edit3,
  Camera
} from 'lucide-react';
import { Listing, Category, ListingEntityType } from '../../types';
import { CategoryIconBadge } from '../common/CategoryIcon';
import { VerificationBadgesList } from '../common/VerificationBadgesList';
import { IconicVerifiedBadge } from '../common/IconicVerifiedBadge';

interface ProfileHeaderProps {
  listing: Listing;
  category?: Category;
  entityType: ListingEntityType;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onOpenLightbox: (index: number) => void;
  onOpenReport: () => void;
  canEdit?: boolean;
  onOpenEditModal?: () => void;
}

function getMonogramInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ش';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + ' ' + parts[1][0]).toUpperCase();
}

const ENTITY_CONFIG: Record<
  ListingEntityType,
  { label: string; icon: React.ElementType; gradient: string; coverGradient: string }
> = {
  person: {
    label: 'ملف شخصي ومهني',
    icon: UserCheck,
    gradient: 'from-blue-600 via-indigo-600 to-sky-700',
    coverGradient: 'from-blue-900 via-indigo-900 to-slate-900'
  },
  shop: {
    label: 'محل ونشاط تجاري',
    icon: Store,
    gradient: 'from-amber-600 via-orange-600 to-amber-700',
    coverGradient: 'from-amber-950 via-slate-900 to-orange-950'
  },
  company: {
    label: 'شركة ومؤسسة',
    icon: Building,
    gradient: 'from-indigo-600 via-purple-700 to-blue-800',
    coverGradient: 'from-slate-900 via-indigo-950 to-slate-950'
  },
  place: {
    label: 'مكان ومرفق عام',
    icon: Building2,
    gradient: 'from-emerald-600 via-teal-700 to-emerald-800',
    coverGradient: 'from-emerald-950 via-slate-900 to-teal-950'
  },
  service: {
    label: 'خدمة وحرفة معتمدة',
    icon: Briefcase,
    gradient: 'from-teal-600 via-cyan-700 to-blue-800',
    coverGradient: 'from-teal-950 via-slate-900 to-sky-950'
  }
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  listing,
  category,
  entityType,
  isFavorited,
  onToggleFavorite,
  onOpenLightbox,
  canEdit = false,
  onOpenEditModal
}) => {
  const config = ENTITY_CONFIG[entityType] || ENTITY_CONFIG.service;
  const EntityIcon = config.icon;

  return (
    <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden" dir="rtl">
      
      {/* 1. Cover Banner */}
      <div className="relative w-full h-36 sm:h-52 overflow-hidden bg-slate-950">
        {listing.coverImageUrl ? (
          <img
            src={listing.coverImageUrl}
            alt={`غلاف ${listing.name}`}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r ${config.coverGradient} opacity-95 relative overflow-hidden`}>
            {/* Geometric watermark pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 border border-white/20">
                SHAHA ONE • شَهَا ون
              </span>
            </div>
          </div>
        )}

        {/* Quick Edit Cover Button (Owners & Admins) */}
        {canEdit && onOpenEditModal && (
          <button
            type="button"
            onClick={onOpenEditModal}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 text-xs font-bold transition-all shadow-lg cursor-pointer"
            title="تعديل الغلاف والصورة الشخصية"
          >
            <Camera className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">تعديل الغلاف</span>
          </button>
        )}

        {/* Favorite Floating Button on Cover */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isFavorited
              ? 'bg-rose-500 text-white shadow-rose-500/30'
              : 'bg-black/30 hover:bg-black/50 text-white border border-white/20'
          }`}
          title={isFavorited ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-white' : 'text-white'}`} />
        </button>
      </div>

      {/* 2. Main Profile Content (Avatar, Name, Badges, Metrics) */}
      <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
          
          {/* Avatar / Storefront Thumbnail */}
          <div className="relative">
            {listing.imageUrl ? (
              <button
                type="button"
                onClick={() => onOpenLightbox(0)}
                className={`relative overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-white dark:bg-slate-800 group cursor-pointer active:scale-95 transition-all ${
                  entityType === 'person'
                    ? 'w-28 h-28 sm:w-36 sm:h-36 rounded-full'
                    : 'w-28 h-28 sm:w-36 sm:h-36 rounded-3xl'
                }`}
                title="اضغط لتكبير الصورة"
              >
                <img
                  src={listing.imageUrl}
                  alt={listing.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-white opacity-80 group-hover:opacity-100" />
                </div>
              </button>
            ) : (
              <div
                className={`flex items-center justify-center font-black text-white shadow-2xl border-4 border-white dark:border-slate-900 select-none ${
                  entityType === 'person'
                    ? `w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br ${config.gradient} text-3xl sm:text-4xl`
                    : `w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br ${config.gradient} text-3xl sm:text-4xl`
                }`}
              >
                <span>{getMonogramInitials(listing.name)}</span>
              </div>
            )}

            {/* Entity Badge or Edit Badge over Avatar corner */}
            {canEdit && onOpenEditModal ? (
              <button
                type="button"
                onClick={onOpenEditModal}
                className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-blue-600 hover:bg-blue-700 border-2 border-white dark:border-slate-900 shadow-lg text-white transition-transform active:scale-90 cursor-pointer"
                title="تعديل الصورة الشخصية والغلاف"
              >
                <Camera className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 shadow-lg text-slate-700 dark:text-slate-200">
                <EntityIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>

          {/* Quick Metrics Bar on Header */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-stretch sm:self-auto justify-start sm:justify-end">
            {/* Edit Profile Action Button if Owner or Admin */}
            {canEdit && onOpenEditModal && (
              <button
                type="button"
                onClick={onOpenEditModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                title="تعديل بيانات الملف التعريفي والغلاف وروابط التواصل"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل الملف</span>
              </button>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-black">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{listing.rating ? listing.rating.toFixed(1) : '5.0'}</span>
              <span className="text-[10px] text-slate-400 font-normal">({listing.ratingsCount || 1} تقييم)</span>
            </div>

            {/* Views Metric */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{listing.viewsCount || 0}</span>
              <span className="text-[10px] text-slate-400">مشاهدة</span>
            </div>

            {/* Calls Metric */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              <PhoneCall className="w-4 h-4 text-blue-500" />
              <span>{listing.callsCount || 0}</span>
              <span className="text-[10px] text-slate-400">اتصال</span>
            </div>
          </div>
        </div>

        {/* 3. Name, Specialty, Badges */}
        <div className="space-y-3">
          {/* Metadata Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <EntityIcon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </span>

            {category && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                <CategoryIconBadge category={category} size="sm" />
                <span>{category.nameAr}</span>
              </span>
            )}

            {listing.subcategoryId && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {listing.subcategoryId}
              </span>
            )}

            {listing.isFeatured && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مميز بالصدارة</span>
              </span>
            )}

            {listing.deliveryAvailable && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>توصيل للمنازل</span>
              </span>
            )}
          </div>

          {/* Heading with inline Verified Badge */}
          <div className="space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>{listing.name}</span>
              <IconicVerifiedBadge listing={listing} size="md" />
            </h1>

            {listing.titleOrSpecialty && (
              <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-bold">
                {listing.titleOrSpecialty}
              </p>
            )}
          </div>

          {/* Dynamic Verification Badges Row */}
          <div className="pt-0.5">
            <VerificationBadgesList
              badgeIds={listing.verificationBadges}
              isLegacyVerified={listing.isVerified}
              history={listing.verificationHistory}
              size="md"
              showLabel={true}
            />
          </div>

          {/* Address & Hours quick summary */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{listing.address || 'شها، مركز المنصورة'}</span>
            </div>

            {listing.workingHours && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{listing.workingHours}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
