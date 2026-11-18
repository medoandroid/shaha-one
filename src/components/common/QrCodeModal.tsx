import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  QrCode,
  Palette,
  ExternalLink,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { Listing } from '../../types';
import { useDirectory } from '../../context/DirectoryContext';
import { escapeHtml } from '../../lib/security';

interface QrCodeModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const QR_COLOR_PRESETS = [
  { id: 'blue', label: 'أزرق شها الملكي', dark: '#1d4ed8', light: '#ffffff' },
  { id: 'emerald', label: 'أخضر الوفاء', dark: '#047857', light: '#ffffff' },
  { id: 'dark', label: 'أسود كلاسيكي', dark: '#0f172a', light: '#ffffff' },
  { id: 'purple', label: 'بنفسجي تواصل', dark: '#6d28d9', light: '#ffffff' },
  { id: 'amber', label: 'عنبر العروض', dark: '#b45309', light: '#ffffff' }
];

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  listing,
  isOpen,
  onClose,
  onShowToast
}) => {
  const { recordListingShare } = useDirectory();
  const [selectedColor, setSelectedColor] = useState(QR_COLOR_PRESETS[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const permalink = listing
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${typeof window !== 'undefined' ? window.location.pathname : ''}?listing=${listing.id}`
    : '';

  useEffect(() => {
    if (!isOpen || !listing || !permalink) return;

    let isSubscribed = true;
    setIsGenerating(true);

    QRCode.toDataURL(permalink, {
      width: 380,
      margin: 2,
      color: {
        dark: selectedColor.dark,
        light: selectedColor.light
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => {
        if (isSubscribed) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch(err => {
        console.error('Failed to generate QR code', err);
        setIsGenerating(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, listing?.id, permalink, selectedColor]);

  if (!isOpen || !listing) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(permalink);
    setCopiedLink(true);
    recordListingShare(listing.id);
    if (onShowToast) {
      onShowToast(`تم نسخ الرابط الدائم لـ «${listing.name}» بنجاح!`, 'success');
    }
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = () => {
    recordListingShare(listing.id);
    if (navigator.share) {
      navigator.share({
        title: `${listing.name} | SHAHA ONE - شها ون`,
        text: `تواصل مع ${listing.name} (${listing.titleOrSpecialty || ''}) - هاتف: ${listing.phone} - شها، مركز المنصورة`,
        url: permalink
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  // Download high-resolution branded printable card
  const handleDownloadCard = () => {
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 800;
    cardCanvas.height = 1050;
    const ctx = cardCanvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 1050);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.35, '#1e293b');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 1050);

    // Decorative Top Header
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, 0, 800, 24);

    // Platform Brand Badge
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillStyle = '#60a5fa';
    ctx.textAlign = 'center';
    ctx.fillText('SHAHA ONE | شها ون', 400, 90);

    ctx.font = 'normal 18px Cairo, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('شها كلها.. أقرب وأسهل في مكان واحد', 400, 125);

    // White Card Container for QR
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(140, 170, 520, 520, 32);
    ctx.fill();

    // Draw QR image
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 180, 210, 440, 440);

      // Listing Name & Title
      ctx.font = '900 36px Cairo, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(listing.name, 400, 750);

      if (listing.titleOrSpecialty) {
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(listing.titleOrSpecialty, 400, 795);
      }

      // Phone & Location
      ctx.font = 'bold 24px Cairo, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`هاتف: ${listing.phone} ${listing.whatsapp ? '· واتساب متاح' : ''}`, 400, 845);

      ctx.font = 'normal 20px Cairo, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(listing.address, 400, 885);

      // Footer call to action
      ctx.font = 'bold 18px Cairo, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('امسح الباركود بكاميرا هاتفك للاتصال المباشر وحفظ جهة الاتصال', 400, 960);

      ctx.font = 'normal 15px Cairo, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('shaha-directory.eg · جميع الحقوق محفوظة لأهالي قرية شها', 400, 1000);

      // Trigger download
      const link = document.createElement('a');
      link.download = `shaha_qr_${listing.name.replace(/\s+/g, '_')}.png`;
      link.href = cardCanvas.toDataURL('image/png');
      link.click();

      if (onShowToast) {
        onShowToast('تم تحميل بطاقة الـ QR عالية الدقة بنجاح!', 'success');
      }
    };
    qrImg.src = qrDataUrl;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.opener = null;
    const safeQrSrc = qrDataUrl.startsWith('data:image/') ? qrDataUrl : '';

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>بطاقة باركود: ${escapeHtml(listing.name)}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; margin: 0; background: #fff; }
            .card { max-width: 480px; margin: 0 auto; border: 3px solid #1d4ed8; border-radius: 24px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            h1 { margin: 10px 0 5px; font-size: 26px; color: #0f172a; }
            h2 { margin: 0 0 15px; font-size: 16px; color: #1d4ed8; font-weight: 600; }
            .qr-wrap { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 15px; display: inline-block; margin: 15px 0; }
            .info { font-size: 16px; font-weight: bold; margin: 8px 0; color: #334155; }
            .footer { font-size: 13px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div style="color: #1d4ed8; font-weight: bold; font-size: 15px;">SHAHA ONE | شها ون</div>
            <h1>${escapeHtml(listing.name)}</h1>
            ${listing.titleOrSpecialty ? `<h2>${escapeHtml(listing.titleOrSpecialty)}</h2>` : ''}
            <div class="qr-wrap">
              <img src="${safeQrSrc}" width="260" height="260" alt="QR" />
            </div>
            <div class="info">📞 ${escapeHtml(listing.phone)}</div>
            <div class="info">📍 ${escapeHtml(listing.address)}</div>
            <div class="footer">امسح الباركود بكاميرا الموبايل لفتح تفاصيل الخدمة والاتصال المباشر</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                رمز الاستجابة السريع (QR Code)
              </h3>
              <p className="text-xs text-slate-500">
                مشاركة وطباعة بطاقة التعريف الرقمية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display Card */}
        <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center flex flex-col items-center justify-center">
          <div className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-100">
            {isGenerating ? (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                جاري توليد الباركود...
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${listing.name}`}
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
              />
            ) : null}
          </div>

          {/* Listing Info Below QR */}
          <div className="mt-3.5 space-y-0.5">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {listing.name}
            </h4>
            {listing.titleOrSpecialty && (
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {listing.titleOrSpecialty}
              </p>
            )}
            <p className="text-xs text-slate-500 font-mono">
              هاتف: {listing.phone}
            </p>
          </div>
        </div>

        {/* Color Palette Switcher */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>لون تصميم الباركود:</span>
            </label>
            <span className="text-[11px] font-bold text-slate-500">
              {selectedColor.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {QR_COLOR_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedColor(preset)}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedColor.id === preset.id
                    ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: preset.dark }}
                />
                <span className="text-[11px] truncate">{preset.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadCard}
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل بطاقة PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>طباعة فورية</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className={`min-h-[42px] py-2 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ الرابط'}</span>
            </button>

            <button
              onClick={handleShare}
              className="min-h-[42px] py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة مباشرة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
