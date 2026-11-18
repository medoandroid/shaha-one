import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Compass,
  AlertCircle,
  Eye,
  Layers
} from 'lucide-react';
import { Listing } from '../../types';

interface ProfileMapSectionProps {
  listing: Listing;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// Default Shaha Village center coordinates in Mansoura, Egypt
const DEFAULT_SHAHA_LAT = 31.0506;
const DEFAULT_SHAHA_LNG = 31.4246;

export const ProfileMapSection: React.FC<ProfileMapSectionProps> = ({
  listing,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const hasCoords = typeof listing.latitude === 'number' && typeof listing.longitude === 'number';
  const lat = hasCoords ? listing.latitude! : DEFAULT_SHAHA_LAT;
  const lng = hasCoords ? listing.longitude! : DEFAULT_SHAHA_LNG;

  // Determine if location should be displayed
  const isMapEnabled = listing.showMap !== false;

  // Directions destination
  const directionsUrl = listing.googleMapsUrl
    ? listing.googleMapsUrl
    : hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.name + ' شها المنصورة')}`;

  // OpenStreetMap embed URL with bounding box around coordinates
  const delta = 0.005;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  const handleCopyLocation = () => {
    const textToCopy = `${listing.address} (شها، مركز المنصورة)${hasCoords ? ` - إحداثيات: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onShowToast('تم نسخ تفاصيل العنوان والموقع بنجاح!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isMapEnabled) {
    return (
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-3" dir="rtl">
        <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">الموقع الجغرافي خاص</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          تم حجب الخريطة حفاظاً على خصوصية جهة الاتصال بناءً على الرغبة. يرجى التواصل هاتفياً لتحديد موعد الحضور.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Location Details Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  العنوان والموقع الجغرافي
                </h3>
                {hasCoords ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>موقع محدد ومطابق</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <span>نطاق قرية شها</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                {listing.address || 'شها، مركز المنصورة، محافظة الدقهلية'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={handleCopyLocation}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
              title="نسخ العنوان"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'تم النسخ' : 'نسخ العنوان'}</span>
            </button>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer min-h-[44px]"
            >
              <Navigation className="w-4 h-4" />
              <span>الاتجاهات والوصول</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Interactive Map Embed */}
        <div className="relative w-full h-72 sm:h-84 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner group">
          <iframe
            title={`خريطة موقع ${listing.name}`}
            src={osmEmbedUrl}
            className="w-full h-full border-0 filter dark:contrast-110 dark:brightness-95"
            loading="lazy"
            onLoad={() => setIsMapLoaded(true)}
          />

          {/* Live Overlay Badge */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md flex items-center gap-2 pointer-events-none text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{listing.name}</span>
          </div>

          {/* Floating Navigation Shortcut */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <a
              href={`https://maps.google.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-xs font-black text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-md transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>عرض عبر Google Maps</span>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>مركز المنصورة • محافظة الدقهلية • جمهورية مصر العربية</span>
          </div>
          {hasCoords && (
            <span className="font-mono text-[10px]">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
