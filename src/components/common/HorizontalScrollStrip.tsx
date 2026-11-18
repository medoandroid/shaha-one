// DevMeDoAnDrOiD
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollStripProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  stepPx?: number;
  ariaLabel?: string;
}

export const HorizontalScrollStrip: React.FC<HorizontalScrollStripProps> = ({
  children,
  className = '',
  contentClassName = '',
  stepPx = 280,
  ariaLabel
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isRtlRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const dragStateRef = useRef<{ active: boolean; startX: number; scrollLeft: number; moved: boolean }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false
  });
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const measureScrollButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 4) {
      setCanScrollStart(prev => (prev ? false : prev));
      setCanScrollEnd(prev => (prev ? false : prev));
      return;
    }
    const isRtl = isRtlRef.current;
    const pos = Math.abs(el.scrollLeft);
    const nextStart = isRtl ? pos > 4 : el.scrollLeft > 4;
    const nextEnd = isRtl ? pos < maxScroll - 4 : el.scrollLeft < maxScroll - 4;
    setCanScrollStart(prev => (prev === nextStart ? prev : nextStart));
    setCanScrollEnd(prev => (prev === nextEnd ? prev : nextEnd));
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      measureScrollButtons();
    });
  }, [measureScrollButtons]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    isRtlRef.current = window.getComputedStyle(el).direction === 'rtl';
    scheduleMeasure();

    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(el);
    const mo = new MutationObserver(scheduleMeasure);
    mo.observe(el, { childList: true });
    el.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [scheduleMeasure]);

  const scrollByDirection = (direction: 'start' | 'end') => {
    const el = scrollerRef.current;
    if (!el) return;
    const isRtl = isRtlRef.current;
    const sign = direction === 'end' ? (isRtl ? -1 : 1) : (isRtl ? 1 : -1);
    el.scrollBy({ left: sign * stepPx, behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el || el.scrollWidth <= el.clientWidth + 4) return;
    dragStateRef.current = {
      active: true,
      startX: e.pageX,
      scrollLeft: el.scrollLeft,
      moved: false
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.active || !scrollerRef.current) return;
    const delta = e.pageX - state.startX;
    if (Math.abs(delta) > 5) {
      state.moved = true;
      setIsDragging(true);
      scrollerRef.current.scrollLeft = state.scrollLeft - delta;
    }
  };

  const endDrag = () => {
    if (dragStateRef.current.active) {
      dragStateRef.current.active = false;
      setTimeout(() => {
        dragStateRef.current.moved = false;
        setIsDragging(false);
      }, 0);
    }
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStateRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={`relative group/hscroll ${className}`}>
      {canScrollStart && (
        <button
          type="button"
          onClick={() => scrollByDirection('start')}
          aria-label="التمرير لليمين"
          title="التمرير لليمين"
          className="hidden md:flex items-center justify-center absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollerRef}
        aria-label={ariaLabel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onClickCapture={handleClickCapture}
        className={`overflow-x-auto desktop-scroll-rail scroll-smooth ${
          isDragging ? 'cursor-grabbing select-none' : ''
        } ${contentClassName}`}
      >
        {children}
      </div>

      {canScrollEnd && (
        <button
          type="button"
          onClick={() => scrollByDirection('end')}
          aria-label="التمرير لليسار"
          title="التمرير لليسار"
          className="hidden md:flex items-center justify-center absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
