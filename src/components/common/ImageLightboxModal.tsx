import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Download, Maximize2 } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between text-white p-3 mb-2 bg-slate-900/60 rounded-2xl backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono bg-white/10 px-2.5 py-1 rounded-lg">
              {currentIndex + 1} / {images.length}
            </span>
            {title && (
              <span className="text-xs font-bold truncate max-w-xs sm:max-w-md">
                {title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentImage}
              download="shaha-photo.jpg"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="تحميل الصورة"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 transition-colors text-white cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image View */}
        <div className="relative w-full flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900 border border-slate-800">
          <img
            src={currentImage}
            alt={title || 'معاينة الصورة'}
            className="max-h-[75vh] w-auto max-w-full object-contain select-none"
          />

          {/* Navigation Arrows if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-all cursor-pointer shadow-lg active:scale-95"
                aria-label="السابق"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-all cursor-pointer shadow-lg active:scale-95"
                aria-label="التالي"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails strip */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto p-1.5 max-w-full bg-slate-900/60 rounded-2xl">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentIndex === idx ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
