import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  MessageCircle,
  Mail,
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Heart,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { Listing, ListingSocialLink } from '../../types';
import { SOCIAL_PLATFORMS, detectPlatformFromUrl, SocialPlatformKey } from '../../utils/socialPlatforms';

interface ProfileContactSectionProps {
  listing: Listing;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onOpenQr: () => void;
  onOpenReport: () => void;
  onShare: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  recordListingCall: (id: string) => Promise<void>;
}

export const ProfileContactSection: React.FC<ProfileContactSectionProps> = ({
  listing,
  isFavorited,
  onToggleFavorite,
  onOpenQr,
  onOpenReport,
  onShare,
  onShowToast,
  recordListingCall
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedSecondary, setCopiedSecondary] = useState(false);

  const cleanPhone = (raw: string) => {
    let clean = raw.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '20' + clean.substring(1);
    } else if (!clean.startsWith('20')) {
      clean = '20' + clean;
    }
    return clean;
  };

  const handleCall = (number: string) => {
    recordListingCall(listing.id);
    window.location.href = `tel:${number}`;
  };

  const handleCopy = (text: string, isSec = false) => {
    navigator.clipboard.writeText(text);
    if (isSec) {
      setCopiedSecondary(true);
      setTimeout(() => setCopiedSecondary(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
    onShowToast(`تم نسخ الرقم (${text}) بنجاح`, 'success');
  };

  const whatsappNumber = listing.whatsapp || listing.phone;
  const whatsappUrl = `https://wa.me/${cleanPhone(whatsappNumber)}?text=${encodeURIComponent(
    `السلام عليكم ورحمة الله، تواصلت معك عبر بروفايلك في شها ون (${listing.name}):`
  )}`;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Primary Calling & WhatsApp Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                التواصل المباشر
              </h3>
              <p className="text-xs text-slate-500">أرقام هواتف وروابط معتمدة ومباشرة داخل قرية شها</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>متاح الآن</span>
          </span>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Main Call Action (Only if listing.phone is present) */}
          {Boolean(listing.phone) && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-100">رقم الهاتف الأساسي</span>
              <button
                type="button"
                onClick={() => handleCopy(listing.phone)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="نسخ الرقم"
              >
                {copiedPhone ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xl sm:text-2xl font-black font-mono tracking-wider dir-ltr text-right">
                {listing.phone}
              </p>
              <p className="text-[11px] text-blue-100/90 font-medium">
                اضغط للاتصال المباشر عبر شبكة الهاتف
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCall(listing.phone)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer min-h-[44px]"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>اتصال هاتفـي الآن</span>
            </button>
          </div>
          )}

          {/* WhatsApp Direct Action (Only if whatsapp or phone exists) */}
          {Boolean(whatsappNumber) && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-100">المحادثة عبر واتساب</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                رد فوري
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xl sm:text-2xl font-black font-mono tracking-wider dir-ltr text-right">
                {whatsappNumber}
              </p>
              <p className="text-[11px] text-emerald-100/90 font-medium">
                محادثة فورية مشفرة للاستفسار والطلب
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>محادثة واتساب سريعة</span>
            </a>
          </div>
          )}
        </div>

        {/* Secondary Phone if available */}
        {listing.secondaryPhone && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">رقم هاتف إضافي / طوارئ</span>
                <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200 dir-ltr inline-block">
                  {listing.secondaryPhone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(listing.secondaryPhone!, true)}
                className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-xs font-bold cursor-pointer"
                title="نسخ"
              >
                {copiedSecondary ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => handleCall(listing.secondaryPhone!)}
                className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>اتصال</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Online & Social Presence (Aggregated and deduplicated across all platforms) */}
      {(() => {
        const links: ListingSocialLink[] = listing.socialLinks ? [...listing.socialLinks] : [];
        const seenUrls = new Set(links.map(l => l.url.trim().toLowerCase()));

        const tryAdd = (url: string | undefined, title: string, platformKey: SocialPlatformKey) => {
          if (!url || !url.trim()) return;
          const clean = url.trim();
          if (!seenUrls.has(clean.toLowerCase())) {
            seenUrls.add(clean.toLowerCase());
            links.push({ title, url: clean, icon: platformKey });
          }
        };

        tryAdd(listing.websiteUrl, 'الموقع الإلكتروني', 'website');
        tryAdd(listing.facebookUrl, 'فيسبوك', 'facebook');
        tryAdd(listing.instagramUrl, 'انستجرام', 'instagram');
        tryAdd(listing.telegramUrl, 'تيليجرام', 'telegram');
        tryAdd(listing.tiktokUrl, 'تيك توك', 'tiktok');
        tryAdd(listing.youtubeUrl, 'يوتيوب', 'youtube');
        tryAdd(listing.linkedinUrl, 'لينكد إن', 'linkedin');

        const hasAnyLinks = links.length > 0 || Boolean(listing.email);
        if (!hasAnyLinks) return null;

        return (
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  الروابط وحسابات التواصل ({links.length + (listing.email ? 1 : 0)})
                </h3>
              </div>
              <span className="text-xs text-slate-400">حسابات رسمية معتمدة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Email if present */}
              {listing.email && (
                <a
                  href={`mailto:${listing.email}?subject=${encodeURIComponent(`استفسار عبر شها ون - ${listing.name}`)}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">البريد الإلكتروني</span>
                      <span className="text-[10px] text-slate-400 block truncate">{listing.email}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                </a>
              )}

              {/* Dynamic Social Links */}
              {links.map((lnk, idx) => {
                const platformKey = detectPlatformFromUrl(lnk.url);
                const platformConfig = SOCIAL_PLATFORMS[platformKey] || SOCIAL_PLATFORMS.website;

                return (
                  <a
                    key={idx}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 transition-all hover:scale-[1.01] group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl ${platformConfig.bgColor} text-white flex items-center justify-center shrink-0 font-black text-xs shadow-sm`}>
                        {platformConfig.nameAr.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {lnk.title || platformConfig.nameAr.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate dir-ltr text-right">
                          {lnk.url.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Quick Utility Actions Bar (Share, QR, Favorite, Report) */}
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer min-h-[44px] ${
              isFavorited
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-white' : 'text-rose-500'}`} />
            <span>{isFavorited ? 'في المفضلة' : 'حفظ في المفضلة'}</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer min-h-[44px]"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>مشاركة البروفايل</span>
          </button>

          <button
            type="button"
            onClick={onOpenQr}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer min-h-[44px]"
          >
            <QrCode className="w-4 h-4 text-purple-600" />
            <span>كود QR الذكي</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenReport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>إبلاغ عن بيانات غير دقيقة</span>
        </button>
      </div>
    </div>
  );
};
