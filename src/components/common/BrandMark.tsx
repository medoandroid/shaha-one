import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withRing?: boolean;
}

const sizeMap = {
  sm: 'w-9 h-9 rounded-xl',
  md: 'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl',
  lg: 'w-14 h-14 rounded-2xl'
} as const;

/**
 * SHAHA ONE brand mark.
 * A geometric date-palm crown over the Nile, carrying the Arabic letter «ش».
 * Rendered as an inline SVG so it stays crisp, offline-friendly and themeable.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', className = '', withRing = false }) => {
  return (
    <span
      className={`relative inline-flex items-center justify-center bg-gradient-to-br from-blue-800 via-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-900/20 shrink-0 ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="w-[72%] h-[72%]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 7c-4.6 4.8-7 9.4-7 14h14c0-4.6-2.4-9.2-7-14Z"
          fill="currentColor"
          fillOpacity="0.22"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M24 21v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M12.5 30.5c3.8 3 7.6 3 11.5 0 3.9-3 7.7-3 11.5 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12.5 37c3.8 3 7.6 3 11.5 0 3.9-3 7.7-3 11.5 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />
        <circle cx="38.5" cy="11" r="2.6" fill="#fbbf24" />
      </svg>
      {withRing && (
        <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-black text-white">
          ✓
        </span>
      )}
    </span>
  );
};
