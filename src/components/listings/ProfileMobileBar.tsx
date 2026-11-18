import React from 'react';
import {
  Phone,
  MessageCircle,
  Navigation,
  Share2,
  Heart,
  QrCode
} from 'lucide-react';
import { Listing } from '../../types';

interface ProfileMobileBarProps {
  listing: Listing;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onOpenQr: () => void;
  onShare: () => void;
  recordListingCall: (id: string) => Promise<void>;
}

export const ProfileMobileBar: React.FC<ProfileMobileBarProps> = ({
  listing,
  isFavorited,
  onToggleFavorite,
  onOpenQr,
  onShare,
  recordListingCall
}) => {
  const cleanPhone = (raw: string) => {
    let clean = raw.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '20' + clean.substring(1);
    } else if (!clean.startsWith('20')) {
      clean = '20' + clean;
    }
    return clean;
  };

  const handleCall = () => {
    recordListingCall(listing.id);
    window.location.href = `tel:${listing.phone}`;
  };

  const whatsappNumber = listing.whatsapp || listing.phone;
  const whatsappUrl = `https://wa.me/${cleanPhone(whatsappNumber)}?text=${encodeURIComponent(
    `السلام عليكم، تواصلت معك عبر بروفايلك في شها ون (${listing.name}):`
  )}`;

  const hasCoords = typeof listing.latitude === 'number' && typeof listing.longitude === 'number';
  const directionsUrl = listing.googleMapsUrl
    ? listing.googleMapsUrl
    : hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.name + ' شها المنصورة')}`;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl"
      dir="rtl"
    >
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* Main Phone Call Button */}
        <button
          type="button"
          onClick={handleCall}
          className="flex-1 py-3 px-3 rounded-2xl bg-blue-600 active:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>اتصال هاتفـي</span>
        </button>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>واتسـاب</span>
        </a>

        {/* Directions / Map */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition-transform cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="الاتجاهات عبر الخريطة"
        >
          <Navigation className="w-4 h-4 text-blue-600" />
        </a>

        {/* QR Code */}
        <button
          type="button"
          onClick={onOpenQr}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition-transform cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="كود QR"
        >
          <QrCode className="w-4 h-4 text-purple-600" />
        </button>

        {/* Favorite */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`p-3 rounded-2xl transition-transform active:scale-95 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isFavorited
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
          title={isFavorited ? 'في المفضلة' : 'حفظ في المفضلة'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-500' : 'text-slate-400'}`} />
        </button>
      </div>
    </div>
  );
};
